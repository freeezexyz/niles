import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { buildRolePlayClientPrompt } from "@/lib/prompts/roleplay-client";
import { buildRolePlayDebriefPrompt } from "@/lib/prompts/roleplay-debrief";

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, sessionId, message, setup } = await req.json();

  const anthropic = getAnthropicClient();

  if (action === "start") {
    // Create new roleplay session
    const systemPrompt = buildRolePlayClientPrompt(setup);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: "Hello, I'm here for our meeting." }],
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";

    const { data: session } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: user.id,
        session_type: "roleplay",
        title: `Role Play: ${setup.industry} ${setup.seniority} (${setup.difficulty})`,
      })
      .select("id")
      .single();

    if (session) {
      await supabase.from("chat_messages").insert([
        { session_id: session.id, role: "system", content: systemPrompt },
        { session_id: session.id, role: "user", content: "Hello, I'm here for our meeting." },
        { session_id: session.id, role: "assistant", content },
      ]);
    }

    return NextResponse.json({ content, sessionId: session?.id });
  }

  if (action === "message") {
    if (!sessionId || !message) {
      return NextResponse.json({ error: "sessionId and message required" }, { status: 400 });
    }

    // Get history
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    const systemMsg = history?.find((m) => m.role === "system");
    const messages = (history || [])
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    messages.push({ role: "user", content: message });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemMsg?.content || "",
      messages,
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";

    await supabase.from("chat_messages").insert([
      { session_id: sessionId, role: "user", content: message },
      { session_id: sessionId, role: "assistant", content },
    ]);

    return NextResponse.json({ content });
  }

  if (action === "debrief") {
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    // Get full conversation
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    const conversation = (history || [])
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role === "user" ? "SALESPERSON" : "CLIENT"}: ${m.content}`)
      .join("\n\n");

    const debriefPrompt = buildRolePlayDebriefPrompt(conversation);
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: debriefPrompt }],
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";

    // Extract score
    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
    let score = null;
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        score = parsed.overall_score;
        await supabase
          .from("chat_sessions")
          .update({ score })
          .eq("id", sessionId);
      } catch {
        // Ignore parse errors
      }
    }

    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      role: "assistant",
      content: `[DEBRIEF]\n\n${content}`,
    });

    // Log roleplay completion (no deal_id since this is standalone practice)
    await supabase.from("chat_sessions").update({
      score: score || null,
    }).eq("id", sessionId);

    return NextResponse.json({ content, score });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
