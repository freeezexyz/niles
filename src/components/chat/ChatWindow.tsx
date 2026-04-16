"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import type { PrincipleKey } from "@/lib/utils/principles";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  principleTag?: PrincipleKey | null;
}

interface ChatWindowProps {
  messages: Message[];
  onSend: (message: string) => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatWindow({
  messages,
  onSend,
  isStreaming,
  disabled,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/10">
                <span className="font-display text-2xl font-bold text-gold-500">N</span>
              </div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                Welcome to Niles
              </h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Your AI sales coach powered by The Pharaoh&apos;s Pitch.
                Ask me about sales strategies, objection handling,
                client engagement, or any challenge you&apos;re facing.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {[
                  "How do I handle price objections?",
                  "Help me prepare for a discovery call",
                  "My deal is stalling — what should I do?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => onSend(suggestion)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:border-gold-500/30 hover:text-foreground transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-4">
            {messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                principleTag={msg.principleTag}
                isStreaming={
                  isStreaming &&
                  i === messages.length - 1 &&
                  msg.role === "assistant"
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={disabled || isStreaming} />
    </div>
  );
}
