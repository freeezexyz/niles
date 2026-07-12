# Demo seed scripts

SQL that populates the **local** Niles Supabase DB with realistic demo output so
every seedable product page shows content instead of empty states. Authored
2026-07-08.

## Files

- `demo-action-plan.sql` — inserts the showcase **Action Plan** artifact
  (`deal_outputs.output_type = 'action_diagram'`, a self-contained HTML "Deal
  Strategy Map") onto the Toyota deal, plus its activity row.
- `seed-demo.sql` — everything else: extra pipeline deal, dashboard todos +
  today's calendar events, per-deal activity timelines, the other Toyota outputs
  (proposal / HTML deck / deck outline) + a Grab proposal, two weekly reviews,
  and a roleplay transcript ending on the debrief screen. Bumps the profile.

## Which pages this covers

Seeded/visible: **dashboard, pipeline, deals/[dealId], reviews, roleplay/[sessionId], settings**.

Not covered (LIVE-ONLY — the page holds the AI result in React state and reads
nothing from the DB, so output can't be seeded): **objection, prep/new,
debrief/new, email/draft, roleplay/new**. The **team** page is also not seeded
(needs auth.users rows + a tier upgrade + a teams row).

## ⚠️ These hardcode this session's IDs — not turnkey after a reset

Both scripts reference fixed UUIDs captured on 2026-07-08:

- user `d4e78b49-0aaa-45ee-a3a4-a4d22b89136b` (`test@niles.local`)
- deals: Toyota `53a664f3-…`, Petronas `ef6cf521-…`, Grab `043ecb58-…`

`supabase db reset` wipes `auth.users` and all data, so a fresh stack will have a
**different** user id and **no** deals — these scripts will then fail on the
foreign keys. To reuse after a reset you must first recreate the test user (see
`docs/local-dev-setup.md`) and the three base deals, then update the UUIDs in
these files to match. Treat this as a *record of the demo dataset*, not a
one-command reseed.

While the DB is merely stopped (`supabase stop`, not reset), the data is
preserved in the Docker volume and no re-seeding is needed.

## Run (against a running local stack)

```bash
docker exec -i supabase_db_niles psql -U postgres -d postgres -v ON_ERROR_STOP=1 < scripts/demo-seed/demo-action-plan.sql
docker exec -i supabase_db_niles psql -U postgres -d postgres -v ON_ERROR_STOP=1 < scripts/demo-seed/seed-demo.sql
```

(Note the `-i` — without it the heredoc/stdin is dropped and psql silently no-ops.)
All timestamps are `now()`-relative, so dates always read as recent/today.
