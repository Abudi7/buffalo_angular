package models

import "time"

type AuthToken struct {
	JTI       string    `db:"jti"`
	UserID    string    `db:"user_id"`
	RevokedAt time.Time `db:"revoked_at"`
	ExpiresAt time.Time `db:"expires_at"`
	CreatedAt time.Time `db:"created_at"`
}
