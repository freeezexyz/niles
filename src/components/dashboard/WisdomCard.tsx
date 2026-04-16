"use client";

import { useState, useEffect } from "react";
import { PRINCIPLES, type PrincipleKey } from "@/lib/utils/principles";
import { RefreshCw } from "lucide-react";

interface WisdomQuote {
  quote: string;
  principle: PrincipleKey;
  chapter: number;
}

export function WisdomCard() {
  const [wisdom, setWisdom] = useState<WisdomQuote | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadWisdom() {
    setLoading(true);
    const res = await fetch("/api/wisdom/random");
    if (res.ok) {
      const data = await res.json();
      setWisdom(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadWisdom();
  }, []);

  if (!wisdom) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-[var(--text-muted)]">Loading wisdom...</p>
      </div>
    );
  }

  const principle = PRINCIPLES[wisdom.principle];

  return (
    <div className="space-y-3">
      <blockquote className="text-sm text-[var(--text-secondary)] italic leading-relaxed">
        &ldquo;{wisdom.quote}&rdquo;
      </blockquote>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gold-600 uppercase tracking-wider">
          CH.{wisdom.chapter} — {principle?.name || wisdom.principle}
        </p>
        <button
          onClick={loadWisdom}
          disabled={loading}
          className="text-[var(--text-faint)] hover:text-foreground transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
}
