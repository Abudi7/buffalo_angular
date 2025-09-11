/**
 * TimeTrac Actions - Time Tracking API Endpoints
 *
 * This package handles all time tracking related API endpoints including:
 * - Starting time entries with location and photo data
 * - Stopping time entries
 * - Updating existing entries
 * - Deleting entries
 * - Listing user's time entries
 *
 * All endpoints require authentication via JWT token.
 *
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-10
 */
package actions

import (
	"net/http"
	"strings"
	"time"

	"backend/models"

	"github.com/gobuffalo/buffalo"
	"github.com/gobuffalo/nulls"
	"github.com/gobuffalo/pop/v6"
	"github.com/gofrs/uuid"
	"github.com/lib/pq"
)

/**
 * mustTx extracts the database transaction from the Buffalo context
 *
 * This is a helper function that safely extracts the database transaction
 * that was set by the popmw.Transaction middleware. It panics if the
 * transaction is not found, which should never happen in normal operation.
 *
 * @param c - Buffalo context containing the database transaction
 * @return *pop.Connection - Database transaction connection
 */
func mustTx(c buffalo.Context) *pop.Connection {
	return c.Value("tx").(*pop.Connection)
}

/**
 * currentUserID extracts the current user's ID from the authenticated context
 *
 * This helper function safely extracts the user ID from the authenticated
 * user context. It returns uuid.Nil and false if no user is authenticated.
 *
 * @param c - Buffalo context containing the authenticated user
 * @return uuid.UUID - User ID if authenticated, uuid.Nil otherwise
 * @return bool - True if user is authenticated, false otherwise
 */
func currentUserID(c buffalo.Context) (uuid.UUID, bool) {
	if u, ok := CurrentUser(c); ok {
		return u.ID, true
	}
	return uuid.Nil, false
}

/**
 * TracksIndex retrieves all time tracking entries for the authenticated user
 *
 * GET /api/tracks
 *
 * This endpoint returns a paginated list of time tracking entries for the
 * authenticated user, ordered by start time (most recent first).
 *
 * Features:
 * - Returns up to 200 most recent entries
 * - Includes all entry data (project, tags, notes, location, photos)
 * - Automatically filters by authenticated user
 *
 * @param c - Buffalo context with authenticated user
 * @return JSON array of TimeTrac entries or error response
 */
func TracksIndex(c buffalo.Context) error {
	tx := mustTx(c)
	uid, ok := currentUserID(c)
	if !ok {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "unauthorized"}))
	}

	var list []models.TimeTrac
	if err := tx.Where("user_id = ?", uid).
		Order("start_at DESC").
		Limit(200).
		All(&list); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "db error"}))
	}
	return c.Render(http.StatusOK, r.JSON(list))
}

/**
 * TracksStart creates a new time tracking entry and starts the timer
 *
 * POST /api/tracks/start
 *
 * This endpoint creates a new time tracking entry with optional location data,
 * photo attachments, and metadata. It automatically stops any currently
 * running entry for the user before starting a new one.
 *
 * Payload:
 * - project: Project name (optional)
 * - tags: Array of tag strings (optional)
 * - note: Text note (optional)
 * - color: Hex color code (defaults to #3b82f6)
 * - location_lat: GPS latitude (optional)
 * - location_lng: GPS longitude (optional)
 * - location_addr: Human-readable address (optional)
 * - photo_data: Base64 encoded image data (optional)
 *
 * @param c - Buffalo context with authenticated user
 * @return JSON TimeTrac entry or error response
 */
func TracksStart(c buffalo.Context) error {
	type payload struct {
		Project      string   `json:"project"`
		Tags         []string `json:"tags"`
		Note         string   `json:"note"`
		Color        string   `json:"color"`
		LocationLat  *float64 `json:"location_lat"`
		LocationLng  *float64 `json:"location_lng"`
		LocationAddr *string  `json:"location_addr"`
		PhotoData    *string  `json:"photo_data"`
	}
	var p payload
	if err := c.Bind(&p); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]string{"error": "bad payload"}))
	}

	// Sanitize and validate input data
	p.Project = strings.TrimSpace(p.Project)
	p.Color = strings.TrimSpace(p.Color)
	if p.Color == "" {
		p.Color = "#3b82f6" // Default blue color
	}

	tx := mustTx(c)
	uid, ok := currentUserID(c)
	if !ok {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "unauthorized"}))
	}

	// Safety measure: stop any currently running entry for this user
	_ = tx.RawQuery(`UPDATE timetrac SET end_at = now(), updated_at = now() WHERE user_id = ? AND end_at IS NULL`, uid).Exec()

	// Create new time tracking entry
	item := models.TimeTrac{
		UserID:  uid,
		Project: p.Project,
		Tags:    pq.StringArray(p.Tags),
		Note:    p.Note,
		Color:   p.Color,
		StartAt: time.Now(),
		EndAt:   nulls.Time{}, // NULL indicates running entry
	}

	// Add optional location data if provided
	if p.LocationLat != nil {
		item.LocationLat = nulls.NewFloat64(*p.LocationLat)
	}
	if p.LocationLng != nil {
		item.LocationLng = nulls.NewFloat64(*p.LocationLng)
	}
	if p.LocationAddr != nil {
		item.LocationAddr = nulls.NewString(strings.TrimSpace(*p.LocationAddr))
	}

	// Add optional photo data if provided
	if p.PhotoData != nil {
		item.PhotoData = nulls.NewString(*p.PhotoData)
	}

	if err := tx.Create(&item); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "cannot create"}))
	}
	return c.Render(http.StatusCreated, r.JSON(item))
}

