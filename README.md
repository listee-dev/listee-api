# listee-api

listee-api exposes Listee's HTTP interface. It packages `@listee/api` inside a Next.js App Router host so the CLI and web clients share the same business logic, validation, and database access.

## Overview
- Next.js 15 application that forwards requests to `createFetchHandler` from `@listee/api`.
- Supabase supplies authentication (JWT) and the Postgres database.
- Shared models and utilities come from the `@listee/*` packages (auth, db, types, api).

## Architecture
- `src/app/api/handler.ts` is the single hand-off into `@listee/api`.
- `@listee/api` (Hono + Drizzle ORM) defines routes, validation, and service orchestration.
- `@listee/db` provides Drizzle schema definitions and Postgres connection management.
- Authentication is header-based via `@listee/auth`.

## Environment Variables
Configure these values in `.env.local` for development and in production:
- `POSTGRES_URL` – Supabase Postgres connection string.
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` – required by auth integrations.
- `LISTEE_API_AUTH_BEARER_MODE` – optional; `user-id` (default) or `access-token` to define how bearer headers are interpreted.

## Response Contract
- Success responses always return JSON with a top-level `data` property. DELETE operations respond with `{ "data": null }`.
- Error responses return `{ "error": "message" }` plus the appropriate HTTP status code (`400` validation, `401/403` auth, `404` missing resources, `500` unexpected failures).

## API Surface
| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/users/:userId/categories` | List categories for the authenticated user |
| POST | `/api/users/:userId/categories` | Create a new category |
| GET | `/api/categories/:categoryId` | Fetch category details |
| PATCH | `/api/categories/:categoryId` | Update a category name |
| DELETE | `/api/categories/:categoryId` | Delete a category owned by the user |
| GET | `/api/categories/:categoryId/tasks` | List tasks in a category |
| POST | `/api/categories/:categoryId/tasks` | Create a task inside the category |
| GET | `/api/tasks/:taskId` | Fetch task details |
| PATCH | `/api/tasks/:taskId` | Update task name, description, or status |
| DELETE | `/api/tasks/:taskId` | Delete a task owned by the user |
| GET | `/api/healthz` | Database connectivity probe |

All endpoints expect `Authorization: Bearer <token>`. When `LISTEE_API_AUTH_BEARER_MODE=user-id`, the token must be the Supabase user ID.

## Local Development
1. Install dependencies: `bun install`.
2. Provide environment variables in `.env.local`.
3. Run the dev server: `bun run dev` (Next.js on port 3000).
4. Lint the project: `bun run lint`.
5. Build for production verification: `bun run build`.

### Database Migrations
- Schema definitions live in `@listee/db`. Do not hand-edit generated SQL.
- Generate migrations with `bun run db:generate` after schema changes.
- Apply migrations with `bun run db:migrate` (uses `POSTGRES_URL`).

## Testing
Automated tests are not yet in place. Use CLI smoke tests (e.g. `listee categories update`, `listee tasks delete`) to verify JSON contracts until formal integration tests land.

## Deployment Notes
- `bun run build` produces the Next.js bundle for production. Deploy on Vercel or any Node 20+ platform capable of running Next.js 15.
- Confirm environment variables for each target environment before deploy.
- Monitor `/api/healthz` after rollout to confirm database access.

## Conventions
- Keep repository documentation and comments in English.
- Follow Listee org standards: Bun 1.3.x, Biome linting, Drizzle migrations, and semantic versioning via Changesets when publishing packages.
