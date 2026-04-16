"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield } from "lucide-react";

export default function ObjectionHandlerPage() {
  const [objection, setObjection] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!objection.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/objection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objection }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data.content);
    } else {
      const err = await res.json();
      setError(err.error || "Failed to handle objection");
    }
    setLoading(false);
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Objection Handler
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Paste the exact objection you received — Niles will give you a principle-grounded strategy
        </p>
      </div>

      {!result ? (
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="objection">The Objection *</Label>
                <textarea
                  id="objection"
                  value={objection}
                  onChange={(e) => setObjection(e.target.value)}
                  placeholder="e.g. Your price is too high, or We're happy with our current vendor"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-[var(--input)] px-4 py-3 text-sm text-foreground placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-gold-500"
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-500 text-background hover:bg-gold-600 gap-2"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing objection...</>
                ) : (
                  <><Shield className="h-4 w-4" /> Handle This Objection</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base text-gradient-gold">Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none [&_h2]:text-gold-500 [&_h2]:font-display [&_h2]:text-sm [&_h2]:mt-6 [&_h2]:mb-2">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
            <Button
              variant="outline"
              className="mt-6 border-border text-[var(--text-secondary)]"
              onClick={() => { setResult(null); setObjection(""); }}
            >
              New Objection
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
