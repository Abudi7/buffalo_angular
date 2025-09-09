package actions

import (
	"net/http"
	"strings"

	"github.com/gobuffalo/buffalo"
	"github.com/gobuffalo/pop/v6"
	"github.com/gofrs/uuid"
	"backend/models"
)

const currentUserKey = "current_user"

// يتحقق من الـ Bearer Token ويحمّل المستخدم في الـ Context
func AuthRequired(next buffalo.Handler) buffalo.Handler {
	return func(c buffalo.Context) error {
		authz := c.Request().Header.Get("Authorization")
		if authz == "" || !strings.HasPrefix(authz, "Bearer ") {
			return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "missing bearer token"}))
		}
		claims, err := ParseJWT(strings.TrimPrefix(authz, "Bearer "))
		if err != nil {
			return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "invalid token"}))
		}

		tx := c.Value("tx").(*pop.Connection)

		// إذا التوكن مُلغى
		var at models.AuthToken
		if err := tx.Where("jti = ? AND revoked_at IS NOT NULL", claims.ID).First(&at); err == nil {
			return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "token revoked"}))
		}

		// تحميل المستخدم
		var u models.User
		uid, err := uuid.FromString(claims.UserID)
		if err != nil || tx.Find(&u, uid) != nil {
			return c.Render(http.StatusUnauthorized, r.JSON(map[string]string{"error": "user not found"}))
		}

		c.Set(currentUserKey, u)
		return next(c)
	}
}

// Helper يرجع المستخدم الحالي من الـ Context
func CurrentUser(c buffalo.Context) (models.User, bool) {
	if v := c.Value(currentUserKey); v != nil {
		if u, ok := v.(models.User); ok {
			return u, true
		}
	}
	return models.User{}, false
}
