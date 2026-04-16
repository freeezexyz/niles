import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { buildHealthScorePrompt } from "@/lib/prompts/health-score";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const { dealId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get deal
  const { data: deal, error: dealError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .single();

  if (dealError || !deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  // Get recent activities
  const { data: activities } = await supabase
    .from("deal_activities")
    .select("*")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false })
    .limit(20);

  // Generate health scores with Claude
  const anthropic = getAnthropicClient();
  const prompt = buildHealthScorePrompt(deal, activities || []);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const content =
    response.content[0].type === "text" ? response.content[0].text : "";

  let scores;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    scores = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse health scores" },
      { status: 500 }
    );
  }

  // Update deal health scores
  const { error: updateError } = await supabase
    .from("deals")
    .update({
      health_purpose: scores.health_purpose,
      health_visioning: scores.health_visioning,
      health_knowledge: scores.health_knowledge,
      health_kindness: scores.health_kindness,
      health_leadership: scores.health_leadership,
      health_trust: scores.health_trust,
      health_emotional_intel: scores.health_emotional_intel,
    })
    .eq("id", dealId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Log the health update
  await supabase.from("deal_activities").insert({
    deal_id: dealId,
    user_id: user.id,
    activity_type: "health_update",
    description: `Health scores recalculated. ${scores.reasoning || ""}`,
    metadata: scores,
  });

  return NextResponse.json({ success: true, scores });
}
