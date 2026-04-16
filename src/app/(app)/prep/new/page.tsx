"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Target } from "lucide-react";

export default function PreMeetingPrepPage() {
  const [meetingGoal, setMeetingGoal] = useState("");
  const [lastInteraction, setLastInteraction] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!meetingGoal.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/prep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingGoal, lastInteraction }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data.content);
    } else {
      const err = await res.json();
      setError(err.error || "Failed to generate prep");
    }
    setLoading(false);
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Pre-Meeting Prep
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Get a principle-mapped strategy before your next meeting
        </p>
      </div>

      {!result ? (
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Meeting Goal *</Label>
                <Input
                  id="goal"
                  value={meetingGoal}
                  onChange={(e) => setMeetingGoal(e.target.value)}
                  placeholder="e.g. Present the ROI case and get buy-in from the CFO"
                  className="bg-[var(--input)]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last">Last Interaction Notes</Label>
                <textarea
                  id="last"
                  value={lastInteraction}
                  onChange={(e) => setLastInteraction(e.target.value)}
                  placeholder="What happened in your last conversation? Any concerns raised?"
                  rows={4}
                  className="w-full rounded-xl border border-border bg-[var(--input)] px-4 py-3 text-sm text-foreground placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-500 text-background hover:bg-gold-600 gap-2"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Preparing strategy...</>
                ) : (
                  <><Target className="h-4 w-4" /> Generate Meeting Strategy</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base text-gradient-gold">Meeting Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none [&_h2]:text-gold-500 [&_h2]:font-display [&_h2]:text-sm [&_h2]:mt-6 [&_h2]:mb-2">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
            <Button
              variant="outline"
              className="mt-6 border-border text-[var(--text-secondary)]"
              onClick={() => { setResult(null); setMeetingGoal(""); setLastInteraction(""); }}
            >
              New Prep
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
