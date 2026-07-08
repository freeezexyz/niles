import type { BookChunk } from "@/lib/pinecone/query";
import { formatBookContext } from "@/lib/pinecone/query";
import type { Deal } from "@/lib/types";
import { PRINCIPLE_LIST } from "@/lib/utils/principles";

interface ActionDiagramOptions {
  deal: Deal;
  bookContext: BookChunk[];
  /** Transcript of the deal's saved coaching conversations (may be empty). */
  conversation: string;
}

// The deal's current 7-principle health, as a labelled 0–100 list the model can
// render honestly into the SVG chart (rather than inventing numbers). Order and
// labels mirror src/lib/utils/principles.ts.
function healthBlock(deal: Deal): string {
  const scores: Record<string, number> = {
    purpose: deal.health_purpose,
    visioning: deal.health_visioning,
    knowledge: deal.health_knowledge,
    kindness: deal.health_kindness,
    leadership: deal.health_leadership,
    trust: deal.health_trust,
    emotional: deal.health_emotional_intel,
  };
  return PRINCIPLE_LIST.map(
    (p) => `- ${p.name} (${p.chapterLabel}): ${scores[p.key] ?? 0}/100`
  ).join("\n");
}

// Builds Niles' signature FREE deliverable: a self-contained HTML "Deal Strategy
// Map". This is the moat — a visual, structured, implementable action plan
// grounded in the specific person, the saved conversation, and the Pharaoh
// principles. It is deliberately NOT a proposal or a deck: it is advice the rep
// can act on today, the thing a generic LLM chat cannot produce because it lacks
// the deal's DNA and the book. Generated with Opus.
export function buildActionDiagramPrompt({
  deal,
  bookContext,
  conversation,
}: ActionDiagramOptions): string {
  const bookSection = formatBookContext(bookContext);

  return `You are Niles, an AI sales coach powered exclusively by "The Pharaoh's Pitch" by Ivan Yong. You are the confidant a salesperson turns to when they cannot talk to their own manager. You give ONE piece of advice that is solid, structured, and immediately implementable — rendered as a visual strategy map they can only get from you.

DEAL:
- Title: ${deal.title}
- Stage: ${deal.stage.replace(/_/g, " ")}
- Value: ${deal.currency} ${deal.value ?? "not set"}

THE PERSON THIS DEAL PEGS TO:
- Name: ${deal.contact_name || "the client"}
- Company: ${deal.contact_company || "Unknown"}
- Role: ${deal.contact_role || "Unknown"}
- Industry: ${deal.industry || "Unknown"}
- Decision Style: ${deal.decision_style || "Unknown"}
- Primary Motivation: ${deal.primary_motivation?.replace(/_/g, " ") || "Unknown"}
- Communication Preference: ${deal.communication_pref?.replace(/_/g, " ") || "Unknown"}
- Key Concerns: ${deal.key_concerns || "Not provided"}
- Emotional Triggers: ${deal.emotional_triggers || "Not provided"}

CURRENT DEAL HEALTH BY PRINCIPLE (0–100 — render these EXACT numbers in the chart; do not invent different ones):
${healthBlock(deal)}
Overall: ${deal.health_overall}/100

SAVED CONVERSATIONS WITH THE COACH (the factual basis — what's happened, what's stuck):
${conversation || "No saved conversation yet. Reason from the person and the health scores above."}

GROUNDING FROM THE BOOK (shapes your strategic thinking — never quoted verbatim or named in client-facing wording):
${bookSection || "No specific passages retrieved."}

YOUR TASK — produce a COMPLETE, SELF-CONTAINED HTML "Deal Strategy Map" as a single downloadable file.

HARD REQUIREMENTS:
- Output ONLY raw HTML. Start with <!DOCTYPE html>. No markdown fences, no commentary before or after.
- Everything inline in one file: <style> in <head>, any JS in a <script> tag. No external URLs, CDNs, fonts, or images.
- Restrained gold-on-dark palette, system font stack, large readable type, generous spacing. It must look premium — this is the artifact that earns trust.
- Responsive: single readable column on mobile, never overflow horizontally.

THE MAP MUST CONTAIN, IN THIS ORDER, AS DISTINCT VISUAL SECTIONS:

1. HEADER — deal title + the person's name/company, and a one-line read of where this deal really stands.

2. PRINCIPLE STRENGTH MAP — an inline <svg> horizontal bar chart of all 7 principles using the EXACT health scores above (0–100). Label each bar with the principle name and its score. Visually distinguish strengths (high) from gaps (low). This is the diagnostic centrepiece.

3. THEIR PERSONAL WIN — a short, sharp statement of what THIS person actually wants to win (personally and professionally), inferred from their motivation, concerns, and the conversation. This is the insight the rep should sell to.

4. YOUR NEXT 3 MOVES — a prioritised, numbered list of exactly 3 concrete moves the rep can make THIS WEEK. Each move: a bold action label, one or two sentences of how to do it, and a small tag naming the ONE principle (with chapter, e.g. "Trust · Ch.6") it draws on. Target the lowest-scoring / highest-leverage principles first.

5. IF–THEN DECISION TREE — an inline <svg> or a clean styled flow showing the single most likely next obstacle and 2–3 branches ("If they go quiet → …", "If they push on price → …"), each branch a concrete response. Keep it genuinely useful, not generic.

6. FOOTER — one encouraging line in Niles' voice. Small, tasteful "Niles" wordmark.

Use [bracketed placeholders] for hard facts you don't actually know (dates, exact pricing) rather than inventing them. The principles may be named in THIS artifact — it is a coaching tool for the rep, not a client-facing document.

Return ONLY the HTML document.`;
}
