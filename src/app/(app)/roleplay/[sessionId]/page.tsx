"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Flag, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function RolePlaySessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [debriefing, setDebriefing] = useState(false);
  const [debrief, setDebrief] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (data) {
        const msgs = data
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

        const debriefMsg = msgs.find((m) => m.role === "assistant" && m.content.startsWith("[DEBRIEF]"));
        if (debriefMsg) {
          setDebrief(debriefMsg.content.replace("[DEBRIEF]\n\n", ""));
          setMessages(msgs.filter((m) => m !== debriefMsg));
        } else {
          setMessages(msgs);
        }
      }
    }
    load();
  }, [sessionId]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput("");
    setSending(true);

    setMessages((prev) => [...prev, { role: "user", content: msg }]);

    const res = await fetch("/api/roleplay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "message", sessionId, message: msg }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    }
    setSending(false);
  }

  async function handleDebrief() {
    setDebriefing(true);
    const res = await fetch("/api/roleplay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "debrief", sessionId }),
    });

    if (res.ok) {
      const data = await res.json();
      setDebrief(data.content);
      setScore(data.score);
    }
    setDebriefing(false);
  }

  if (debrief) {
    return (
      <div className="p-4 lg:p-6 space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Role Play Debrief
          </h1>
          {score && (
            <div className="text-right">
              <p className="text-3xl font-bold text-gold-500">{score}</p>
              <p className="text-[10px] text-[var(--text-faint)] uppercase">Score</p>
            </div>
          )}
        </div>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="prose prose-invert prose-sm max-w-none [&_h2]:text-gold-500 [&_h2]:font-display [&_h2]:text-sm [&_h2]:mt-6 [&_h2]:mb-2">
              <ReactMarkdown>{debrief}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center py-2">
            <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider">Role Play In Progress</p>
          </div>
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                  C
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-gold-500 text-background"
                  : "bg-card border border-border text-foreground"
              }`}>
                {msg.role === "user" ? (
                  <p>{msg.content}</p>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[var(--text-muted)] text-xs">
                  You
                </div>
              )}
            </div>
          ))}
          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                C
              </div>
              <div className="rounded-2xl bg-card border border-border px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--text-muted)]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input + End Session */}
      <div className="border-t border-border bg-background p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Respond to the client..."
            className="flex-1 rounded-xl border border-border bg-[var(--input)] px-4 py-3 text-sm text-foreground placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-gold-500"
            disabled={sending || debriefing}
          />
          <Button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            size="icon"
            className="h-10 w-10 shrink-0 bg-gold-500 text-background hover:bg-gold-600"
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleDebrief}
            disabled={debriefing || messages.length < 4}
            variant="outline"
            className="shrink-0 border-border text-[var(--text-secondary)] gap-2"
          >
            {debriefing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
            End & Debrief
          </Button>
        </div>
      </div>
    </div>
  );
}
