import type { PrincipleScores } from "@/components/deals/RadarChart";

interface RepDevelopmentOptions {
  current: PrincipleScores;
  /** Recent coaching signals: session titles, principles engaged, etc. */
  signals: string[];
}

// Re-scores the salesperson's own development across the 7 Pharaoh principles
// from their recent coaching activity. Output is the same key shape as
// PrincipleScores so it inserts straight into rep_principle_scores.
export function buildRepDevelopmentPrompt({
  current,
  signals,
}: RepDevelopmentOptions): string {
  const signalLog = signals.length
    ? signals.map((s) => `- ${s}`).join("\n")
    : "No recent coaching activity";

  return `You are Niles, an AI sales coach powered by "The Pharaoh's Pitch" by Ivan Yong.

Assess how the SALESPERSON themselves is developing across the 7 Pharaoh Principles, based on their recent coaching activity. This is a measure of the rep's own growth — not any single deal's health.

CURRENT DEVELOPMENT SCORES:
- Purpose: ${current.purpose}/100
- Visioning: ${current.visioning}/100
- Knowledge: ${current.knowledge}/100
- Kindness: ${current.kindness}/100
- Leadership: ${current.leadership}/100
- Trust: ${current.trust}/100
- Emotional Intelligence: ${current.emotional}/100

RECENT COACHING ACTIVITY:
${signalLog}

SCORING GUIDELINES:
- A principle the rep actively practices and engages with should rise.
- Principles they consistently neglect should drift down slightly.
- Reward depth of engagement and applying advice, not just asking questions.
- Adjust incrementally (usually +/- 3-10 points per recalculation). Never jump wildly.
- Keep every score within 0-100.

Return ONLY a JSON object:
{
  "purpose": <0-100>,
  "visioning": <0-100>,
  "knowledge": <0-100>,
  "kindness": <0-100>,
  "leadership": <0-100>,
  "trust": <0-100>,
  "emotional": <0-100>,
  "reasoning": "<brief explanation of the changes>"
}`;
}
