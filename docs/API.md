# API Reference (v1.0.0)

Base URL: `http://127.0.0.1:8087`

Auth: Bearer JWT in `Authorization` header (except `/api/auth/*`)

## Auth

### POST /api/auth/register
- Body: `{"email":"user@example.com","password":"secret123"}`
- 201 → `{ user, token, expires_at }`

### POST /api/auth/login
- Body: `{"email":"user@example.com","password":"secret123"}`
- 200 → `{ user, token, expires_at }`

### GET /api/me
- 200 → user profile

### POST /api/auth/logout
- Revokes token JTI
- 200 → `{ "status": "logged out" }`

## Time Tracking

### GET /api/tracks/
- Lists latest 100–200 entries for the current user
- 200 → `TimeEntry[]`

### POST /api/tracks/start
- Body (all optional):  
  `{"project":"Web","tags":["ui","home"],"note":"Styling","color":"#22c55e"}`
- Behavior: stops any running entry for the user, then creates a new one with `end_at = null`
- 201 → `TimeEntry`

### POST /api/tracks/stop
- Body (optional): `{"id":"<entry-id>"}`  
  If omitted, stops the latest running entry.
- 200 → updated `TimeEntry` with `end_at` set

### PATCH /api/tracks/{id}
- Body (any subset): `{"project": "...", "tags": ["..."], "note":"...", "color":"#xxxxxx"}`
- 200 → updated `TimeEntry`

### DELETE /api/tracks/{id}
- 200 → `{ "status":"deleted" }`

### TimeEntry (JSON)
```json
{
  "id": "uuid",
  "project": "string",
  "tags": ["string"],
  "note": "string",
  "color": "#rrggbb",
  "start_at": "ISO-8601",
  "end_at": "ISO-8601|null",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}

---

# 🧱 `docs/DB_SCHEMA.md`

```md
# Database Schema

## Tables

### users
- id: uuid (pk, `gen_random_uuid()`)
- email: text unique
- password_hash: text
- created_at, updated_at: timestamptz

### auth_tokens
- jti: text (unique)
- user_id: uuid (fk -> users.id)
- expires_at: timestamptz
- revoked_at: timestamptz (nullable)
- created_at, updated_at: timestamptz

### timetrac
- id: uuid (pk, `gen_random_uuid()`)
- user_id: uuid (fk -> users.id)
- project: text (nullable)
- tags: text[] (default `{}`)
- note: text (nullable)
- color: text (default `#3b82f6`)
- start_at: timestamptz (default `now()`)
- end_at: timestamptz (nullable)
- created_at, updated_at: timestamptz

## Indexes
- `idx_timetrac_user_id` on `timetrac(user_id)`
- `idx_timetrac_start_at` on `timetrac(start_at desc)`
