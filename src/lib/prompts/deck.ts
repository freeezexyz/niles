import type { Deal } from "@/lib/types";

export type DeckFormat = "html" | "llm";

interface DeckOptions {
  deal: Deal;
  /** Source material — the generated proposal (preferred) or a transcript. */
  source: string;
  format: DeckFormat;
}

const contactBlock = (deal: Deal): string => `DEAL: ${deal.title}
CLIENT: ${deal.contact_name || "the client"}${deal.contact_company ? ` — ${deal.contact_company}` : ""}
DECISION STYLE: ${deal.decision_style || "Unknown"}
PRIMARY MOTIVATION: ${deal.primary_motivation?.replace(/_/g, " ") || "Unknown"}`;

// Builds a pitch deck from the deal's proposal/conversation. Two flavours:
//   - "llm": a structured, plain-text slide outline to paste into a deck tool
//     (Gamma, etc.) — the cheapest path. Generated with Haiku.
//   - "html": a self-contained, downloadable HTML slide deck. The payoff /
//     lead-magnet artifact. Generated with Opus.
export function buildDeckPrompt({ deal, source, format }: DeckOptions): string {
  const base = `You are Niles, an AI sales coach powered by "The Pharaoh's Pitch" by Ivan Yong. Build a persuasive pitch deck for the salesperson to present to their client.

${contactBlock(deal)}

SOURCE MATERIAL (the proposal / conversation this deck must be built from):
${source || "No source material — work from the deal context above."}

Calibrate emphasis to the client's decision style and motivation. Lead with the client's situation and the future they want, not the product. Do NOT name the Pharaoh principles, the book, or "Niles" anywhere in the deck.`;

  if (format === "llm") {
    return `${base}

Produce a clean, plain-text SLIDE OUTLINE the salesperson can paste straight into a deck generator (Gamma, Tome, PowerPoint AI, etc.). Aim for 8–12 slides.

Format each slide exactly like:

Slide N: <Slide Title>
- <bullet>
- <bullet>
- Speaker note: <one sentence of what to say>

Return ONLY the outline. No preamble, no closing commentary.`;
  }

  return `${base}

Produce a COMPLETE, SELF-CONTAINED HTML slide deck as a single downloadable file.

HARD REQUIREMENTS:
- Output ONLY raw HTML. Start with <!DOCTYPE html>. No markdown fences, no commentary before or after.
- Everything inline in one file: <style> in <head>, any JS in a <script> tag. No external URLs, CDNs, fonts, or images.
- 8–12 full-screen slides (each a <section class="slide">). One slide visible at a time.
- Keyboard navigation: ArrowRight/ArrowLeft (and Space) move between slides; show a small "n / total" indicator.
- Clean, modern, presentation-ready styling: large readable type, generous spacing, a restrained gold-on-dark accent palette, system font stack.
- Content mirrors a strong pitch flow: title → the client's situation → the stakes → proposed solution → why it fits them → proof/approach → investment → clear next step → closing.
- Use [bracketed placeholders] for facts you don't actually know rather than inventing them.

Return ONLY the HTML document.`;
}
