import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { buildEmailDraftPrompt } from "@/lib/prompts/email-draft";

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { intent, additionalContext, clientId, dealId } = await req.json();

  if (!intent?.trim()) {
    return NextResponse.json({ error: "Email intent is required" }, { status: 400 });
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

  const prompt = buildEmailDraftPrompt({ intent, additionalContext, client, deal });
  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0].type === "text" ? response.content[0].text : "";

  // Save session
  const { data: session } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: user.id,
      deal_id: dealId || null,
      client_id: clientId || null,
      session_type: "email_draft",
      title: `Email: ${intent.slice(0, 60)}`,
    })
    .select("id")
    .single();

  if (session) {
    await supabase.from("chat_messages").insert([
      { session_id: session.id, role: "user", content: `Intent: ${intent}\nContext: ${additionalContext || "None"}` },
      { session_id: session.id, role: "assistant", content },
    ]);

    if (dealId) {
      await supabase.from("deal_activities").insert({
        deal_id: dealId,
        user_id: user.id,
        activity_type: "email_sent",
        description: `Email drafted: ${intent.slice(0, 80)}`,
      });
    }
  }

  return NextResponse.json({ content, sessionId: session?.id });
}
