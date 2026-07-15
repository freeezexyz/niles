-- ═══════════════════════════════════════════════════════════════════════
-- Niles demo seed — populates every SEEDABLE product page with realistic
-- output. Idempotent-ish: run once against the local niles DB.
--   user    = resolved by email (test@niles.local), so this survives a reset
--   Run scripts/demo-seed/00-base-deals.sql FIRST — it creates the deals below.
--   Toyota  = 53a664f3-2023-47b3-b327-f9fc3c1c94a7 (Richard Tan, proposal_submission)
--   Petronas= ef6cf521-b698-4dda-a64d-689b293d619b (Aisyah Rahman, prospecting)
--   Grab    = 043ecb58-7f9d-4bbf-bb40-67dc5ecafed5 (Wei Jian, closing)
-- All timestamps are now()-relative so they always read as "recent"/"today".
-- ═══════════════════════════════════════════════════════════════════════
BEGIN;

-- ── A. Profile: livelier dashboard + settings ──
UPDATE public.profiles
SET full_name = 'Hazman', streak_days = 12, query_count = 47, last_active_at = now()
WHERE id = (SELECT id FROM auth.users WHERE email = 'test@niles.local');

-- ── B. Pipeline: add a solution_presentation deal so all 4 columns fill ──
INSERT INTO public.deals (
  user_id, title, value, currency, stage, contact_name, contact_company,
  contact_role, industry, decision_style, primary_motivation, communication_pref,
  key_concerns, health_purpose, health_visioning, health_knowledge, health_kindness,
  health_leadership, health_trust, health_emotional_intel)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@niles.local'),
  'Maybank Digital Onboarding', 180000, 'USD', 'solution_presentation',
  'Nurul Izzah', 'Maybank', 'VP Digital Transformation', 'Banking',
  'expressive', 'innovation', 'visual',
  'Wants to see the vision but nervous about integration timelines',
  68, 74, 62, 66, 58, 61, 70);

-- ── C. Dashboard: Today's Focus (todos, is_completed=false) ──
INSERT INTO public.todos (user_id, deal_id, content, priority, is_ai_generated, due_date) VALUES
  ((SELECT id FROM auth.users WHERE email = 'test@niles.local'), '53a664f3-2023-47b3-b327-f9fc3c1c94a7',
   'Send Richard the phased-rollout SLA + zero-stoppage reference call', 'high', true, current_date),
  ((SELECT id FROM auth.users WHERE email = 'test@niles.local'), '043ecb58-7f9d-4bbf-bb40-67dc5ecafed5',
   'Confirm final pricing sign-off with Wei Jian before Friday', 'high', false, current_date + 2),
  ((SELECT id FROM auth.users WHERE email = 'test@niles.local'), 'ef6cf521-b698-4dda-a64d-689b293d619b',
   'Research Aisyah''s sustainability KPIs to anchor the Petronas pitch', 'medium', true, current_date + 1),
  ((SELECT id FROM auth.users WHERE email = 'test@niles.local'), NULL,
   'Re-read Ch.6 (Trust) before the Toyota follow-up', 'grow', true, current_date + 3);

-- ── D. Dashboard: Schedule (calendar_events, TODAY) ──
INSERT INTO public.calendar_events (user_id, deal_id, title, description, event_type, starts_at, ends_at) VALUES
  ((SELECT id FROM auth.users WHERE email = 'test@niles.local'), '53a664f3-2023-47b3-b327-f9fc3c1c94a7',
   'Follow-up call — Richard Tan', 'Walk through rollout risk plan', 'call',
   date_trunc('day', now()) + interval '10 hours', date_trunc('day', now()) + interval '10 hours 30 minutes'),
  ((SELECT id FROM auth.users WHERE email = 'test@niles.local'), 'ef6cf521-b698-4dda-a64d-689b293d619b',
   'Discovery demo — Petronas', 'First product walkthrough for Aisyah''s team', 'demo',
   date_trunc('day', now()) + interval '14 hours', date_trunc('day', now()) + interval '15 hours'),
  ((SELECT id FROM auth.users WHERE email = 'test@niles.local'), NULL,
   'Pipeline review (self)', 'Weekly self-review of open deals', 'review',
   date_trunc('day', now()) + interval '17 hours', date_trunc('day', now()) + interval '17 hours 30 minutes');

