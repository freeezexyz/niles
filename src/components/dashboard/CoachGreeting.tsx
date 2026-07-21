"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";

const FALLBACK =
  "Welcome back. Open a deal and tell me where it stands — I'll coach you on the next move using the Pharaoh's principles.";

export function CoachGreeting({ firstName }: { firstName?: string | null }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/coach/summary");
      const data = await res.json();
      setSummary(typeof data.summary === "string" ? data.summary : null);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-gold-500/20 bg-card glow-gold p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-gold-500/10 p-2">
          <Sparkles className="h-5 w-5 text-gold-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-display uppercase tracking-wide text-gradient-gold">
            Niles{firstName ? ` · ${firstName}` : ""}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {loading ? "Reading your pipeline…" : summary || FALLBACK}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="text-[var(--text-muted)] hover:text-gold-500 transition-colors disabled:opacity-40"
          aria-label="Refresh coach summary"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
}
