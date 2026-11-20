# Vemtap (monorepo)

One repository, two apps:

| Workspace | Path      | Stack                                   | Port |
| --------- | --------- | --------------------------------------- | ---- |
| `vemtap-web` (root) | `src/`    | React + Vite + TypeScript + Tailwind    | 5173 |
| `@vemtap/backend`   | `backend/` | NestJS + TypeORM (PostgreSQL) + Socket.IO | 3002 |

npm workspaces ties them together: a single `npm install` at the repo root
installs both apps, and the root scripts start them together.

## Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL listening on `localhost:5432` (database `vemtap`, user `postgres`)
  — connection settings live in `backend/.env`
- Redis on `redis://localhost:6379` is **optional**: if it is not running the
  API boots with an in-memory cache instead (a warning is logged)

## Setup (first run)

```bash
npm install                 # installs root + backend workspaces

npm run migration:run       # create the schema (backend TypeORM migrations)
npm run seed                # seed reference/demo data
npm run seed --workspace... # see backend/package.json for more seeds
```

## Start everything

```bash
npm run dev                 # web (5173) + api (3002), one terminal
```

Individually:

```bash
npm run dev:web             # Vite only
npm run dev:api             # NestJS watch mode only
npm run dev:lan             # Vite over HTTPS on the LAN, proxying /api + sockets
```

- Web app: <http://localhost:5173>
- API: <http://localhost:3002/api/v1>
- Swagger: <http://localhost:3002/api-docs>

## Wiring

- Root `.env` → `VITE_API_BASE_URL=http://localhost:3002/api` makes the web app
  call the local API (REST + socket.io derive from the same value).
- `backend/.env` → `PORT=3002` matches the frontend and the Vite proxy target.
- `.env` files are git-ignored; see `.env.example` for the web app template.
