import type { Deal, DealActivity } from "@/lib/types";

interface WeeklyReviewInput {
  deals: Deal[];
  activities: DealActivity[];
  chatSessionCount: number;
  roleplayCount: number;
}

export function buildWeeklyReviewPrompt({
  deals,
  activities,
  chatSessionCount,
  roleplayCount,
}: WeeklyReviewInput): string {
  const activeDeals = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const wonDeals = deals.filter((d) => d.stage === "won");
  const lostDeals = deals.filter((d) => d.stage === "lost");

  const stageChanges = activities.filter((a) => a.activity_type === "stage_change");
  const debriefs = activities.filter((a) => a.activity_type === "debrief");

  return `You are Niles, an AI sales coach powered by "The Pharaoh's Pitch" by Ivan Yong.

Generate a weekly review for this salesperson based on their activity this week.

PIPELINE SUMMARY:
- Active deals: ${activeDeals.length}
- Total pipeline value: $${activeDeals.reduce((s, d) => s + (Number(d.value) || 0), 0).toLocaleString()}
- Average health score: ${activeDeals.length > 0 ? Math.round(activeDeals.reduce((s, d) => s + d.health_overall, 0) / activeDeals.length) : 0}/100
- Deals won this week: ${wonDeals.length}
- Deals lost this week: ${lostDeals.length}

ACTIVITY THIS WEEK:
- Stage changes: ${stageChanges.length}
- Post-call debriefs: ${debriefs.length}
- AI coaching sessions: ${chatSessionCount}
- Role play sessions: ${roleplayCount}

RECENT STAGE CHANGES:
${stageChanges.slice(0, 10).map((a) => `- ${a.description || "Stage change"}`).join("\n") || "None"}

DEALS NEEDING ATTENTION (health < 50):
${activeDeals.filter((d) => d.health_overall < 50).map((d) => `- ${d.title}: Health ${d.health_overall}/100 (Stage: ${d.stage.replace(/_/g, " ")})`).join("\n") || "None — all deals healthy!"}

Return a JSON object:
{
  "deals_moved": ${stageChanges.length},
  "deals_stagnant": ${activeDeals.filter((d) => !stageChanges.find((sc) => (sc.metadata as any)?.deal_id === d.id)).length},
  "wins": ${wonDeals.length},
  "losses": ${lostDeals.length},
  "priorities": ["<priority 1>", "<priority 2>", "<priority 3>"],
  "blind_spots": ["<blind spot 1>", "<blind spot 2>"],
  "wisdom_quote": "<a relevant quote or insight from The Pharaoh's Pitch, with chapter reference>",
  "summary_text": "<2-3 paragraph narrative review of the week, coaching tone, citing specific principles>"
}

Make the priorities specific and actionable. Blind spots should identify patterns the salesperson might not see themselves.`;
}
