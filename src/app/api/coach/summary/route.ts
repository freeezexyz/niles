import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { buildCoachSummaryPrompt } from "@/lib/prompts/coach-summary";
import { repRowToWeakestPrinciple } from "@/lib/rep-score";
import type { Deal } from "@/lib/types";

export const maxDuration = 30;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Proactive Command Center greeting. Best-effort: if the model/key is
// unavailable the client falls back to a static greeting, so failures here
// are returned as 200 with a null summary rather than surfaced as errors.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: profile }, { data: deals }, { data: repScore }] =
    await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
      supabase
        .from("deals")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(25),
      supabase
        .from("rep_principle_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const prompt = buildCoachSummaryPrompt({
    repName: profile?.full_name?.split(" ")[0] || "there",
    deals: (deals as Deal[]) || [],
    focusPrinciple: repScore ? repRowToWeakestPrinciple(repScore) : null,
  });

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });
    const summary =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Coach summary error:", error);
    // Graceful: let the client show its static fallback.
    return NextResponse.json({ summary: null });
  }
}
