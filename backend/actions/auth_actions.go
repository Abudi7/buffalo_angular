/**
 * Authentication Actions - User Authentication API Endpoints
 *
 * This package handles all user authentication related API endpoints including:
 * - User registration with email/password validation
 * - User login with credential verification
 * - JWT token generation and management
 * - User profile retrieval
 * - Secure logout with token revocation
 *
 * Security Features:
 * - Password hashing with bcrypt
 * - JWT token generation with expiration
 * - Token blacklisting on logout
 * - Input validation and sanitization
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
	"github.com/gobuffalo/pop/v6"
	"github.com/gofrs/uuid"
	"golang.org/x/crypto/bcrypt"
)

/**
 * Register creates a new user account with email and password
 *
 * POST /api/auth/register
 *
 * This endpoint creates a new user account with the provided email and password.
 * It performs validation, checks for duplicate emails, hashes the password,
 * and immediately generates a JWT token for the new user.
 *
 * Payload:
 * - email: User's email address (will be normalized to lowercase)
 * - password: User's password (minimum 6 characters)
 *
 * Validation:
 * - Email must be valid and not empty
 * - Password must be at least 6 characters
 * - Email must be unique (not already registered)
 *
 * Response:
 * - Returns user object, JWT token, and expiration time
 * - Token is automatically stored in auth_tokens table
 *
 * @param c - Buffalo context with registration payload
 * @return JSON user data with JWT token or error response
 */
func Register(c buffalo.Context) error {
	type payload struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	var p payload
	if err := c.Bind(&p); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]string{"error": "bad payload"}))
	}

	// Normalize and validate email
	p.Email = strings.TrimSpace(strings.ToLower(p.Email))
	if p.Email == "" || len(p.Password) < 6 {
		return c.Render(http.StatusUnprocessableEntity, r.JSON(map[string]string{"error": "email or password invalid"}))
	}

	tx := c.Value("tx").(*pop.Connection)

	// Check for existing user with same email
	var exists models.User
	if err := tx.Where("email = ?", p.Email).First(&exists); err == nil {
		return c.Render(http.StatusConflict, r.JSON(map[string]string{"error": "email already in use"}))
	}

	// Hash password with bcrypt
	hash, _ := bcrypt.GenerateFromPassword([]byte(p.Password), bcrypt.DefaultCost)

	// Create new user
	uid, _ := uuid.NewV4()
	u := models.User{
		ID:           uid,
		Email:        p.Email,
		PasswordHash: string(hash),
	}

	if err := tx.Create(&u); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "cannot create user"}))
	}

	// Generate JWT token for immediate login
	token, jti, exp, _ := GenerateJWT(u.ID.String())
	_ = tx.RawQuery(`
		INSERT INTO auth_tokens (jti, user_id, expires_at, created_at)
		VALUES (?, ?, ?, now())
	`, jti, u.ID.String(), exp).Exec()

	return c.Render(http.StatusCreated, r.JSON(map[string]any{
		"user":       u,
		"token":      token,
		"expires_at": exp,
	}))
}

/**
 * Login authenticates a user with email and password
 *
 * POST /api/auth/login
 *
 * This endpoint authenticates a user by verifying their email and password.
 * Upon successful authentication, it generates a new JWT token and stores
 * it in the auth_tokens table for session management.
 *
 * Payload:
 * - email: User's email address (will be normalized to lowercase)
 * - password: User's plain text password
 *
 * Authentication Process:
 * - Normalizes email to lowercase
 * - Looks up user by email
 * - Verifies password using bcrypt
 * - Generates new JWT token
 * - Stores token in database
 *
 * Security:
 * - Uses bcrypt for password verification
 * - Returns generic "invalid credentials" for both wrong email and password
 * - Generates new token on each login (token rotation)
 *
 * @param c - Buffalo context with login payload
 * @return JSON user data with JWT token or error response
 */
