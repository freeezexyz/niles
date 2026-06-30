# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> **Next.js 16 + React 19.** This repo is on the bleeding edge (Next 16.2, React 19.2, Tailwind v4, AI SDK v6, Zod v4). APIs differ from older versions you may know. When unsure about a Next.js API, read `node_modules/next/dist/docs/` before writing code — see AGENTS.md.

## Commands

```bash
npm run dev      # Next dev server (Turbopack) on :3000
npm run build    # production build
npm run lint     # eslint (flat config, next/core-web-vitals + next/typescript)
npx tsx scripts/ingest-book.ts <path-to-pdf>   # chunk + embed the source book → Pinecone
```

There is **no test suite**. Verify changes via `npm run build` and `npm run lint`.

## What this is

**Niles** is an AI sales coach. All coaching is grounded *exclusively* in one book — *"The Pharaoh's Pitch"* by Ivan Yong — and its **7 principles**, which are the central domain concept threaded through the entire app:

`purpose · visioning · knowledge · kindness · leadership · trust · emotional` (mapped to book chapters 1–7).

The canonical definition lives in `src/lib/utils/principles.ts` (`PrincipleKey`, `PRINCIPLES`). Almost everything — deal health scores, client DNA profiles, chat principle tags, weekly reviews — is scored or tagged against these 7 principles. Keep these keys consistent across the prompt strings, the DB columns (`p_*` on clients, `health_*` on deals), and the regex in the chat route.

## Architecture

Single Next.js App Router application. Three external services do the heavy lifting:

- **Supabase** — Postgres + Auth (the only datastore; schema in `supabase/migrations/00001_initial_schema.sql`, RLS on every table).
- **Anthropic Claude** (`claude-sonnet-4-6`) — all generation, via `@anthropic-ai/sdk`.
- **RAG over the book** — Voyage AI (`voyage-3`) embeddings → Pinecone vector search.

### Request flow for an AI feature (the dominant pattern)

Each AI feature is a `src/app/api/<feature>/route.ts` paired with a prompt builder in `src/lib/prompts/<feature>.ts`:

1. `createClient()` (server Supabase) → `auth.getUser()`; 401 if absent.
2. (chat only) load `profiles` and enforce tier via `isWithinQueryLimit` → 429.
3. `queryPinecone(text, { topK })` → book passages; optionally load client DNA / deal context from Supabase.
4. `buildXPrompt({ bookContext, client, deal })` assembles the system/user prompt.
5. Call Claude. Persist a `chat_sessions` row + `chat_messages`, and often a `deal_activities` row.

`/api/chat` is the one **streaming** route: it returns a hand-rolled SSE `ReadableStream` (`data: {json}\n\n` events of type `text`/`done`/`error`), flushes `: ready\n\n` first to defeat proxy buffering, and parses a `[PRINCIPLE: key | CH.n]` tag out of the model's full response to store as `principle_tag`. The client consumes it in `src/hooks/useChat.ts`. All other AI routes return plain JSON. Route configs: `export const maxDuration` / `dynamic` / `runtime = "nodejs"` at top of file.

### Supabase client variants — pick the right one

- `src/lib/supabase/server.ts` — RLS-scoped, cookie-based, **server components & API routes**. Default choice.
- `src/lib/supabase/client.ts` — browser client for `"use client"` components.
- `src/lib/supabase/admin.ts` — **service-role, bypasses RLS**. Only for cron / privileged backend work (e.g. `/api/cron/weekly-review`).
- `src/lib/supabase/proxy.ts` — session refresh + auth redirects, called from the proxy.

### Auth & routing

Auth gating happens in **`src/proxy.ts`** — this is Next.js 16's renamed middleware (`proxy.ts`, not `middleware.ts`; `export async function proxy`). It redirects unauthenticated users to `/login` and authenticated users away from auth pages. Route groups: `src/app/(app)/*` is the authed product shell (`(app)/layout.tsx` with sidebar/mobile nav), `src/app/(auth)/*` is login/signup, `src/app/auth/callback` handles the OAuth/email callback.

### Tiers

`src/lib/utils/tiers.ts` defines `pharaoh | dynasty | empire` with `queryLimit` / `maxClients` (`-1` = unlimited) and feature gates (`hasFeature`, `isWithinQueryLimit`). Chat enforces the monthly query limit and increments `profiles.query_count`.

### Other conventions

- Path alias `@/*` → `src/*`.
- UI: shadcn/ui components in `src/components/ui/` (Base UI primitives, `components.json`), Tailwind v4 (`@theme` in `globals.css`; principle colors are `--color-principle-*` CSS vars). Domain components grouped by feature under `src/components/<feature>/`.
- All domain TypeScript types live in `src/lib/types/index.ts` and mirror the DB schema — update both together when changing the schema.
- A Vercel Cron (`vercel.json`) hits `/api/cron/weekly-review` Mondays 06:00; it authenticates via the `Bearer ${CRON_SECRET}` header and uses the admin client.

## Environment

Copy `.env.local.example` → `.env.local`. Required: Supabase URL/anon/service-role keys, `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, Pinecone (`PINECONE_API_KEY` / `PINECONE_INDEX` / `PINECONE_ENVIRONMENT`). Pinecone uses namespace `pharaohs-pitch` — keep ingestion (`scripts/ingest-book.ts`) and query (`src/lib/pinecone/query.ts`) namespaces in sync.
