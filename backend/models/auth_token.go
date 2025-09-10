/**
 * AuthToken Model - JWT Token Management Data Structure
 *
 * This package defines the AuthToken model which represents JWT tokens
 * in the authentication system. It tracks token lifecycle, expiration,
 * and revocation for secure session management.
 *
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-10
 */
package models

import "time"

/**
 * AuthToken represents a JWT token in the authentication system
 *
 * This struct defines the token management data model including:
 * - Token identification (JTI - JWT ID)
 * - User association
 * - Token lifecycle management
 * - Security and expiration tracking
 *
 * Database Fields:
 * - jti: JWT ID (unique identifier for the token)
 * - user_id: Foreign key to users table (string format)
 * - revoked_at: Timestamp when token was revoked (NULL = active)
 * - expires_at: Token expiration timestamp
 * - created_at: Token creation timestamp
 *
 * Security Features:
 * - Token revocation support for secure logout
 * - Expiration tracking for automatic cleanup
 * - JTI-based token identification
 * - User association for session management
 *
 * Usage:
 * - Created when user logs in or registers
 * - Marked as revoked when user logs out
 * - Used for token validation in middleware
 * - Supports token blacklisting for security
 *
 * Note: This model is primarily used for internal token management
 * and is not typically exposed in API responses.
 */
type AuthToken struct {
	JTI       string    `db:"jti"`        // JWT ID (unique token identifier)
	UserID    string    `db:"user_id"`    // Associated user ID
	RevokedAt time.Time `db:"revoked_at"` // Token revocation timestamp (NULL = active)
	ExpiresAt time.Time `db:"expires_at"` // Token expiration timestamp
	CreatedAt time.Time `db:"created_at"` // Token creation timestamp
}
