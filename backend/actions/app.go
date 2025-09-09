// actions/app.go
package actions

import (
	"sync"

	"backend/locales"
	"backend/models"

	"github.com/gobuffalo/buffalo"
	"github.com/gobuffalo/buffalo-pop/v3/pop/popmw"
	"github.com/gobuffalo/envy"
	"github.com/gobuffalo/middleware/contenttype"
	"github.com/gobuffalo/middleware/forcessl"
	"github.com/gobuffalo/middleware/i18n"
	"github.com/gobuffalo/middleware/paramlogger"
	"github.com/gobuffalo/x/sessions"
	"github.com/rs/cors"
	"github.com/unrolled/secure"
)

var ENV = envy.Get("GO_ENV", "development")

var (
	app     *buffalo.App
	appOnce sync.Once
	T       *i18n.Translator
)

func App() *buffalo.App {
	appOnce.Do(func() {

		// ✅ Strong CORS configuration for Ionic dev server
		c := cors.New(cors.Options{
			AllowedOrigins: []string{
				"http://localhost:8100",
				"http://127.0.0.1:8100",
				// For mobile builds later:
				"capacitor://localhost",
				"ionic://localhost",
			  },
			AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
			AllowedHeaders:   []string{"Authorization", "Content-Type"},
			ExposedHeaders:   []string{"Content-Type"},
			AllowCredentials: true, // ok even if you don't use cookies
		})

		app = buffalo.New(buffalo.Options{
			Env:          ENV,
			SessionStore: sessions.Null{},
			PreWares: []buffalo.PreWare{
				c.Handler, // ✅ handle preflight before Buffalo routes/middleware
			},
			SessionName: "_backend_session",
		})

		// HTTPS in production
		app.Use(forceSSL())

		// JSON API
		app.Use(contenttype.Set("application/json"))
		app.Use(paramlogger.ParameterLogger)

		// i18n (optional)
		app.Use(translations())

		// DB transaction per request
		app.Use(popmw.Transaction(models.DB))

		app.GET("/", HomeHandler)

		// Public auth
		auth := app.Group("/api/auth")
		auth.POST("/register", Register)
		auth.POST("/login", Login)

		// Protected
		api := app.Group("/api")
		api.Use(AuthRequired)
		api.GET("/me", Me)
		api.POST("/logout", Logout)
		
		// Time tracking (protected)
		tracks := api.Group("/tracks")
		tracks.GET("/", TracksIndex)
		tracks.POST("/start", TracksStart)
		tracks.POST("/stop", TracksStop)
		tracks.PATCH("/{id}", TracksUpdate)
		tracks.DELETE("/{id}", TracksDelete)

		// (Optional) DEV helper: catch-all OPTIONS, if you still see preflight issues
		// app.Options("/{ignored:.+}", func(c buffalo.Context) error {
		// 	return c.Render(204, r.JSON(nil))
		// })
	})

	return app
}

func translations() buffalo.MiddlewareFunc {
	var err error
	if T, err = i18n.New(locales.FS(), "en-US"); err != nil {
		app.Stop(err)
	}
	return T.Middleware()
}

func forceSSL() buffalo.MiddlewareFunc {
	return forcessl.Middleware(secure.Options{
		SSLRedirect:     ENV == "production",
		SSLProxyHeaders: map[string]string{"X-Forwarded-Proto": "https"},
	})
}
