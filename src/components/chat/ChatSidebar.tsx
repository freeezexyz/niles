"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface ChatSessionItem {
  id: string;
  title: string | null;
  session_type: string;
  created_at: string;
}

interface ChatSidebarProps {
  sessions: ChatSessionItem[];
  className?: string;
}

export function ChatSidebar({ sessions, className }: ChatSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col border-r border-border bg-sidebar",
        className
      )}
    >
      <div className="p-3">
        <Link href="/chat">
          <Button className="w-full bg-gold-500 text-background hover:bg-gold-600 gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5">
          {sessions.map((session) => {
            const isActive = pathname === `/chat/${session.id}`;
            return (
              <Link
                key={session.id}
                href={`/chat/${session.id}`}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-sidebar-foreground hover:bg-[var(--niles-surface-hover)]"
                )}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-50" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {session.title || "New conversation"}
                  </p>
                  <p className="text-[10px] text-[var(--text-faint)]">
                    {formatDistanceToNow(new Date(session.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
