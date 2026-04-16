"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Swords } from "lucide-react";

const INDUSTRIES = ["Technology", "Financial Services", "Healthcare", "Manufacturing", "Retail", "Professional Services", "Real Estate", "Education"];
const SENIORITIES = ["C-Suite (CEO/CFO/CTO)", "VP / Director", "Senior Manager", "Manager", "Individual Contributor"];
const STAGES = ["Discovery Call", "Product Demo", "Proposal Review", "Negotiation", "Final Close"];
const DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"];

export default function RolePlaySetupPage() {
  const router = useRouter();
  const [industry, setIndustry] = useState("");
  const [seniority, setSeniority] = useState("");
  const [dealStage, setDealStage] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    if (!industry || !seniority || !dealStage || !difficulty) {
      setError("Please select all options");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/roleplay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "start",
        setup: { industry, seniority, dealStage, difficulty },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/roleplay/${data.sessionId}`);
    } else {
      const err = await res.json();
      setError(err.error || "Failed to start role play");
      setLoading(false);
    }
  }

  function SelectGrid({ options, value, onChange, label }: { options: string[]; value: string; onChange: (v: string) => void; label: string }) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                value === opt
                  ? "border-gold-500 bg-gold-500/10 text-gold-500"
                  : "border-border text-[var(--text-secondary)] hover:border-gold-500/30"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Role Play Practice
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Practice your pitch against an AI client. Get scored on the 7 Pharaoh Principles.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Configure Your Scenario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SelectGrid options={INDUSTRIES} value={industry} onChange={setIndustry} label="Industry" />
          <SelectGrid options={SENIORITIES} value={seniority} onChange={setSeniority} label="Client Seniority" />
          <SelectGrid options={STAGES} value={dealStage} onChange={setDealStage} label="Deal Stage" />
          <SelectGrid options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} label="Difficulty" />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-gold-500 text-background hover:bg-gold-600 gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Starting session...</>
            ) : (
              <><Swords className="h-4 w-4" /> Start Role Play</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
