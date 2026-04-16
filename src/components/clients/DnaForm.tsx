"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const DECISION_STYLES = [
  { value: "analytical", label: "Analytical", desc: "Data-driven, methodical, detail-oriented" },
  { value: "driver", label: "Driver", desc: "Results-focused, decisive, fast-paced" },
  { value: "amiable", label: "Amiable", desc: "Relationship-first, collaborative, patient" },
  { value: "expressive", label: "Expressive", desc: "Visionary, creative, big-picture thinker" },
];

const MOTIVATIONS = [
  { value: "long_term_roi", label: "Long-term ROI" },
  { value: "quick_wins", label: "Quick Wins" },
  { value: "risk_reduction", label: "Risk Reduction" },
  { value: "innovation", label: "Innovation" },
  { value: "cost_savings", label: "Cost Savings" },
  { value: "market_share", label: "Market Share" },
];

const COMM_PREFS = [
  { value: "data_reports", label: "Data & Reports" },
  { value: "visual", label: "Visual" },
  { value: "verbal", label: "Verbal" },
  { value: "written", label: "Written" },
];

interface DnaFormProps {
  initialData?: {
    id?: string;
    name?: string;
    company?: string;
    role_title?: string;
    industry?: string;
    decision_style?: string;
    primary_motivation?: string;
    communication_pref?: string;
    key_concerns?: string;
  };
}

export function DnaForm({ initialData }: DnaFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: initialData?.name || "",
    company: initialData?.company || "",
    role_title: initialData?.role_title || "",
    industry: initialData?.industry || "",
    decision_style: initialData?.decision_style || "",
    primary_motivation: initialData?.primary_motivation || "",
    communication_pref: initialData?.communication_pref || "",
    key_concerns: initialData?.key_concerns || "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Client name is required");
      return;
    }

    setError(null);
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Create or update client
      let clientId = initialData?.id;
      if (clientId) {
        await supabase.from("clients").update(form).eq("id", clientId);
      } else {
        const { data, error: insertError } = await supabase
          .from("clients")
          .insert({ ...form, user_id: user.id })
          .select("id")
          .single();
        if (insertError) throw insertError;
        clientId = data.id;
      }

      // Generate DNA profile
      setGenerating(true);
      const response = await fetch(`/api/clients/${clientId}/generate-dna`, {
        method: "POST",
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate DNA profile");
      }

      router.push(`/clients/${clientId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
      setGenerating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Basic Info */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Client's full name"
                className="bg-[var(--input)]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="Company name"
                className="bg-[var(--input)]"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role_title">Role / Title</Label>
              <Input
                id="role_title"
                value={form.role_title}
                onChange={(e) => update("role_title", e.target.value)}
                placeholder="e.g. VP of Engineering"
                className="bg-[var(--input)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
                placeholder="e.g. Financial Services"
                className="bg-[var(--input)]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Style */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Decision Style</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {DECISION_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => update("decision_style", style.value)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  form.decision_style === style.value
                    ? "border-gold-500 bg-gold-500/5"
                    : "border-border bg-card hover:border-gold-500/30"
                }`}
              >
                <p className={`text-sm font-medium ${form.decision_style === style.value ? "text-gold-500" : "text-foreground"}`}>
                  {style.label}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{style.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Motivation & Communication */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Motivation & Communication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Primary Motivation</Label>
            <div className="flex flex-wrap gap-2">
              {MOTIVATIONS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => update("primary_motivation", m.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    form.primary_motivation === m.value
                      ? "border-gold-500 bg-gold-500/10 text-gold-500"
                      : "border-border text-[var(--text-secondary)] hover:border-gold-500/30"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Communication Preference</Label>
            <div className="flex flex-wrap gap-2">
              {COMM_PREFS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => update("communication_pref", c.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    form.communication_pref === c.value
                      ? "border-gold-500 bg-gold-500/10 text-gold-500"
                      : "border-border text-[var(--text-secondary)] hover:border-gold-500/30"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="key_concerns">Key Concerns</Label>
            <textarea
              id="key_concerns"
              value={form.key_concerns}
              onChange={(e) => update("key_concerns", e.target.value)}
              placeholder="What keeps this client up at night? What are their biggest priorities?"
              rows={3}
              className="w-full rounded-xl border border-border bg-[var(--input)] px-4 py-3 text-sm text-foreground placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        disabled={saving}
        className="bg-gold-500 text-background hover:bg-gold-600 font-semibold gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating DNA Profile...
          </>
        ) : saving ? (
          "Saving..."
        ) : initialData?.id ? (
          "Update & Regenerate DNA"
        ) : (
          "Create Client & Generate DNA"
        )}
      </Button>
    </form>
  );
}
