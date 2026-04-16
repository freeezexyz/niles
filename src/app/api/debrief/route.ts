import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { buildPostCallDebriefPrompt } from "@/lib/prompts/post-call-debrief";

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { debriefNotes, dealId, clientId } = await req.json();

  if (!debriefNotes?.trim()) {
    return NextResponse.json({ error: "Debrief notes are required" }, { status: 400 });
  }

  let client = null;
  let deal = null;
  if (clientId) {
    const { data } = await supabase.from("clients").select("*").eq("id", clientId).single();
    client = data;
  }
  if (dealId) {
    const { data } = await supabase.from("deals").select("*").eq("id", dealId).single();
    deal = data;
  }

  const prompt = buildPostCallDebriefPrompt({ debriefNotes, client, deal });
  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0].type === "text" ? response.content[0].text : "";

  // Save as chat session
  const { data: session } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: user.id,
      deal_id: dealId || null,
      client_id: clientId || null,
      session_type: "debrief",
      title: `Debrief: ${debriefNotes.slice(0, 60)}`,
    })
    .select("id")
    .single();

  if (session) {
    await supabase.from("chat_messages").insert([
      { session_id: session.id, role: "user", content: debriefNotes },
      { session_id: session.id, role: "assistant", content },
    ]);
  }

  // Auto-update deal health if deal provided
  if (dealId && deal) {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        const deltas = JSON.parse(jsonMatch[1]);

        await supabase
          .from("deals")
          .update({
            health_purpose: Math.max(0, Math.min(100, deal.health_purpose + (deltas.health_purpose || 0))),
            health_visioning: Math.max(0, Math.min(100, deal.health_visioning + (deltas.health_visioning || 0))),
            health_knowledge: Math.max(0, Math.min(100, deal.health_knowledge + (deltas.health_knowledge || 0))),
            health_kindness: Math.max(0, Math.min(100, deal.health_kindness + (deltas.health_kindness || 0))),
            health_leadership: Math.max(0, Math.min(100, deal.health_leadership + (deltas.health_leadership || 0))),
            health_trust: Math.max(0, Math.min(100, deal.health_trust + (deltas.health_trust || 0))),
            health_emotional_intel: Math.max(0, Math.min(100, deal.health_emotional_intel + (deltas.health_emotional_intel || 0))),
          })
          .eq("id", dealId);

        await supabase.from("deal_activities").insert({
          deal_id: dealId,
          user_id: user.id,
          activity_type: "debrief",
          description: `Post-call debrief completed. ${deltas.next_todo ? `Next: ${deltas.next_todo}` : ""}`,
          metadata: deltas,
        });

        // Auto-add next todo if provided
        if (deltas.next_todo) {
          await supabase.from("todos").insert({
            user_id: user.id,
            deal_id: dealId,
            content: deltas.next_todo,
            priority: "high",
            is_ai_generated: true,
            due_date: new Date().toISOString().split("T")[0],
          });
        }
      } catch {
        // JSON parse failed — still return the analysis
      }
    }
  }

  return NextResponse.json({ content, sessionId: session?.id });
}
