import type { Deal, DealActivity } from "@/lib/types";

export function buildHealthScorePrompt(
  deal: Deal,
  activities: DealActivity[]
): string {
  const activityLog = activities
    .slice(-20)
    .map(
      (a) =>
        `- [${a.activity_type}] ${a.description || "No description"} (${new Date(a.created_at).toLocaleDateString()})`
    )
    .join("\n");

  return `You are Niles, an AI sales coach powered by "The Pharaoh's Pitch" by Ivan Yong.

Analyze the following deal and its recent activity to recalculate the Deal Health Score across the 7 Pharaoh Principles.

DEAL INFORMATION:
- Title: ${deal.title}
- Stage: ${deal.stage.replace(/_/g, " ")}
- Value: ${deal.currency} ${deal.value || "Not set"}
- Current Health Scores:
  - Purpose: ${deal.health_purpose}/100
  - Visioning: ${deal.health_visioning}/100
  - Knowledge: ${deal.health_knowledge}/100
  - Kindness: ${deal.health_kindness}/100
  - Leadership: ${deal.health_leadership}/100
  - Trust: ${deal.health_trust}/100
  - Emotional Intelligence: ${deal.health_emotional_intel}/100

RECENT ACTIVITY LOG:
${activityLog || "No recent activities"}

Based on the deal stage and recent activities, generate updated health scores.

SCORING GUIDELINES:
- Scores should reflect how well each principle is being applied in this deal
- Stage progression should generally increase scores
- Debriefs and coaching sessions should boost the principles they covered
- Stagnation (no activity) should slightly decrease scores
- Stage changes are strong positive signals
- Adjust scores incrementally (usually +/- 5-15 points per recalculation)

Return ONLY a JSON object:
{
  "health_purpose": <0-100>,
  "health_visioning": <0-100>,
  "health_knowledge": <0-100>,
  "health_kindness": <0-100>,
  "health_leadership": <0-100>,
  "health_trust": <0-100>,
  "health_emotional_intel": <0-100>,
  "reasoning": "<brief explanation of the score changes>"
}`;
}
