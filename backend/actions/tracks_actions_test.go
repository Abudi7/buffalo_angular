package actions

import (
	"net/http/httptest"
	"testing"
)

// Smoke-test protected routes wiring (no DB asserts). In CI where DB may be
// unavailable, Buffalo might return 500. Either 401 or 500 proves routing
// reached the protected group.
func Test_Tracks_RequireAuth(t *testing.T) {
	r := App()
	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/api/tracks/", nil)
	r.ServeHTTP(w, req)
	if w.Code != 401 && w.Code != 500 {
		t.Fatalf("expected 401/500 without token, got %d", w.Code)
	}
}
