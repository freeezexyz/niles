import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { queryPinecone } from "@/lib/pinecone/query";
import { buildChatCoachPrompt } from "@/lib/prompts/chat-coach";
import { isWithinQueryLimit } from "@/lib/utils/tiers";
import type { PrincipleKey } from "@/lib/utils/principles";
import type { TierKey } from "@/lib/utils/tiers";

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get profile for tier enforcement
  const { data: profile } = await supabase
    .from("profiles")
    .select("tier, query_count, query_limit")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (!isWithinQueryLimit(profile.tier as TierKey, profile.query_count)) {
    return NextResponse.json(
      {
        error:
          "Monthly query limit reached. Upgrade your plan for unlimited access.",
      },
      { status: 429 }
    );
  }

  const { sessionId, message, dealId, clientId } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const send = (payload: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
        );
      };

      try {
        // Create or get session
        let activeSessionId = sessionId;
        if (!activeSessionId) {
          const { data: newSession, error: sessionError } = await supabase
            .from("chat_sessions")
            .insert({
              user_id: user.id,
              deal_id: dealId || null,
              client_id: clientId || null,
              session_type: "chat",
              title: message.slice(0, 80),
            })
            .select("id")
            .single();

          if (sessionError || !newSession) {
            send({ type: "error", error: "Failed to create session" });
            return;
          }
          activeSessionId = newSession.id;
        }

        // Save user message
        await supabase.from("chat_messages").insert({
          session_id: activeSessionId,
          role: "user",
          content: message,
        });

        // Short-circuit: Niles has no browsing tool, so URLs can't be fetched.
        // Without this, the model burns the timeout budget hallucinating from the URL slug.
        const urlPattern = /(https?:\/\/|www\.)\S+/i;
        if (urlPattern.test(message)) {
          const cannedResponse =
            "I can't open links directly — I don't have web access in this chat. To help you write copy, paste the key details here: the person's headline, current role, the kind of work they do, recent posts that stood out, and the audience you're writing for. Once I have that, I can draft something tight.";

          send({ type: "text", content: cannedResponse });
          send({
            type: "done",
            sessionId: activeSessionId,
            principleTag: null,
            chapterRef: null,
          });

          await supabase.from("chat_messages").insert({
            session_id: activeSessionId,
            role: "assistant",
            content: cannedResponse,
            principle_tag: null,
            chapter_ref: null,
            metadata: { canned: "url_not_supported" },
          });

          await supabase
            .from("profiles")
            .update({ query_count: profile.query_count + 1 })
            .eq("id", user.id);

          return;
        }

        // Get RAG context
        const bookContext = await queryPinecone(message, { topK: 5 });

        // Get client DNA if provided
        let clientDna = null;
        if (clientId) {
          const { data } = await supabase
            .from("clients")
            .select("*")
            .eq("id", clientId)
            .single();
          clientDna = data;
        }

        // Get deal context if provided
        let dealContext = null;
        if (dealId) {
          const { data } = await supabase
            .from("deals")
            .select("*")
            .eq("id", dealId)
            .single();
          dealContext = data;
        }

        // Build system prompt
        const systemPrompt = buildChatCoachPrompt({
          bookContext,
          clientDna,
          dealContext,
        });

        // Get conversation history
        const { data: history } = await supabase
          .from("chat_messages")
          .select("role, content")
          .eq("session_id", activeSessionId)
          .order("created_at", { ascending: true })
          .limit(20);

        const chatMessages = (history || [])
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

        // Stream Anthropic response using async iteration
        const anthropic = getAnthropicClient();
        let fullContent = "";

        const stream = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          system: systemPrompt,
          messages: chatMessages,
          stream: true,
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullContent += text;
            send({ type: "text", content: text });
          }
        }

        // Extract principle tag from the full response
        let principleTag: PrincipleKey | null = null;
        let chapterRef: string | null = null;
        const tagMatch = fullContent.match(
          /\[PRINCIPLE:\s*(purpose|visioning|knowledge|kindness|leadership|trust|emotional)\s*\|\s*(CH\.\d+)\]/i
        );
        if (tagMatch) {
          principleTag = tagMatch[1].toLowerCase() as PrincipleKey;
          chapterRef = tagMatch[2];
          fullContent = fullContent.replace(tagMatch[0], "").trim();
        }

        // Send done event with metadata
        send({
          type: "done",
          sessionId: activeSessionId,
          principleTag,
          chapterRef,
        });

        // Save assistant message to DB
        await supabase.from("chat_messages").insert({
          session_id: activeSessionId,
          role: "assistant",
          content: fullContent,
          principle_tag: principleTag,
          chapter_ref: chapterRef,
          metadata: {
            rag_chunks: bookContext.map((c) => ({
              principle: c.principle,
              chapter: c.chapter,
              score: c.score,
            })),
          },
        });

        // Increment query count
        await supabase
          .from("profiles")
          .update({ query_count: profile.query_count + 1 })
          .eq("id", user.id);

        // Update session principle tags
        if (principleTag) {
          const { data: session } = await supabase
            .from("chat_sessions")
            .select("principle_tags")
            .eq("id", activeSessionId)
            .single();

          const existingTags = session?.principle_tags || [];
          if (!existingTags.includes(principleTag)) {
            await supabase
              .from("chat_sessions")
              .update({
                principle_tags: [...existingTags, principleTag],
              })
              .eq("id", activeSessionId);
          }
        }
      } catch (error) {
        console.error("Chat API error:", error);
        send({ type: "error", error: "Failed to generate response" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
