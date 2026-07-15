# Local Dev Setup — Niles

Reference for running the app fully locally (no cloud secrets). Set up 2026-06-30.

> These are **local-only** values. The Supabase keys below are Supabase's well-known
> shared dev defaults (same on every machine, safe to commit). The AI provider keys
> (Anthropic / Voyage / Pinecone) are intentionally NOT here — add the real ones to
> `.env.local` when the team sends them.

## Test login

| | |
|---|---|
| **URL** | http://localhost:3000/login |
| **Email** | `test@niles.local` |
| **Password** | `Test1234!` |

Pre-confirmed user. Role `user`, tier `pharaoh`, query quota 500/mo. Exists only in the
local Supabase stack (recreate it if you point `.env.local` at the cloud project).

## Local service URLs

| Service | URL |
|---|---|
| App (Next dev) | http://localhost:3000 |
| Supabase API | http://127.0.0.1:54321 |
| Mailpit (catches outgoing email) | http://localhost:54324 |
| Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

### Trimmed local stack (8GB machines)

`analytics`, `realtime`, and `studio` are `enabled = false` in `supabase/config.toml`. The
full stack does not fit in Docker Desktop's 4GB VM — `analytics` (logflare) and `studio`
fail their healthchecks, and the CLI tears down the *whole* stack when any container is
unhealthy. Nothing in `src/` uses realtime, and the app never talks to studio.

Studio being off means no DB browser GUI. Inspect data with psql instead:

```bash
docker exec -it supabase_db_niles psql -U postgres        # or: psql "$DB_URL"
```

Re-enable any of them in `config.toml` if you raise Docker's memory allocation.

## Local Supabase keys (in `.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

Regenerate anytime with: `supabase status -o env`

## Common commands

```bash
# Start everything
open -a Docker                 # ensure Docker daemon is running
supabase start                # local Supabase (Postgres + Auth + Studio)
npm run dev                   # Next dev server on :3000

# Stop
supabase stop                 # halt local Supabase (data persists)

# Inspect / reset DB
supabase status -o env        # print local URLs + keys
supabase db reset             # wipe + re-apply migrations from scratch
```

## Recreate the test user

If `supabase db reset` wipes it, run:

```bash
SERVICE_ROLE="$(supabase status -o env | sed -n 's/^SERVICE_ROLE_KEY="\(.*\)"$/\1/p')"
curl -s -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \
  -H "apikey: $SERVICE_ROLE" -H "Authorization: Bearer $SERVICE_ROLE" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@niles.local","password":"Test1234!","email_confirm":true,"user_metadata":{"full_name":"Test User"}}'
```

## What works vs. what's stubbed

- ✅ Auth, dashboard, pipeline, clients, deals, todos, settings — run on local Supabase.
- ⏸ AI features (chat, objection handler, pre-meeting prep, post-call debrief, email
  draft, weekly review, client DNA) — error until `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`,
  and the `PINECONE_*` keys are filled into `.env.local`.
