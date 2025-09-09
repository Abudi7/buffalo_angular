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
