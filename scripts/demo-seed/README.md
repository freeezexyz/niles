# Demo seed scripts

SQL that populates the **local** Niles Supabase DB with realistic demo output so
every seedable product page shows content instead of empty states. Authored
2026-07-08.

## Files

- `00-base-deals.sql` — **run first.** Creates the three deals the other scripts
  reference by fixed UUID (Toyota, Petronas, Grab). See the reconstruction note below.
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

## Reset-safe (since 2026-07-15)

The scripts no longer hardcode a user id — they resolve it with
`(SELECT id FROM auth.users WHERE email = 'test@niles.local')`. The deal UUIDs are
still fixed, but `00-base-deals.sql` now creates those deals, so a full reseed is
three commands against a fresh stack.

**Only prerequisite:** the test user must exist. Recreate it first via the
admin-API snippet in `docs/local-dev-setup.md` (a wipe destroys `auth.users`);
the `handle_new_user` trigger then seeds the profile automatically.

### ⚠️ Toyota / Petronas / Grab are a reconstruction

The originals were created through the app UI on 2026-07-08 and existed only in the
Docker volume — a `supabase stop --no-backup` on 2026-07-15 destroyed them. The
scripts referenced their UUIDs but never their contents, so the field values in
`00-base-deals.sql` (value, industry, decision style, health scores, concerns) were
**inferred** from the surrounding activities/outputs/todos, not recovered. Contacts,
stages, and Toyota's USD 250,000 are grounded in the seed data; the rest is invented.
Edit `00-base-deals.sql` if the demo needs specific numbers.

## Run (against a running local stack)

```bash
for f in 00-base-deals demo-action-plan seed-demo; do
  docker exec -i supabase_db_niles psql -U postgres -d postgres -v ON_ERROR_STOP=1 < scripts/demo-seed/$f.sql
done
```

(Note the `-i` — without it the heredoc/stdin is dropped and psql silently no-ops.)
All timestamps are `now()`-relative, so dates always read as recent/today.
