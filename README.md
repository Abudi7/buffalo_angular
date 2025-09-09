# TimeTrac 1.0.0

Full-stack time tracking app:
- **Frontend:** Angular (standalone) + Ionic + NGXS
- **Backend:** Go (Buffalo), Pop, PostgreSQL, JWT auth

## Repo Structure

```
.
├─ backend/                 # Buffalo app
│  ├─ actions/              # Routes & handlers (auth, tracks)
│  ├─ models/               # Pop models (User, TimeTrac)
│  ├─ migrations/           # Pop/Fizz migrations
│  ├─ database.yml          # DB connections
│  └─ ...
├─ timetrac-frontend/       # Angular + Ionic SPA
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ core/           # token interceptor, time.service.ts
│  │  │  ├─ layout/         # main shell
│  │  │  └─ features/
│  │  │     ├─ auth/        # login, register
│  │  │     └─ home/        # timer UI, entries list
│  │  └─ environments/
│  └─ ...
└─ docs/
   ├─ API.md
   └─ DB_SCHEMA.md
```

## Prerequisites

- Go 1.22+
- Node 18+ (or 20+), npm or pnpm
- PostgreSQL 14+ (running locally)
- Buffalo/Pop CLI:
  ```bash
  go install github.com/gobuffalo/cli/cmd/buffalo@latest
  go install github.com/gobuffalo/pop/v6/soda@latest
  ```
- Ensure Postgres extension `pgcrypto` is allowed (we use `gen_random_uuid()`).

## Backend Setup

1) **Create DB + user** (adjust to your local setup):
```bash
createdb timetrac
psql -d timetrac -c "CREATE USER app WITH PASSWORD 'apppass'; GRANT ALL PRIVILEGES ON DATABASE timetrac TO app;"
psql -d timetrac -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```

2) **Configure `backend/database.yml`** (development):
```yml
development:
  dialect: "postgres"
  database: "timetrac"
  user: "app"
  password: "apppass"
  host: "127.0.0.1"
  port: "5432"
```

3) **Migrate**:
```bash
cd backend
GO_ENV=development buffalo pop migrate up
```

4) **Run backend**:
```bash
export JWT_SECRET="dev-secret-123"   # keep stable during dev
buffalo dev                          # serves on http://127.0.0.1:8087
```

## Frontend Setup

1) **Configure API base** in `timetrac-frontend/src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  API_BASE: 'http://127.0.0.1:8087'
};
```

2) **Install & run**:
```bash
cd timetrac-frontend
npm i
npm start   # or: ng serve
# http://localhost:4200
```

> We bootstrap Ionic via `provideIonicAngular()` and register Ionicons in `main.ts`.

## First Run

1) Register:
```bash
curl -s -X POST http://127.0.0.1:8087/api/auth/register   -H "Content-Type: application/json"   -d '{"email":"admin@example.com","password":"secret123"}'
```

2) Login (grab `token`):
```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:8087/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@example.com","password":"secret123"}' | jq -r .token)

echo $TOKEN
```

3) Sanity check:
```bash
curl -s http://127.0.0.1:8087/api/me -H "Authorization: Bearer $TOKEN"
```

4) Start/stop a timer:
```bash
curl -s -X POST http://127.0.0.1:8087/api/tracks/start   -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json"   -d '{"project":"Web","tags":["ui","home"],"note":"Styling","color":"#22c55e"}'

curl -s -X POST http://127.0.0.1:8087/api/tracks/stop   -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}'
```

## Git: initialize & push mono-repo

From the **project root** (parent of `backend` and `timetrac-frontend`):

```bash
git init
git add .
git commit -m "feat: TimeTrac 1.0.0 (Angular + Ionic + Buffalo + Postgres)"

# GitHub CLI
gh repo create timetrac --source=. --public --remote=origin --push
# or manual:
# git remote add origin https://github.com/<you>/timetrac.git
# git branch -M main
# git push -u origin main
```

## Troubleshooting

- **401/invalid token:** ensure `JWT_SECRET` didn’t change; re-login.
- **Fizz errors:** avoid array types inside `t.Column()`. We add arrays via `sql(...)`.
- **VS Code “missing metadata” in Go:** open the **`backend/`** folder as root, run `go mod tidy`, and reload window.

## License

MIT (or your choice)
