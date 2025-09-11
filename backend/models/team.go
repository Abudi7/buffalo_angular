/**
 * Team Model - Team Collaboration Data Structure
 *
 * This package defines the Team model which represents teams in the
 * TimeTrac application. It includes team management, member roles,
 * and collaboration features.
 *
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-11
 */
package models

import (
	"time"

	"github.com/gofrs/uuid"
)

/**
 * Team represents a team in the TimeTrac system
 *
 * This struct defines the complete team data model including:
 * - Unique identifier (UUID)
 * - Team name and description
 * - Team settings and preferences
 * - Metadata and timestamps
 *
 * Database Fields:
 * - id: Primary key (UUID)
 * - name: Team name
 * - description: Team description (optional)
 * - owner_id: Foreign key to users table (team owner)
 * - settings: JSON settings for team preferences
 * - created_at: Team creation timestamp
 * - updated_at: Last modification timestamp
 *
 * JSON Serialization:
 * - All fields are included in API responses
 * - Settings field contains team-specific configuration
 */
type Team struct {
	ID          uuid.UUID `db:"id" json:"id"`                   // Unique team identifier
	Name        string    `db:"name" json:"name"`               // Team name
	Description string    `db:"description" json:"description"` // Team description
	OwnerID     uuid.UUID `db:"owner_id" json:"owner_id"`       // Team owner user ID
	Settings    string    `db:"settings" json:"settings"`       // JSON settings
	CreatedAt   time.Time `db:"created_at" json:"created_at"`   // Team creation timestamp
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`   // Last modification timestamp
}

/**
 * TableName returns the database table name for the Team model
 */
func (t Team) TableName() string { return "teams" }
