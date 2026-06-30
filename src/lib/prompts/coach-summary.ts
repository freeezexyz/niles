import type { Deal } from "@/lib/types";
import { PRINCIPLES, type PrincipleKey } from "@/lib/utils/principles";

interface CoachSummaryOptions {
  repName: string;
  deals: Deal[];
  /** The rep's weakest development principle, if known. */
  focusPrinciple?: PrincipleKey | null;
}

const HEALTH_FIELDS: { key: PrincipleKey; col: keyof Deal }[] = [
  { key: "purpose", col: "health_purpose" },
  { key: "visioning", col: "health_visioning" },
  { key: "knowledge", col: "health_knowledge" },
  { key: "kindness", col: "health_kindness" },
  { key: "leadership", col: "health_leadership" },
  { key: "trust", col: "health_trust" },
  { key: "emotional", col: "health_emotional_intel" },
];

/**
 * Builds the prompt for Niles' proactive Command Center greeting: a short,
 * specific nudge that names a real deal and ties it to a Pharaoh principle.
 */
export function buildCoachSummaryPrompt({
  repName,
  deals,
  focusPrinciple,
}: CoachSummaryOptions): string {
  const active = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");

  const dealLines = active.length
    ? active
        .map((d) => {
          const weakest = HEALTH_FIELDS.map((f) => ({
            name: PRINCIPLES[f.key].name,
            score: (d[f.col] as number) ?? 50,
          })).sort((a, b) => a.score - b.score)[0];
          const contact = [d.contact_name, d.contact_company]
            .filter(Boolean)
            .join(" @ ");
          return `- "${d.title}"${contact ? ` (${contact})` : ""} — stage: ${d.stage.replace(
            /_/g,
            " "
          )}, health ${d.health_overall}/100, weakest: ${weakest.name}`;
        })
        .join("\n")
    : "(no active deals yet)";

  const focus = focusPrinciple ? PRINCIPLES[focusPrinciple] : null;

  return `You are Niles, an AI sales coach grounded in "The Pharaoh's Pitch" and its 7 principles.

Write a SHORT proactive greeting for ${repName}'s daily Command Center — 1-2 sentences, warm but direct, like a coach who knows their pipeline. Pick the single most useful thing to flag right now and end with one concrete next step or question.

REP'S ACTIVE DEALS:
${dealLines}
${focus ? `\nREP'S CURRENT DEVELOPMENT FOCUS: ${focus.name} (${focus.chapterLabel}) — ${focus.description}` : ""}

RULES:
- Reference a specific deal by name when one stands out (e.g. stalled, low health, close to closing).
- If there are no active deals, encourage them to add their first deal and offer to coach them through it.
- Do not greet with the time of day unless you know it. Keep it to 1-2 sentences. No preamble, no sign-off.`;
}
