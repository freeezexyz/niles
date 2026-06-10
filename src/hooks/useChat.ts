"use client";

import { useState, useCallback } from "react";
import type { Message } from "@/components/chat/ChatWindow";
import type { PrincipleKey } from "@/lib/utils/principles";

interface UseChatOptions {
  sessionId?: string | null;
  dealId?: string | null;
  clientId?: string | null;
  onSessionCreated?: (sessionId: string) => void;
}

export function useChat({
  sessionId,
  dealId,
  clientId,
  onSessionCreated,
}: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    sessionId || null
  );

  const sendMessage = useCallback(
    async (content: string) => {
      setError(null);
      setIsStreaming(true);

      // Add user message immediately
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
      };
      setMessages((prev) => [...prev, userMsg]);

      // Add placeholder for assistant
      const assistantId = `assistant-${Date.now()}`;
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMsg]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: currentSessionId,
            message: content,
            dealId,
            clientId,
          }),
        });

        if (!response.ok) {
          const raw = await response.text().catch(() => "");
          let message = "Failed to send message";
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed?.error) message = parsed.error;
            } catch {
              // non-JSON body (HTML error page, empty, etc.) — use status-based fallback
            }
          }
          if (response.status === 504) {
            message =
              "Niles took too long to respond. Try a shorter prompt or break it into smaller asks.";
          } else if (response.status === 502 || response.status === 503) {
            message =
              "Niles is temporarily unavailable. Please try again in a moment.";
          } else if (response.status === 401) {
            message = "Your session expired. Please sign in again.";
          }
          throw new Error(message);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);

            let data: {
              type: string;
              content?: string;
              error?: string;
              sessionId?: string;
              principleTag?: PrincipleKey | null;
              chapterRef?: string | null;
            };
            try {
              data = JSON.parse(jsonStr);
            } catch {
              continue; // Skip malformed JSON lines
            }

            if (data.type === "text") {
              fullContent += data.content ?? "";
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: fullContent }
                    : msg
                )
              );
            } else if (data.type === "done") {
              // Remove the principle tag from displayed content
              let cleanContent = fullContent;
              const tagMatch = cleanContent.match(
                /\[PRINCIPLE:\s*\w+\s*\|\s*CH\.\d+\]/i
              );
              if (tagMatch) {
                cleanContent = cleanContent.replace(tagMatch[0], "").trim();
              }

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? {
                        ...msg,
                        content: cleanContent,
                        principleTag: data.principleTag as PrincipleKey,
                      }
                    : msg
                )
              );

              if (data.sessionId && !currentSessionId) {
                setCurrentSessionId(data.sessionId);
                onSessionCreated?.(data.sessionId);
              }
            } else if (data.type === "error") {
              throw new Error(data.error || "Server error");
            }
          }
        }

        // Stream ended with no content and no done event — surface as error
        // so the empty placeholder bubble doesn't sit there forever.
        if (!fullContent) {
          throw new Error(
            "Niles didn't respond. The stream closed before any content arrived."
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        // Remove the empty assistant message on error
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== assistantId)
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [currentSessionId, dealId, clientId, onSessionCreated]
  );

  const loadHistory = useCallback((existingMessages: Message[]) => {
    setMessages(existingMessages);
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    loadHistory,
    sessionId: currentSessionId,
  };
}
