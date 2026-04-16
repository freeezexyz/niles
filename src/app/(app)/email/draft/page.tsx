"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Copy, Check } from "lucide-react";

const EMAIL_INTENTS = [
  "Follow-up after meeting",
  "Initial outreach / cold email",
  "Proposal send",
  "Check-in / nurture",
  "Thank you note",
  "Meeting request",
  "Re-engagement after silence",
  "Custom",
];

export default function EmailDraftPage() {
  const [intent, setIntent] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!intent.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/email/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent, additionalContext: context }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data.content);
    } else {
      const err = await res.json();
      setError(err.error || "Failed to draft email");
    }
    setLoading(false);
  }

  function handleCopy() {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Email Drafting
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          AI-drafted emails calibrated to your client&apos;s DNA
        </p>
      </div>

      {!result ? (
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email Intent *</Label>
                <div className="flex flex-wrap gap-2">
                  {EMAIL_INTENTS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIntent(i)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        intent === i
                          ? "border-gold-500 bg-gold-500/10 text-gold-500"
                          : "border-border text-[var(--text-secondary)] hover:border-gold-500/30"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Additional Context</Label>
                <textarea
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Any specifics — what to mention, what to avoid, key points to hit..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-[var(--input)] px-4 py-3 text-sm text-foreground placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                disabled={loading || !intent}
                className="w-full bg-gold-500 text-background hover:bg-gold-600 gap-2"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Drafting email...</>
                ) : (
                  <><Mail className="h-4 w-4" /> Draft Email</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base text-gradient-gold">Email Draft</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2 border-border text-[var(--text-secondary)]"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none [&_h2]:text-gold-500 [&_h2]:font-display [&_h2]:text-sm [&_h2]:mt-6 [&_h2]:mb-2">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
            <Button
              variant="outline"
              className="mt-6 border-border text-[var(--text-secondary)]"
              onClick={() => { setResult(null); setIntent(""); setContext(""); }}
            >
              New Draft
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
