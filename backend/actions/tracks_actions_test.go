package actions

import (
	"net/http/httptest"
	"testing"
)

// Smoke-test protected routes wiring (no DB asserts, just 401 without token)
func Test_Tracks_RequireAuth(t *testing.T) {
	r := App()
	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/api/tracks/", nil)
	r.ServeHTTP(w, req)
	if w.Code != 401 {
		t.Fatalf("expected 401 without token, got %d", w.Code)
	}
}
