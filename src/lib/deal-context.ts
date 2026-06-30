import type { createClient } from "@/lib/supabase/server";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

// Max characters of transcript to feed a generator. Conversation history can
// grow unbounded; we keep the most recent slice so prompts stay within budget.
const MAX_TRANSCRIPT_CHARS = 12_000;

/**
 * Assemble a deal's saved coaching conversations into a single transcript.
 * This is the raw material Phase 2 generators (proposal, deck) draw on — the
 * "from a deal's saved conversations" requirement. Returns "" when the deal
 * has no recorded messages yet.
 */
export async function loadDealConversation(
  supabase: ServerSupabase,
  dealId: string
): Promise<string> {
  const { data: sessions } = await supabase
    .from("chat_sessions")
    .select("id, session_type, title, created_at")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: true });

  if (!sessions?.length) return "";

  const sessionIds = sessions.map((s) => s.id);

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("session_id, role, content, created_at")
    .in("session_id", sessionIds)
    .order("created_at", { ascending: true });

  if (!messages?.length) return "";

  // Drop system messages; they aren't useful narrative for a deliverable.
  const lines = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "Rep" : "Coach"}: ${m.content.trim()}`);

  const transcript = lines.join("\n\n");

  // Keep the most recent slice if it overflows the budget.
  if (transcript.length > MAX_TRANSCRIPT_CHARS) {
    return (
      "[…earlier conversation omitted…]\n\n" +
      transcript.slice(transcript.length - MAX_TRANSCRIPT_CHARS)
    );
  }

  return transcript;
}