/**
 * TracksStop stops a running time tracking entry
 *
 * POST /api/tracks/stop
 *
 * This endpoint stops a time tracking entry by setting the end_at timestamp.
 * It can stop a specific entry by ID or the most recent running entry.
 *
 * Payload (optional):
 * - id: Specific entry ID to stop (if not provided, stops most recent running entry)
 *
 * Behavior:
 * - If ID is provided: stops the specific entry (must belong to user)
 * - If no ID: stops the most recent running entry for the user
 * - Sets end_at to current timestamp
 * - Updates the updated_at field
 *
 * @param c - Buffalo context with authenticated user
 * @return JSON updated TimeTrac entry or error response
 */
func TracksStop(c buffalo.Context) error {
	type payload struct {
		ID string `json:"id"`
	}
	var p payload
	_ = c.Bind(&p)

	tx := mustTx(c)
	uid, ok := currentUserID(c)
	if !ok {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "unauthorized"}))
	}

	var item models.TimeTrac
	var err error

	// Handle specific entry ID or most recent running entry
	if p.ID != "" {
		// Stop specific entry by ID
		id, e := uuid.FromString(p.ID)
		if e != nil {
			return c.Render(http.StatusBadRequest, r.JSON(map[string]string{"error": "bad id"}))
		}
		err = tx.Where("id = ? AND user_id = ?", id, uid).First(&item)
	} else {
		// Stop most recent running entry
		err = tx.Where("user_id = ? AND end_at IS NULL", uid).Order("start_at DESC").First(&item)
	}

	if err != nil {
		return c.Render(http.StatusNotFound, r.JSON(map[string]string{"error": "no running entry"}))
	}

	// Update entry with end time
	now := time.Now()
	item.EndAt = nulls.NewTime(now)
	item.UpdatedAt = now

	if err := tx.Update(&item); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "cannot stop"}))
	}
	return c.Render(http.StatusOK, r.JSON(item))
}

/**
 * TracksUpdate modifies an existing time tracking entry
 *
 * PATCH /api/tracks/{id}
 *
 * This endpoint allows partial updates to an existing time tracking entry.
 * Only the fields provided in the payload will be updated.
 *
 * URL Parameters:
 * - id: UUID of the time tracking entry to update
 *
 * Payload (all fields optional):
 * - project: New project name
 * - tags: New array of tag strings
 * - note: New text note
 * - color: New hex color code
 *
 * Security:
 * - Only the owner of the entry can update it
 * - Entry must exist and belong to the authenticated user
 *
 * @param c - Buffalo context with authenticated user and entry ID
 * @return JSON updated TimeTrac entry or error response
 */
func TracksUpdate(c buffalo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.FromString(idStr)
	if err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]string{"error": "bad id"}))
	}

	type payload struct {
		Project *string   `json:"project"`
		Tags    *[]string `json:"tags"`
		Note    *string   `json:"note"`
		Color   *string   `json:"color"`
	}
	var p payload
	if err := c.Bind(&p); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]string{"error": "bad payload"}))
	}

	tx := mustTx(c)
	uid, ok := currentUserID(c)
	if !ok {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "unauthorized"}))
	}

	// Find the entry and verify ownership
	var item models.TimeTrac
	if err := tx.Where("id = ? AND user_id = ?", id, uid).First(&item); err != nil {
		return c.Render(http.StatusNotFound, r.JSON(map[string]string{"error": "not found"}))
	}

	// Apply partial updates only for provided fields
	if p.Project != nil {
		item.Project = strings.TrimSpace(*p.Project)
	}
	if p.Tags != nil {
		item.Tags = pq.StringArray(*p.Tags)
	}
	if p.Note != nil {
		item.Note = *p.Note
	}
	if p.Color != nil && strings.TrimSpace(*p.Color) != "" {
		item.Color = strings.TrimSpace(*p.Color)
	}
	item.UpdatedAt = time.Now()

	if err := tx.Update(&item); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "cannot update"}))
	}
	return c.Render(http.StatusOK, r.JSON(item))
}

/**
 * TracksDelete permanently removes a time tracking entry
 *
 * DELETE /api/tracks/{id}
 *
 * This endpoint permanently deletes a time tracking entry from the database.
 * The deletion is irreversible and only affects entries owned by the authenticated user.
 *
 * URL Parameters:
 * - id: UUID of the time tracking entry to delete
 *
 * Security:
 * - Only the owner of the entry can delete it
 * - Uses direct SQL query for efficient deletion
 * - Validates UUID format before processing
 *
 * @param c - Buffalo context with authenticated user and entry ID
 * @return JSON success message or error response
 */
func TracksDelete(c buffalo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.FromString(idStr)
	if err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]string{"error": "bad id"}))
	}

	tx := mustTx(c)
	uid, ok := currentUserID(c)
	if !ok {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "unauthorized"}))
	}

	// Direct SQL deletion for efficiency with ownership check
	result, err := tx.Store.Exec(`DELETE FROM timetrac WHERE id = $1 AND user_id = $2`, id, uid)
	if err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "cannot delete"}))
	}

	// Check if any rows were actually deleted
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "cannot check deletion"}))
	}

	if rowsAffected == 0 {
		return c.Render(http.StatusNotFound, r.JSON(map[string]string{"error": "not found"}))
	}

	return c.Render(http.StatusOK, r.JSON(map[string]string{"status": "deleted"}))
}
