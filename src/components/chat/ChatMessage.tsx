import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { PrincipleTag } from "./PrincipleTag";
import type { PrincipleKey } from "@/lib/utils/principles";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  principleTag?: PrincipleKey | null;
  isStreaming?: boolean;
}

export function ChatMessage({
  role,
  content,
  principleTag,
  isStreaming,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 py-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-500 font-display text-xs font-bold">
          N
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] space-y-2",
          isUser ? "text-right" : "text-left"
        )}
      >
        {/* Principle tag above AI message */}
        {!isUser && principleTag && (
          <PrincipleTag principleKey={principleTag} />
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-gold-500 text-background ml-auto"
              : "bg-card border border-border text-foreground"
          )}
        >
          {isUser ? (
            <p>{content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5">
              <ReactMarkdown>{content}</ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-0.5 bg-gold-500 animate-pulse" />
              )}
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[var(--text-muted)] text-xs font-medium">
          You
        </div>
      )}
    </div>
  );
}
