"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function ChatPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const router = useRouter();

  const { messages, isStreaming, error, sendMessage } = useChat({
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

  return (
    <div className="flex h-full">
      {/* Chat session sidebar — desktop only */}
      <ChatSidebar sessions={sessions} className="hidden xl:flex" />

      {/* Main chat area */}
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
