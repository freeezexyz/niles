import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { buildWeeklyReviewPrompt } from "@/lib/prompts/weekly-review";

export const maxDuration = 300;

export async function GET(req: Request) {
  // Verify cron secret (Vercel Cron sends this header)
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get all active users
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .not("last_active_at", "is", null);

  if (!profiles?.length) {
    return NextResponse.json({ message: "No active users" });
  }

  const weekStart = getMonday(new Date()).toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  let generated = 0;

  for (const profile of profiles) {
    try {
      // Check if review already exists for this week
      const { data: existing } = await supabase
        .from("weekly_reviews")
        .select("id")
        .eq("user_id", profile.id)
        .eq("week_start", weekStart)
        .single();

      if (existing) continue;

      // Get user's deals
      const { data: deals } = await supabase
        .from("deals")
        .select("*")
        .eq("user_id", profile.id);

      // Get week's activities
      const { data: activities } = await supabase
        .from("deal_activities")
        .select("*")
        .eq("user_id", profile.id)
        .gte("created_at", weekAgo);

      // Get session counts
      const { count: chatCount } = await supabase
        .from("chat_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("session_type", "chat")
        .gte("created_at", weekAgo);

      const { count: roleplayCount } = await supabase
        .from("chat_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("session_type", "roleplay")
        .gte("created_at", weekAgo);

      // Generate review
      const prompt = buildWeeklyReviewPrompt({
        deals: deals || [],
        activities: activities || [],
        chatSessionCount: chatCount || 0,
        roleplayCount: roleplayCount || 0,
      });

      const anthropic = getAnthropicClient();
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const content =
        response.content[0].type === "text" ? response.content[0].text : "";

      let summary;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        summary = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary_text: content };
      } catch {
        summary = { summary_text: content };
      }

      await supabase.from("weekly_reviews").insert({
        user_id: profile.id,
        week_start: weekStart,
        summary,
      });

      generated++;
    } catch (err) {
      console.error(`Failed to generate review for ${profile.id}:`, err);
    }
  }

  return NextResponse.json({
    message: `Generated ${generated} weekly reviews`,
    weekStart,
  });
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
