package actions

import (
	"net/http"
	"strings"
	"time"

	"github.com/gobuffalo/buffalo"
	"github.com/gobuffalo/pop/v6"
	"github.com/gofrs/uuid"
	"golang.org/x/crypto/bcrypt"
	"backend/models"
)

// POST /api/auth/register
func Register(c buffalo.Context) error {
	type payload struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	var p payload
	if err := c.Bind(&p); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]string{"error": "bad payload"}))
	}
	p.Email = strings.TrimSpace(strings.ToLower(p.Email))
	if p.Email == "" || len(p.Password) < 6 {
		return c.Render(http.StatusUnprocessableEntity, r.JSON(map[string]string{"error": "email or password invalid"}))
	}

	tx := c.Value("tx").(*pop.Connection)

	// unique email
	var exists models.User
	if err := tx.Where("email = ?", p.Email).First(&exists); err == nil {
		return c.Render(http.StatusConflict, r.JSON(map[string]string{"error": "email already in use"}))
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(p.Password), bcrypt.DefaultCost)

	uid, _ := uuid.NewV4()
	u := models.User{
		ID:           uid,
		Email:        p.Email,
		PasswordHash: string(hash),
	}

	if err := tx.Create(&u); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "cannot create user"}))
	}

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

// POST /api/auth/login
func Login(c buffalo.Context) error {
	type payload struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	var p payload
	if err := c.Bind(&p); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]string{"error": "bad payload"}))
	}
	p.Email = strings.TrimSpace(strings.ToLower(p.Email))

	tx := c.Value("tx").(*pop.Connection)
	var u models.User
	if err := tx.Where("email = ?", p.Email).First(&u); err != nil {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "invalid credentials"}))
	}
	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(p.Password)) != nil {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "invalid credentials"}))
	}

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

// GET /api/me (AuthRequired)
func Me(c buffalo.Context) error {
	if u, ok := CurrentUser(c); ok {
		return c.Render(http.StatusOK, r.JSON(u))
	}
	return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "unauthorized"}))
}

// POST /api/auth/logout (AuthRequired)
func Logout(c buffalo.Context) error {
	authz := c.Request().Header.Get("Authorization")
	if authz == "" || !strings.HasPrefix(authz, "Bearer ") {
	  return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "missing token"}))
	}
  
	claims, err := ParseJWT(strings.TrimPrefix(authz, "Bearer "))
	if err != nil {
	  return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "invalid token"}))
	}
  
	// لو exp غير موجود بالتوكن، عيّن واحد افتراضي
	exp := time.Now().Add(jwtExpiry())
	if claims.ExpiresAt != nil {
	  exp = claims.ExpiresAt.Time
	}
  
	tx, ok := c.Value("tx").(*pop.Connection)
	if !ok || tx == nil {
	  return c.Render(http.StatusInternalServerError, r.JSON(map[string]string{"error": "db transaction missing"}))
	}
  
	// استخدم claims.ID كـ jti و claims.UserID كـ user_id
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
