-- ── 00-base-deals.sql ───────────────────────────────────────────────────────
-- The three deals that `seed-demo.sql` and `demo-action-plan.sql` reference by
-- fixed UUID but never create. They originally came from the app UI (2026-07-08)
-- and were lost when the Docker volume was wiped; the field values below are a
-- RECONSTRUCTION inferred from the activities/outputs/todos in those scripts,
-- not the originals.
--
-- Run this FIRST — the other two scripts fail on foreign keys without it.
-- The user id is resolved by email, so this survives a reset.

INSERT INTO public.deals (
  id, user_id, title, value, currency, stage,
  contact_name, contact_company, contact_role, industry,
  decision_style, primary_motivation, communication_pref,
  key_concerns, emotional_triggers,
  health_purpose, health_visioning, health_knowledge, health_kindness,
  health_leadership, health_trust, health_emotional_intel,
  created_at)
VALUES
  -- Toyota — furthest along: proposal + deck generated, procurement review next.
  -- Trust is deliberately the weak principle (a todo says "Re-read Ch.6 (Trust)
  -- before the Toyota follow-up"). Value 250k matches the seeded proposal/deck.
  ('53a664f3-2023-47b3-b327-f9fc3c1c94a7',
   (SELECT id FROM auth.users WHERE email = 'test@niles.local'),
   'Toyota Malaysia — Plant Digitalisation', 250000, 'USD', 'proposal_submission',
   'Richard Tan', 'Toyota Malaysia', 'Director of Manufacturing Operations', 'Automotive Manufacturing',
   'analytical', 'risk_reduction', 'data_reports',
   'Downtime risk during cutover is his #1 concern — zero stoppage is non-negotiable. Wants a phased rollout backed by an SLA and a reference call.',
   'Being held responsible for a line stoppage on his watch',
   72, 70, 78, 66, 64, 48, 62,
   now() - interval '38 days'),

  -- Petronas — earliest: discovery demo done, still qualifying.
  ('ef6cf521-b698-4dda-a64d-689b293d619b',
   (SELECT id FROM auth.users WHERE email = 'test@niles.local'),
   'Petronas — Sustainability Reporting Platform', 320000, 'USD', 'prospecting',
   'Aisyah Rahman', 'Petronas', 'Head of Sustainability', 'Oil & Gas',
   'analytical', 'long_term_roi', 'data_reports',
   'Needs the platform to map cleanly onto Petronas sustainability KPIs and Scope 3 reporting obligations.',
   'Committing to a vendor that cannot survive an external audit',
   58, 54, 49, 60, 46, 52, 55,
   now() - interval '11 days'),

  -- Grab — closest to signature: verbal commitment, procurement is the last gate.
  ('043ecb58-7f9d-4bbf-bb40-67dc5ecafed5',
   (SELECT id FROM auth.users WHERE email = 'test@niles.local'),
   'Grab — Regional Fleet Ops Rollout', 140000, 'USD', 'closing',
   'Wei Jian', 'Grab', 'Regional Operations Director', 'Technology / Mobility',
   'driver', 'quick_wins', 'verbal',
   'Verbally committed. Final pricing sign-off and procurement approval are the only remaining gates.',
   'Losing momentum to a slow internal process',
   84, 80, 76, 74, 82, 79, 77,
   now() - interval '24 days');
