import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { queryPinecone } from "@/lib/pinecone/query";
import { buildObjectionHandlerPrompt } from "@/lib/prompts/objection-handler";

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { objection, clientId, dealId } = await req.json();

  if (!objection?.trim()) {
    return NextResponse.json({ error: "Objection text is required" }, { status: 400 });
  }

  let client = null;
  if (clientId) {
    const { data } = await supabase.from("clients").select("*").eq("id", clientId).single();
    client = data;
  }

  const bookContext = await queryPinecone(objection, { topK: 5 });
  const prompt = buildObjectionHandlerPrompt({ objection, bookContext, client });

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
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
      session_type: "objection",
      title: `Objection: ${objection.slice(0, 60)}`,
    })
    .select("id")
    .single();

  if (session) {
    await supabase.from("chat_messages").insert([
      { session_id: session.id, role: "user", content: objection },
      { session_id: session.id, role: "assistant", content },
    ]);

    if (dealId) {
      await supabase.from("deal_activities").insert({
        deal_id: dealId,
        user_id: user.id,
        activity_type: "objection_handled",
        description: `Objection handled: "${objection.slice(0, 80)}"`,
      });
    }
  }

  return NextResponse.json({ content, sessionId: session?.id });
}
