# Changelog

## [1.0.0] - 2025-09-09
### Added
- **Auth:** Register, Login, JWT issuance, /api/me, Logout (revocation via `auth_tokens`)
- **Time Tracking:** 
  - Table `timetrac` (UUID pk, project, tags TEXT[], note, color, start_at, end_at, timestamps)
  - Endpoints: `GET /api/tracks/`, `POST /api/tracks/start`, `POST /api/tracks/stop`, `PATCH /api/tracks/{id}`, `DELETE /api/tracks/{id}`
  - One running entry per user (auto-stop previous on start)
- **Frontend (Angular + Ionic + NGXS):**
  - Standalone app + token interceptor + NGXS store for auth
  - Modern **MainShell** with glass header and side menu
  - **Auth** pages (Login, Register)
  - **Home** page with live timer, project/tags/note/color, and entries list

### Fixed
- Fizz migration parser issues (moved arrays & defaults to `sql(...)` statements)

### Notes
- Requires Postgres `pgcrypto` for `gen_random_uuid()`
- Keep `JWT_SECRET` stable during the session; re-login when it changes
