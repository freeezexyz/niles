"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useChat } from "@/hooks/useChat";

interface SessionItem {
  id: string;
  title: string | null;
  session_type: string;
  created_at: string;
}

function ChatPageInner() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [dealTitle, setDealTitle] = useState<string | null>(null);
  const router = useRouter();
  // A dealId scopes the coach to one deal (per-deal coaching); absent = general.
  const dealId = useSearchParams().get("dealId");

  const { messages, isStreaming, error, sendMessage } = useChat({
    dealId,
    onSessionCreated: (newSessionId) => {
      router.replace(`/chat/${newSessionId}`);
      loadSessions();
    },
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
    loadSessions();
  }, []);

  useEffect(() => {
    if (!dealId) {
      setDealTitle(null);
      return;
    }
    const supabase = createClient();
    supabase
      .from("deals")
      .select("title")
      .eq("id", dealId)
      .maybeSingle()
      .then(({ data }) => setDealTitle(data?.title ?? null));
  }, [dealId]);

  return (
    <div className="flex h-full">
      {/* Chat session sidebar — desktop only */}
      <ChatSidebar sessions={sessions} className="hidden xl:flex" />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {dealId && (
          <div className="mx-4 mt-2 rounded-lg bg-gold-500/10 border border-gold-500/20 px-4 py-2 text-sm text-gold-500">
            Coaching on deal{dealTitle ? `: ${dealTitle}` : ""}
          </div>
        )}
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

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <ChatPageInner />
    </Suspense>
  );
}
