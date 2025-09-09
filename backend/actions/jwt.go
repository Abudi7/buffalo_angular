package actions

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID string `json:"uid"`
	jwt.RegisteredClaims
}

func jwtSecret() []byte {
	sec := os.Getenv("JWT_SECRET")
	if sec == "" {
		sec = "dev-secret"
	}
	return []byte(sec)
}

func jwtExpiry() time.Duration {
	if h := os.Getenv("JWT_EXPIRES_HOURS"); h != "" {
		if d, err := time.ParseDuration(h + "h"); err == nil {
			return d
		}
	}
	return 24 * time.Hour
}

func GenerateJWT(userID string) (token string, jti string, exp time.Time, err error) {
	jti = time.Now().UTC().Format("20060102150405.000000000") // JTI بسيط وفريد زمنياً
	exp = time.Now().Add(jwtExpiry())

	claims := JWTClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        jti,
			ExpiresAt: jwt.NewNumericDate(exp),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token, err = t.SignedString(jwtSecret())
	return
}

func ParseJWT(tokenStr string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret(), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, jwt.ErrTokenInvalidClaims
}
