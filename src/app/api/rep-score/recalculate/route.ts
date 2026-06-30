import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { buildRepDevelopmentPrompt } from "@/lib/prompts/rep-development";
import { repRowToScores } from "@/lib/rep-score";
import type { PrincipleScores } from "@/components/deals/RadarChart";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASELINE: PrincipleScores = {
  purpose: 50,
  visioning: 50,
  knowledge: 50,
  kindness: 50,
  leadership: 50,
  trust: 50,
  emotional: 50,
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// Recompute the rep's development scores from recent coaching activity and
// append a new snapshot to the rep_principle_scores time-series.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Current (latest) scores
  const { data: latest } = await supabase
    .from("rep_principle_scores")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const current = latest ? repRowToScores(latest) : BASELINE;

  // Recent coaching signals: latest sessions + the principles they touched
  const { data: sessions } = await supabase
    .from("chat_sessions")
    .select("session_type, title, principle_tags, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(15);

  const signals = (sessions || []).map((s) => {
    const tags = s.principle_tags?.length
      ? ` [principles: ${s.principle_tags.join(", ")}]`
      : "";
    return `${s.session_type}: ${s.title || "(untitled)"}${tags}`;
  });

  const prompt = buildRepDevelopmentPrompt({ current, signals });

  let scores = current;
  let reasoning = "No coaching activity yet.";

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });
    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json(
        { error: "Failed to parse rep score" },
        { status: 500 }
      );
    }
    const parsed = JSON.parse(match[0]);
    scores = {
      purpose: clamp(parsed.purpose),
      visioning: clamp(parsed.visioning),
      knowledge: clamp(parsed.knowledge),
      kindness: clamp(parsed.kindness),
      leadership: clamp(parsed.leadership),
      trust: clamp(parsed.trust),
      emotional: clamp(parsed.emotional),
    };
    reasoning = parsed.reasoning || reasoning;
  } catch (error) {
    console.error("Rep score recalc error:", error);
    return NextResponse.json(
      { error: "Failed to recalculate rep score" },
      { status: 500 }
    );
  }

  // Append a new time-series snapshot
  const { error: insertError } = await supabase
    .from("rep_principle_scores")
    .insert({
      user_id: user.id,
      p_purpose: scores.purpose,
      p_visioning: scores.visioning,
      p_knowledge: scores.knowledge,
      p_kindness: scores.kindness,
      p_leadership: scores.leadership,
      p_trust: scores.trust,
      p_emotional_intel: scores.emotional,
      source: "periodic",
      note: reasoning,
    });

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to save rep score" },
      { status: 500 }
    );
  }

  return NextResponse.json({ scores, reasoning });
}
