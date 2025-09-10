/**
 * TimeTrac Model - Time Tracking Entry Data Structure
 *
 * This package defines the TimeTrac model which represents individual
 * time tracking entries in the application. It includes comprehensive
 * data for project tracking, location, photos, and metadata.
 *
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-10
 */
package models

import (
	"time"

	"github.com/gobuffalo/nulls"
	"github.com/gofrs/uuid"
	"github.com/lib/pq"
)

/**
 * TimeTrac represents a single time tracking entry
 *
 * This struct defines the complete time tracking data model including:
 * - Core tracking data (project, tags, notes, color)
 * - Location information (GPS coordinates and address)
 * - Media attachments (photos)
 * - Time tracking (start/end times)
 * - Metadata and ownership
 *
 * Database Fields:
 * - id: Primary key (UUID)
 * - user_id: Foreign key to users table (hidden from JSON for security)
 * - project: Project name or category
 * - tags: Array of tag strings for categorization
 * - note: Free-form text note
 * - color: Hex color code for UI theming
 * - location_lat: GPS latitude (nullable)
 * - location_lng: GPS longitude (nullable)
 * - location_addr: Human-readable address (nullable)
 * - photo_data: Base64 encoded image data (nullable)
 * - start_at: Time tracking start timestamp
 * - end_at: Time tracking end timestamp (NULL = running)
 * - created_at: Entry creation timestamp
 * - updated_at: Last modification timestamp
 *
 * Features:
 * - Supports running entries (end_at = NULL)
 * - Optional location tracking with GPS coordinates
 * - Photo attachments with base64 encoding
 * - Flexible tagging system
 * - Color-coded project organization
 *
 * JSON Serialization:
 * - User ID is hidden from JSON responses for security
 * - All other fields are included in API responses
 * - Nullable fields use nulls package for proper JSON handling
 */
type TimeTrac struct {
	ID           uuid.UUID      `db:"id"         json:"id"`               // Unique entry identifier
	UserID       uuid.UUID      `db:"user_id"    json:"-"`                // Owner user ID (hidden from JSON)
	Project      string         `db:"project"    json:"project"`          // Project name or category
	Tags         pq.StringArray `db:"tags"       json:"tags"`             // Array of tag strings
	Note         string         `db:"note"       json:"note"`             // Free-form text note
	Color        string         `db:"color"      json:"color"`            // Hex color code for UI
	LocationLat  nulls.Float64  `db:"location_lat"  json:"location_lat"`  // GPS latitude (optional)
	LocationLng  nulls.Float64  `db:"location_lng"  json:"location_lng"`  // GPS longitude (optional)
	LocationAddr nulls.String   `db:"location_addr" json:"location_addr"` // Human-readable address (optional)
	PhotoData    nulls.String   `db:"photo_data"    json:"photo_data"`    // Base64 encoded photo (optional)
	StartAt      time.Time      `db:"start_at"   json:"start_at"`         // Time tracking start
	EndAt        nulls.Time     `db:"end_at"     json:"end_at"`           // Time tracking end (NULL = running)
	CreatedAt    time.Time      `db:"created_at" json:"created_at"`       // Entry creation timestamp
	UpdatedAt    time.Time      `db:"updated_at" json:"updated_at"`       // Last modification timestamp
}

/**
 * TableName returns the database table name for the TimeTrac model
 *
 * This method is used by the Pop ORM to determine which database
 * table to use for CRUD operations on TimeTrac instances.
 *
 * @return string - The database table name
 */
func (t TimeTrac) TableName() string { return "timetrac" }