-- ── E. Deal timelines (deal_activities) ──
-- Toyota — rich history
INSERT INTO public.deal_activities (deal_id, user_id, activity_type, description, created_at) VALUES
  ('53a664f3-2023-47b3-b327-f9fc3c1c94a7',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'stage_change','Moved to Proposal Submission', now() - interval '9 days'),
  ('53a664f3-2023-47b3-b327-f9fc3c1c94a7',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'pre_meeting','Prepped for procurement review with Richard', now() - interval '8 days'),
  ('53a664f3-2023-47b3-b327-f9fc3c1c94a7',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'note','Richard flagged downtime risk as his #1 concern', now() - interval '7 days'),
  ('53a664f3-2023-47b3-b327-f9fc3c1c94a7',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'objection_handled','Handled "switching cost too high" objection', now() - interval '5 days'),
  ('53a664f3-2023-47b3-b327-f9fc3c1c94a7',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'proposal_generated','Proposal generated for Richard Tan', now() - interval '3 days'),
  ('53a664f3-2023-47b3-b327-f9fc3c1c94a7',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'deck_generated','HTML deck generated for Richard Tan', now() - interval '2 days'),
  ('53a664f3-2023-47b3-b327-f9fc3c1c94a7',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'debrief','Debriefed the proposal walkthrough call', now() - interval '1 days');
-- Grab — closing
INSERT INTO public.deal_activities (deal_id, user_id, activity_type, description, created_at) VALUES
  ('043ecb58-7f9d-4bbf-bb40-67dc5ecafed5',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'stage_change','Moved to Closing', now() - interval '6 days'),
  ('043ecb58-7f9d-4bbf-bb40-67dc5ecafed5',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'note','Wei Jian verbally committed, pending procurement sign-off', now() - interval '4 days'),
  ('043ecb58-7f9d-4bbf-bb40-67dc5ecafed5',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'email_sent','Sent final pricing summary email', now() - interval '2 days'),
  ('043ecb58-7f9d-4bbf-bb40-67dc5ecafed5',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'roleplay_completed','Roleplayed the final negotiation', now() - interval '1 days');
-- Petronas — prospecting
INSERT INTO public.deal_activities (deal_id, user_id, activity_type, description, created_at) VALUES
  ('ef6cf521-b698-4dda-a64d-689b293d619b',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'note','Intro call booked via referral from KL office', now() - interval '3 days'),
  ('ef6cf521-b698-4dda-a64d-689b293d619b',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'chat_session','Coached on discovery questions for Aisyah', now() - interval '2 days');

