# Niles — Product Pivot Plan

Planning doc derived from the team meeting (Fariz, Ivan, Hazman). Captures the agreed
direction and a phased plan. **No code has been written against this yet** — decisions
below are locked pending team reaction. Drafted 2026-06-30.

---

## 1. The pivot

Niles is being repositioned:

> **From** an enterprise CRM-style sales tool **→ to** a personal **sales-professional
> development tool + AI coach** for individual reps.

**Why (Ivan):** individual salespeople are reluctant to log real customer data into a
company-owned tool — mistakes (e.g. a wrong discount) get scrutinised by managers, so
uptake is low. A *personal development* tool that helps the rep win deals and improve
over time has far easier adoption. Enterprise capability (team rollups, multi-stakeholder
accounts) is deferred to **Phase 2**, built only when an enterprise customer asks.

Status context: **pre-launch, no production data, shallow codebase** — so schema changes
are low-risk and we refactor the existing foundation incrementally (no full rebuild).

---

## 2. Locked decisions

| # | Decision | Resolution |
|---|---|---|
| 1 | Clients entity | **Remove.** Fold a lightweight contact profile into `deals`. No standalone clients table/routes. |
| 2 | Rep development score storage | **Time-series table** so the score can trend over time. |
| 3 | Deal stages | New sales funnel (see §4.3). Replaces principle-named stages. |
| 4 | Build approach | **Incremental refactor** of the existing foundation, not a rebuild. |

---

## 3. Product concepts (new model)

- **Command Center (dashboard)** — post-login home. Proactive coach greeting/summary +
  rep development radar + deal health overview.
- **Rep Development Score** — the 7 Pharaoh principles repurposed as the *salesperson's*
  growth status (not the customer's). Trends over time; tells the rep where to focus.
- **Deal** — pegs to a *person* ("Richard at Toyota"). Carries lightweight contact
  context. Has its own coach scoped to that deal's history.
- **AI Coach** — two explicit levels: **general** and **per-deal**. Becomes **proactive**
  (asks "what happened?", prompts next steps), not just reactive.
- **Outputs** — from a deal's saved conversations, generate **email draft**, **proposal**,
  and **deck** (the payoff; deck doubles as a lead-magnet giveaway).

---

## 4. Data model changes

### 4.1 Remove `clients`
- Drop the `clients` table and `(app)/clients/*` routes, `ClientCard`, `DnaForm`,
  `DnaProfile`, and the `clients/[clientId]/generate-dna` route.
- Remove `clientId` plumbing from chat/objection/prep routes.

### 4.2 Add contact profile onto `deals`
Relocate the still-useful Client DNA fields from `clients` onto `deals`:

```
contact_name          TEXT
contact_company       TEXT
contact_role          TEXT
decision_style        TEXT   -- analytical | driver | amiable | expressive
primary_motivation    TEXT   -- long_term_roi | quick_wins | risk_reduction | innovation | cost_savings | market_share
communication_pref    TEXT   -- data_reports | visual | verbal | written
key_concerns          TEXT
```

Result: a deal *is* the person + their decision-style context the coach uses. One level,
no company→stakeholder hierarchy (that's Phase 2).

### 4.3 New deal funnel stages
Replace current principle-named enum (`prospecting, vision_aligned, trust_building,
leadership_phase, closing, won, lost`) with:

| Order | Enum | Label | Kanban column? |
|---|---|---|---|
| 1 | `prospecting` | Prospecting | yes |
| 2 | `solution_presentation` | Solution Presentation | yes |
| 3 | `proposal_submission` | Proposal Submission | yes |
| 4 | `closing` | Closing | yes |
| — | `won` | Won (terminal) | outcome |
| — | `lost` | Lost (terminal) | outcome |

`won`/`lost` retained as closed-state outcomes for health/reporting.

### 4.4 Rep development score (time-series)
New table, one row per snapshot, so the radar can show progression:

```
rep_principle_scores
  id              UUID PK
  user_id         UUID FK -> profiles
  p_purpose       INT
  p_visioning     INT
  p_knowledge     INT
  p_kindness      INT
  p_leadership    INT
  p_trust         INT
  p_emotional_intel INT
  source          TEXT   -- e.g. 'chat', 'manual', 'periodic'
  created_at      TIMESTAMPTZ
```

The dashboard reads the latest snapshot for "today's score" and the series for the trend.
Scores update from coach interactions (mechanism TBD in Phase 1 design).

---

## 5. AI Coach changes

- **Two explicit scopes:** general coach vs. per-deal coach, made prominent in the UI
  (current `dealId`/`clientId` ambiguity removed — `clientId` goes away, `dealId` stays).
- **Per-deal memory:** all of a deal's conversations persist and feed output generation.
- **Proactive prompting:** coach opens with questions / nudges rather than waiting.
- Existing `chat-coach` prompt + RAG-over-the-book foundation is reused.

---

## 6. Output generation (the payoff)

From a deal's conversation history, generate:
- **Email draft** — exists today (`api/email/draft`); keep.
- **Proposal** — new, grounded in the Niles principles + deal context.
- **Deck** — new. Two flavours discussed:
  - "**copy-for-LLM**" text block to paste into Gamma-style tools (cheapest), and/or
  - a **self-contained HTML deck** to download (preferred over PowerPoint, which "sometimes
    doesn't work").
- **Lead magnet:** offer a free generated deck → collect email → grow funnel.

**Model cost strategy (from the call):** use a cheap model (Haiku) for bulk/crawl work,
reserve Opus for elaboration/polish.

---

## 7. Web access (premium tier)

Niles can't browse today (there's a canned "I can't open links" response in the chat
route). Add web access as a **paid-tier** feature:
- Crawl/fetch with **Haiku** (cheap), elaborate with **Opus**.
- Gate by tier so token cost maps to price.

---

## 8. Infrastructure

- **Consolidate to a single Supabase project** — a billing-driven reset/pause previously
  broke the app. Local dev now runs on a local Supabase stack (see
  [local-dev-setup.md](./local-dev-setup.md)), decoupling dev from that risk.
- Use the pivot as the moment to **de-couple** the "too interlinked" structure so one fix
  stops breaking another.

---

## 9. Phasing

| Phase | Theme | Scope |
|---|---|---|
| **0 — De-risk** | Stabilise | Consolidate Supabase; confirm decisions in this doc |
| **1 — Core pivot** | New identity | Remove clients (§4.1–4.2); funnel stages (§4.3); rep development score + Command Center (§4.4, §3); explicit general/per-deal coach (§5) |
| **2 — Payoff** | Why they pay | Proposal + HTML deck generation (§6); proactive coach; deck-as-lead-magnet |
| **3 — Premium** | Upsell | Web access tier (§7); then revisit enterprise (multi-stakeholder, team rollups) |

---

## 10. Open / deferred

- **Rep-score update mechanism** — exactly how coach interactions adjust the principle
  scores (LLM-judged per conversation? periodic recompute?). To be specced in Phase 1.
- **Enterprise model** — company→multiple-decision-makers hierarchy, team dashboards,
  pipeline rollups. Deferred until an enterprise customer requests it.
- **Existing features to re-evaluate against the pivot** — `roleplay`, `objection`,
  `prep`, `debrief`, `weekly-review`, `team` dashboard: confirm which stay, which get
  re-scoped to the development-tool framing.
- **Tiers** — current `pharaoh/dynasty/empire` may need re-pricing around the new
  individual-first model + web-access gating.
