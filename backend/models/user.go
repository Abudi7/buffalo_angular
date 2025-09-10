/**
 * User Model - User Account Data Structure
 *
 * This package defines the User model which represents user accounts
 * in the TimeTrac application. It includes authentication data and
 * metadata for user management.
 *
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-10
 */
package models

import (
	"time"

	"github.com/gofrs/uuid"
)

/**
 * User represents a user account in the TimeTrac system
 *
 * This struct defines the complete user data model including:
 * - Unique identifier (UUID)
 * - Authentication credentials
 * - Account metadata and timestamps
 *
 * Database Fields:
 * - id: Primary key (UUID)
 * - email: User's email address (unique, indexed)
 * - password_hash: Bcrypt hashed password (not exposed in JSON)
 * - created_at: Account creation timestamp
 * - updated_at: Last modification timestamp
 *
 * JSON Serialization:
 * - Password hash is excluded from JSON responses for security
 * - All other fields are included in API responses
 *
 * Security Considerations:
 * - Password is stored as bcrypt hash, never as plain text
 * - Email is used as the primary login identifier
 * - UUID provides secure, non-sequential user identification
 */
type User struct {
	ID           uuid.UUID `db:"id" json:"id"`                 // Unique user identifier
	Email        string    `db:"email" json:"email"`           // User's email address (login)
	PasswordHash string    `db:"password_hash" json:"-"`       // Bcrypt hashed password (hidden from JSON)
	CreatedAt    time.Time `db:"created_at" json:"created_at"` // Account creation timestamp
	UpdatedAt    time.Time `db:"updated_at" json:"updated_at"` // Last modification timestamp
}