-- ── F. Generated Outputs (deal_outputs) — Toyota is the showcase ──
INSERT INTO public.deal_outputs (deal_id, user_id, output_type, format, title, content) VALUES
('53a664f3-2023-47b3-b327-f9fc3c1c94a7',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'proposal','markdown',
 'Proposal — Toyota Malaysia',
$md$# Fleet Renewal Partnership Proposal — Toyota Malaysia

## Executive Summary
Toyota Malaysia is preparing a quarter-million-dollar fleet renewal at a moment when downtime risk, not price, is the real decision driver. This proposal lays out a **phased transition with a written uptime guarantee** so the switch never touches your production line.

## Understanding Your Situation
You need a renewal you can defend to the board — one that modernises the fleet without a single day of unplanned downtime during rollout. Cost matters, but a stalled line costs far more than any per-unit saving.

## Proposed Solution
- **Phase 1 (Weeks 1–3):** Parallel run — new units deployed alongside existing fleet, zero cutover risk.
- **Phase 2 (Weeks 4–6):** Staged handover by depot, each validated before the next.
- **Phase 3 (Week 7):** Full switchover with a 30-day performance warranty.

## Why This Works for Toyota
- A written **downtime SLA** — [X hours] max, or service credits apply.
- A reference call with [comparable automotive client] who switched with zero line stoppage.
- 3-year total-cost-of-ownership model, not a sticker price.

## Investment
Total programme: **USD 250,000**, structured across the three phases above. Detailed TCO breakdown in [Appendix A].

## Next Steps
1. Confirm the phased-rollout SLA terms.
2. Schedule the reference call this week.
3. Co-present the transition plan to your internal stakeholders.

---

### Coaching Note
This proposal leans on **Trust (Ch.6)** — leading with risk-reversal on Richard's stated fear — and **Leadership (Ch.5)**, positioning you as the partner who de-risks his board decision rather than a vendor quoting a price.$md$),
('53a664f3-2023-47b3-b327-f9fc3c1c94a7',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'deck_llm','text',
 'Deck outline — Toyota Malaysia',
$txt$Slide 1: A Fleet Renewal With Zero Downtime
- Toyota Malaysia — Fleet Renewal Partnership
- Speaker note: Open on the outcome he wants — a switch nobody notices.

Slide 2: What's Really at Stake
- A stalled production line costs more than any per-unit saving
- The decision has to be board-defensible
- Speaker note: Name his fear before he has to.

Slide 3: The Phased Transition
- Phase 1: Parallel run (zero cutover risk)
- Phase 2: Staged depot-by-depot handover
- Phase 3: Full switchover + 30-day warranty
- Speaker note: Walk the timeline slowly; let him see the safety.

Slide 4: Your Downtime Guarantee
- Written SLA: [X hours] max or service credits apply
- Reference call: [client] switched with zero line stoppage
- Speaker note: This is the proof slide — pause here.

Slide 5: The Investment
- USD 250,000 across three phases
- 3-year total cost of ownership, not sticker price
- Speaker note: Reframe price into his language — long-term ROI.

Slide 6: Next Steps
- Confirm SLA terms
- Book the reference call
- Co-present to your board
- Speaker note: Offer to stand next to him in the board room.$txt$),
('53a664f3-2023-47b3-b327-f9fc3c1c94a7',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'deck_html','html',
 'HTML Deck — Toyota Malaysia',
$html$<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Toyota Fleet Renewal — Deck</title><style>
*{margin:0;padding:0;box-sizing:border-box}html,body{height:100%}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0e0d0b;color:#f4efe2;overflow:hidden}
.slide{position:absolute;inset:0;display:none;flex-direction:column;justify-content:center;padding:8vw;opacity:0;transition:opacity .4s}
.slide.active{display:flex;opacity:1}.eyebrow{color:#d9b45a;letter-spacing:.2em;text-transform:uppercase;font-size:14px;font-weight:600;margin-bottom:18px}
h1{font-size:clamp(30px,6vw,60px);line-height:1.1;font-weight:700;max-width:16ch}ul{margin-top:28px;list-style:none}li{font-size:clamp(18px,2.6vw,26px);margin:14px 0;padding-left:28px;position:relative;color:#cfc7b3}
li::before{content:"";position:absolute;left:0;top:.6em;width:12px;height:12px;border-radius:50%;background:#d9b45a}.big{font-size:clamp(40px,9vw,90px);color:#d9b45a;font-weight:700}
.nav{position:fixed;bottom:24px;right:32px;color:#9a917c;font-size:14px;letter-spacing:.1em}.mark{position:fixed;bottom:24px;left:32px;color:#d9b45a;letter-spacing:.28em;text-transform:uppercase;font-size:12px;font-weight:600}
</style></head><body>
<section class="slide active"><div class="eyebrow">Toyota Malaysia</div><h1>A fleet renewal with zero downtime.</h1></section>
<section class="slide"><div class="eyebrow">What's at stake</div><h1>A stalled line costs more than any saving.</h1><ul><li>The decision has to be board-defensible</li><li>Downtime risk is the real driver — not price</li></ul></section>
<section class="slide"><div class="eyebrow">The plan</div><h1>A phased transition.</h1><ul><li>Phase 1 — Parallel run, zero cutover risk</li><li>Phase 2 — Staged depot-by-depot handover</li><li>Phase 3 — Full switchover + 30-day warranty</li></ul></section>
<section class="slide"><div class="eyebrow">Your guarantee</div><h1>A written downtime SLA.</h1><ul><li>[X hours] max, or service credits apply</li><li>Reference call: switched with zero line stoppage</li></ul></section>
<section class="slide"><div class="eyebrow">The investment</div><div class="big">USD 250,000</div><ul><li>Across three phases</li><li>3-year total cost of ownership</li></ul></section>
<section class="slide"><div class="eyebrow">Next steps</div><h1>Let's de-risk this together.</h1><ul><li>Confirm the SLA terms</li><li>Book the reference call</li><li>Co-present to your board</li></ul></section>
<div class="nav"><span id="n">1</span> / 6</div><div class="mark">Niles</div>
<script>var s=document.querySelectorAll('.slide'),i=0;function go(d){s[i].classList.remove('active');i=Math.max(0,Math.min(s.length-1,i+d));s[i].classList.add('active');document.getElementById('n').textContent=i+1}
document.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key===' ')go(1);if(e.key==='ArrowLeft')go(-1)});</script>
</body></html>$html$);
-- Grab — a proposal so its Outputs card isn't empty
INSERT INTO public.deal_outputs (deal_id, user_id, output_type, format, title, content) VALUES
('043ecb58-7f9d-4bbf-bb40-67dc5ecafed5',(SELECT id FROM auth.users WHERE email = 'test@niles.local'),'proposal','markdown',
 'Proposal — Grab',
$md$# Driver Rewards Programme — Grab

## Executive Summary
A rewards programme that lifts driver retention while staying inside your unit economics. This is the final-terms proposal ahead of closing.

## Proposed Solution
- Tiered rewards tied to trips completed and rating.
- Real-time earnings dashboard for drivers.
- Phased rollout starting with the Klang Valley cohort.

## Investment
Programme fee and per-driver cost detailed in [Appendix A]. Pricing locked pending sign-off.

## Next Steps
1. Procurement sign-off (target: Friday).
2. Countersign and schedule kickoff.

---

### Coaching Note
Anchored in **Trust (Ch.6)** — you've earned Wei Jian's verbal commitment; keep momentum without pressure.$md$);

-- ── G. Weekly Reviews ──
INSERT INTO public.weekly_reviews (user_id, week_start, is_read, summary, created_at) VALUES
((SELECT id FROM auth.users WHERE email = 'test@niles.local'), date_trunc('week', now())::date, false,
 '{"deals_moved":2,"deals_stagnant":1,"wins":0,"losses":0,
   "priorities":["Close Grab before Friday — get procurement sign-off","Send Toyota the downtime SLA + reference call","Book the Petronas discovery demo"],
   "blind_spots":["Trust is your lowest principle on 2 of 3 open deals — you move to proposals before earning it","You logged no debrief on the Petronas intro call"],
   "wisdom_quote":"Trust is the currency that closes every deal. Earn it before you ask for the order.",
   "summary_text":"A strong week of forward motion — two deals advanced a stage. Grab is one signature away. The pattern worth watching: you reach the proposal stage fast on knowledge and purpose, but trust lags. Slow down one beat earlier and let the relationship carry the close."}'::jsonb,
 now() - interval '1 hour'),
((SELECT id FROM auth.users WHERE email = 'test@niles.local'), (date_trunc('week', now()) - interval '7 days')::date, true,
 '{"deals_moved":1,"deals_stagnant":2,"wins":1,"losses":0,
   "priorities":["Advance Toyota to proposal","Re-engage two stalled deals"],
   "blind_spots":["Follow-up cadence slipped mid-week"],
   "wisdom_quote":"Paint the future your client cannot yet see.",
   "summary_text":"Closed one deal — well done. Two others went quiet; a single well-timed data point would have kept them warm. Visioning was your strength this week."}'::jsonb,
 now() - interval '8 days');

