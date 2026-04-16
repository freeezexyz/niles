import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { queryPinecone } from "@/lib/pinecone/query";
import { buildPreMeetingPrepPrompt } from "@/lib/prompts/pre-meeting-prep";

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { meetingGoal, lastInteraction, dealId, clientId } = await req.json();

  if (!meetingGoal?.trim()) {
    return NextResponse.json({ error: "Meeting goal is required" }, { status: 400 });
  }

  // Get context
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

  const bookContext = await queryPinecone(meetingGoal, { topK: 5 });
  const prompt = buildPreMeetingPrepPrompt({ meetingGoal, lastInteraction, bookContext, client, deal });

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
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
      session_type: "pre_meeting",
      title: `Pre-Meeting: ${meetingGoal.slice(0, 60)}`,
    })
    .select("id")
    .single();

  if (session) {
    await supabase.from("chat_messages").insert([
      { session_id: session.id, role: "user", content: `Meeting Goal: ${meetingGoal}\n\nLast Interaction: ${lastInteraction || "None"}` },
      { session_id: session.id, role: "assistant", content },
    ]);

    if (dealId) {
      await supabase.from("deal_activities").insert({
        deal_id: dealId,
        user_id: user.id,
        activity_type: "pre_meeting",
        description: `Pre-meeting prep completed for: ${meetingGoal.slice(0, 80)}`,
      });
    }
  }

  return NextResponse.json({ content, sessionId: session?.id });
}
