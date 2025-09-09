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

func mustTx(c buffalo.Context) *pop.Connection {
	return c.Value("tx").(*pop.Connection)
}

func currentUserID(c buffalo.Context) (uuid.UUID, bool) {
	if u, ok := CurrentUser(c); ok {
		return u.ID, true
	}
	return uuid.Nil, false
}

// GET /api/tracks
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

// POST /api/tracks/start
func TracksStart(c buffalo.Context) error {
	type payload struct {
		Project string   `json:"project"`
		Tags    []string `json:"tags"`
		Note    string   `json:"note"`
		Color   string   `json:"color"`
	}
	var p payload
	if err := c.Bind(&p); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]string{"error": "bad payload"}))
	}
	p.Project = strings.TrimSpace(p.Project)
	p.Color = strings.TrimSpace(p.Color)
	if p.Color == "" {
		p.Color = "#3b82f6"
	}

	tx := mustTx(c)
	uid, ok := currentUserID(c)
	if !ok {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "unauthorized"}))
	}

	// stop any running entry (optional safety)
	_ = tx.RawQuery(`UPDATE timetrac SET end_at = now(), updated_at = now() WHERE user_id = ? AND end_at IS NULL`, uid).Exec()

	item := models.TimeTrac{
		UserID:  uid,
		Project: p.Project,
		Tags:    pq.StringArray(p.Tags),
		Note:    p.Note,
		Color:   p.Color,
		StartAt: time.Now(),
		EndAt:   nulls.Time{}, // running (NULL)
	}
	if err := tx.Create(&item); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "cannot create"}))
	}
	return c.Render(http.StatusCreated, r.JSON(item))
}

// POST /api/tracks/stop  (optional body: { id })
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
	if p.ID != "" {
		id, e := uuid.FromString(p.ID)
		if e != nil {
			return c.Render(http.StatusBadRequest, r.JSON(map[string]string{"error": "bad id"}))
		}
		err = tx.Where("id = ? AND user_id = ?", id, uid).First(&item)
	} else {
		err = tx.Where("user_id = ? AND end_at IS NULL", uid).Order("start_at DESC").First(&item)
	}
	if err != nil {
		return c.Render(http.StatusNotFound, r.JSON(map[string]string{"error": "no running entry"}))
	}

	now := time.Now()
	item.EndAt = nulls.NewTime(now)
	item.UpdatedAt = now

	if err := tx.Update(&item); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "cannot stop"}))
	}
	return c.Render(http.StatusOK, r.JSON(item))
}

// PATCH /api/tracks/{id}
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

	var item models.TimeTrac
	if err := tx.Where("id = ? AND user_id = ?", id, uid).First(&item); err != nil {
		return c.Render(http.StatusNotFound, r.JSON(map[string]string{"error": "not found"}))
	}

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

// DELETE /api/tracks/{id}
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

	_, err = tx.Store.Exec(`DELETE FROM timetrac WHERE id = $1 AND user_id = $2`, id, uid)
	if err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "cannot delete"}))
	}
	return c.Render(http.StatusOK, r.JSON(map[string]string{"status": "deleted"}))
}