func Login(c buffalo.Context) error {
	type payload struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	var p payload
	if err := c.Bind(&p); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]string{"error": "bad payload"}))
	}

	// Normalize email for consistent lookup
	p.Email = strings.TrimSpace(strings.ToLower(p.Email))

	tx := c.Value("tx").(*pop.Connection)

	// Find user by email
	var u models.User
	if err := tx.Where("email = ?", p.Email).First(&u); err != nil {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "invalid credentials"}))
	}

	// Verify password using bcrypt
	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(p.Password)) != nil {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "invalid credentials"}))
	}

	// Generate new JWT token for this session
	token, jti, exp, _ := GenerateJWT(u.ID.String())
	if err := tx.RawQuery(`
	INSERT INTO auth_tokens (jti, user_id, expires_at, created_at, updated_at)
	VALUES (?, ?, ?, now(), now())
	`, jti, u.ID, exp).Exec(); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "cannot persist token"}))
	}

	return c.Render(http.StatusOK, r.JSON(map[string]any{
		"user":       u,
		"token":      token,
		"expires_at": exp,
	}))
}

/**
 * Me returns the current authenticated user's profile information
 *
 * GET /api/me
 *
 * This endpoint returns the profile information of the currently authenticated user.
 * It requires a valid JWT token in the Authorization header.
 *
 * Authentication:
 * - Requires valid JWT token in Authorization header
 * - Token must not be expired or revoked
 * - User must exist in the database
 *
 * Response:
 * - Returns complete user object (excluding password hash)
 * - Includes user ID, email, and timestamps
 *
 * @param c - Buffalo context with authenticated user
 * @return JSON user profile or unauthorized error
 */
func Me(c buffalo.Context) error {
	if u, ok := CurrentUser(c); ok {
		return c.Render(http.StatusOK, r.JSON(u))
	}
	return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "unauthorized"}))
}

/**
 * Logout invalidates the current JWT token and ends the user session
 *
 * POST /api/logout
 *
 * This endpoint securely logs out the user by revoking their JWT token.
 * The token is marked as revoked in the auth_tokens table, preventing
 * its future use even if it hasn't expired yet.
 *
 * Authentication:
 * - Requires valid JWT token in Authorization header
 * - Token must be in "Bearer <token>" format
 *
 * Process:
 * - Extracts JWT token from Authorization header
 * - Parses and validates the token
 * - Marks token as revoked in database
 * - Uses UPSERT to handle existing token records
 *
 * Security:
 * - Token revocation prevents reuse even if stolen
 * - Handles both new and existing token records
 * - Graceful error handling for malformed tokens
 *
 * @param c - Buffalo context with JWT token
 * @return JSON success message or error response
 */
func Logout(c buffalo.Context) error {
	authz := c.Request().Header.Get("Authorization")
	if authz == "" || !strings.HasPrefix(authz, "Bearer ") {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "missing token"}))
	}

	// Parse and validate JWT token
	claims, err := ParseJWT(strings.TrimPrefix(authz, "Bearer "))
	if err != nil {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "invalid token"}))
	}

	// Use token expiration time or set default if missing
	exp := time.Now().Add(jwtExpiry())
	if claims.ExpiresAt != nil {
		exp = claims.ExpiresAt.Time
	}

	// Get database transaction
	tx, ok := c.Value("tx").(*pop.Connection)
	if !ok || tx == nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "db transaction missing"}))
	}

	// Revoke token by marking it as revoked in database
	// Uses UPSERT to handle both new and existing token records
	if err := tx.RawQuery(`
	  INSERT INTO auth_tokens (jti, user_id, revoked_at, expires_at, created_at, updated_at)
	  VALUES (?, ?, now(), ?, now(), now())
	  ON CONFLICT (jti) DO UPDATE
		SET revoked_at = EXCLUDED.revoked_at,
			expires_at = EXCLUDED.expires_at,
			updated_at = now()
	`, claims.ID, claims.UserID, exp).Exec(); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "logout failed"}))
	}

	return c.Render(http.StatusOK, r.JSON(map[string]string{"status": "logged out"}))
}
