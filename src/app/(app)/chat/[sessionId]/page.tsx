"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChatWindow, type Message } from "@/components/chat/ChatWindow";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useChat } from "@/hooks/useChat";
import type { PrincipleKey } from "@/lib/utils/principles";

interface SessionItem {
  id: string;
  title: string | null;
  session_type: string;
  created_at: string;
}

export default function ChatSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const { messages, isStreaming, error, sendMessage, loadHistory } = useChat({
    sessionId,
  });

  async function loadSessions() {
    const supabase = createClient();
    const { data } = await supabase
      .from("chat_sessions")
      .select("id, title, session_type, created_at")
      .eq("session_type", "chat")
      .order("created_at", { ascending: false })
      .limit(50);
    setSessions(data || []);
  }

  useEffect(() => {
    async function loadChatHistory() {
      const supabase = createClient();
      const { data } = await supabase
        .from("chat_messages")
        .select("id, role, content, principle_tag")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (data) {
        const msgs: Message[] = data
          .filter((m) => m.role !== "system")
          .map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            principleTag: m.principle_tag as PrincipleKey | null,
          }));
        loadHistory(msgs);
      }
      setLoaded(true);
    }

    loadChatHistory();
    loadSessions();
  }, [sessionId, loadHistory]);

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <ChatSidebar sessions={sessions} className="hidden xl:flex" />

      <div className="flex-1 flex flex-col">
        {error && (
          <div className="mx-4 mt-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <ChatWindow
          messages={messages}
          onSend={sendMessage}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
