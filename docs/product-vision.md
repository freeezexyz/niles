# Niles — Product Vision (Consolidated)

Single source of truth reconciling three inputs:

1. **User-journey map** — `docs/niles_ver2_userjourney_25June2026.pdf` (the *what*: feature flow).
2. **Ivan's direction (WhatsApp, 4 Jul 2026)** — the *why / where's the moat*: free-give strategy.
3. **The code as built** — Phase 1 & 2 on `feat/pivot-phase-1` (the *where we are*).

Supersedes nothing in `product-pivot-plan.md`; it builds on it. Where they overlap, this
doc is newer. Drafted 2026-07-08.

---

## 1. The one-line pitch

> **Niles is the sales confidant you can't get from your manager.** When you can't talk to
> your Sales Manager — office politics, judgement, no time — you talk to Niles. It knows
> your deal, knows the person you're selling to, and gives you *one structured, actionable
> move* grounded in *The Pharaoh's Pitch* — with a diagram you can act on today.

Positioning, in Ivan's words: *"like [having] someone to talk to but you can't talk to your
Sales Manager due to office politics etc — then you speak to Niles."*

---

## 2. The strategic correction (Ivan, 4 Jul)

The user-journey PDF treats the **Proposal / Deck generator** as the headline payoff behind
the paywall. Ivan's message is a **correction to that free/paid line**:

- ❌ **Don't lead with a free PPT/proposal.** *"Lots of LLMs can do it."* No moat — a free
  deck is a commodity a rep can already get from ChatGPT.
- ✅ **Lead with one free piece of advice** that is **solid, structured, implementable**, and
  ideally **rendered as a diagram** — *"something they can only get from Niles."*
- The unlock is **guiding the rep to ask the right question**, then answering it with
  Niles' unique context (the book's 7 principles + the specific person on the deal).

**Implication:** the hero is the **coaching conversation → a structured, diagrammed action
plan**, not the document generator. The generator is real value, but it's *paid convenience*,
not the pitch.

---

## 3. Free vs Paid — the reconciled line

| Tier | Deliverable | Moat? |
|---|---|---|
| **Free hook** | The coaching conversation → **one structured, diagrammed action plan** for a real deal (grounded in RAG + the person's DNA + the 7 principles) | ✅ Only Niles has the book + your deal context |
| **Paid** | Repeatable **output generation** — Proposal, **Email Draft**, Deck; **Internet Insights**; unlimited deals / queries | ⚠️ Convenience, not moat — correct as paid, wrong as the pitch |

This keeps the PDF's paywall (Proposal Generator + Email Draft behind the wall) but **reframes
what sits in front of it**: the free give is the diagrammed advice, not a free deck.

---

## 4. Feature map (from the PDF) → build status

Legend: ✅ built · 🟡 exists but legacy/untouched · 🔵 planned · 🔴 net-new gap

| Area | Feature (PDF) | Status | Notes |
|---|---|---|---|
| Dashboard | ProActive AI Coach | ✅ | Command Center, proactive greeting/summary |
| Dashboard | Deals Health | ✅ | `health_*` per-deal scores |
| Dashboard | Principles Breakdown (score) | ✅ | `PrincipleScores` radar / `rep_principle_scores` |
| Deal | Kanban funnel (Prospecting → Solution Presentation → Submission → Closing) | ✅ | Phase 1 funnel stages |
| Deal | AI Coach Function (per-deal) | ✅ | `/chat?dealId=` deal-scoped coach |
| Deal | Identify Personal Win (Refer RAG) | 🟡→🔵 | Coach touches it; not a first-class output yet |
| Deal | Objection Handler | 🟡 | Legacy `objection` feature still present |
| Deal | Internet Insights / data to back proposal | 🔵 | Phase 3 web-access tier (Haiku crawl / Opus elaborate) |
| Paywall | Proposal Generator | ✅ | `POST /api/deals/[dealId]/proposal` |
| Paywall | **Email Draft** | 🔴 | **Not built** — new output type |
| Paywall | Deck / PPT | ✅ | `POST /api/deals/[dealId]/deck` (html / llm) |
| Cross-cutting | All activities logged | ✅ | `deal_activities` |
| Cross-cutting | Constant deal score tabulated | ✅ | deal health recompute |
| Cross-cutting | **Dates remembered + add to calendar** | 🔴 | **Not built** |
| **Hero** | **Actionable diagram (free give)** | 🔴 | **Not built — the moat; see §5** |

---

## 5. The one net-new hero: "Actionable Diagram"

The single thing standing between what exists and what Ivan wants. Everything else is built,
legacy, or already-planned.

- **What it is:** Niles' signature free deliverable — a visual, structured action plan for a
  real deal that a generic LLM chat won't produce. Candidate forms:
  - a **7-principle deal-strategy map** (where this deal is strong/weak, next move per principle), or
  - a **next-move decision tree** ("if the champion goes quiet → …"), or
  - a **stakeholder / personal-win map** tying the person's motivation to the pitch.
- **Why it's the moat:** grounded in the book (RAG) + the deal's person DNA + saved
  conversation — context an LLM window doesn't have.
- **Fits the existing Phase-2 pattern** exactly: new `deal_outputs.output_type: 'action_diagram'`,
  a `prompts/action-diagram.ts` builder, a `POST /api/deals/[dealId]/action-diagram` route,
  and a card in `DealOutputs.tsx`. Rendered as inline SVG/HTML (self-contained, like the deck).

Spec'ing this is the recommended next work item after this doc.

---

## 6. Secondary gaps (post-hero)

- **Email Draft** (paid) — mirror the proposal route; `output_type: 'email_draft'`.
- **Calendar / dates** — extract commitments/dates from deal conversations → "add to calendar"
  (ICS export first; Google Calendar MCP later).
- **Internet Insights** — Phase 3 web tier, already planned.

---

## 7. Open items (carried forward)

- **Tokenomics & packages** — PDF "Next Step #1"; still open. The free/paid line in §3 is the
  input to pricing.
- **Timeline** — PDF target: **launch mid-July 2026**.
- **Legacy features** — `roleplay`, `objection`, `prep`, `debrief`, `weekly-review`, `team`:
  keep, fold into new model, or drop? Objection Handler is explicitly in the PDF, so it stays.
- **AI keys** — all AI paths inert until `ANTHROPIC_API_KEY` / `VOYAGE_API_KEY` / `PINECONE_*`
  land; they fail gracefully today.

---

## 8. TL;DR for the team

1. **Don't sell the free deck.** The free give is **one diagrammed, actionable coaching move**
   — the thing only Niles can make.
2. **Most of the PDF is already built** (Phase 1 & 2). The gaps are: **Actionable Diagram
   (hero)**, **Email Draft**, **Calendar**, and **Internet Insights** (planned).
3. **Next build:** the Actionable Diagram — it's the moat and it slots into the existing
   output-generation pattern.