-- ── H. Roleplay transcript (roleplay/[sessionId]) ──
WITH rp AS (
  INSERT INTO public.chat_sessions (user_id, deal_id, session_type, title, score, principle_tags, created_at)
  VALUES ((SELECT id FROM auth.users WHERE email = 'test@niles.local'), NULL, 'roleplay',
          'Roleplay — Skeptical Procurement Buyer', 78, ARRAY['trust','emotional'], now() - interval '1 days')
  RETURNING id)
INSERT INTO public.chat_messages (session_id, role, content, created_at)
SELECT rp.id, v.role, v.content, now() - interval '1 days' + (v.ord * interval '1 minute')
FROM rp, (VALUES
  (0,'system','You are roleplaying a skeptical Head of Procurement evaluating a fleet switch. Be guarded about downtime and cost.'),
  (1,'assistant','Look, I''ll be honest — I''ve been burned by a "seamless" switchover before. It cost us two days of downtime. Why should this be any different?'),
  (2,'user','That''s exactly why we run a parallel phase first — the new units run alongside your existing fleet, so there''s zero cutover risk before you commit.'),
  (3,'assistant','Parallel running sounds expensive. And my board only sees the sticker price, not your phasing cleverness.'),
  (4,'user','Fair. That''s why I''d give you a written downtime SLA and a 3-year total-cost model you can take straight to the board — the number in their language, not mine.'),
  (5,'assistant','...Alright. If you can get me a reference from someone who actually switched without a stoppage, I''ll bring this to the committee.'),
  (6,'user','Done — I''ll set up that reference call this week and send the SLA terms alongside it.'),
  (7,'assistant','[DEBRIEF]

**Score: 78 / 100**

**What worked**
- You led with risk-reversal (the parallel phase) before he could dig into the objection — strong **Trust (Ch.6)**.
- Reframing price into "board language" met his real fear of being second-guessed.

**What to sharpen**
- You conceded "that''s expensive" a little fast — acknowledge without agreeing the cost is a problem.
- You could have asked *what* the last downtime cost him, to make your guarantee land harder.

**Next time:** open with one question about the past failure before pitching the fix. Let him tell you the stakes.')
) AS v(ord, role, content);

COMMIT;
