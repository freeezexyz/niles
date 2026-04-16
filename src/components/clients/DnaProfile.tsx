"use client";

import type { Client } from "@/lib/types";
import { PRINCIPLES, type PrincipleKey } from "@/lib/utils/principles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DnaProfileProps {
  client: Client;
}

const principleScoreKeys: { key: PrincipleKey; field: keyof Client }[] = [
  { key: "purpose", field: "p_purpose" },
  { key: "visioning", field: "p_visioning" },
  { key: "knowledge", field: "p_knowledge" },
  { key: "kindness", field: "p_kindness" },
  { key: "leadership", field: "p_leadership" },
  { key: "trust", field: "p_trust" },
  { key: "emotional", field: "p_emotional_intel" },
];

const principleBarColors: Record<PrincipleKey, string> = {
  purpose: "bg-principle-purpose",
  visioning: "bg-principle-visioning",
  knowledge: "bg-principle-knowledge",
  kindness: "bg-principle-kindness",
  leadership: "bg-principle-leadership",
  trust: "bg-principle-trust",
  emotional: "bg-principle-emotional",
};

export function DnaProfile({ client }: DnaProfileProps) {
  const dna = client.dna_profile as {
    personality_summary?: string;
    coaching_approach?: string;
    strongest_principle?: string;
    weakest_principle?: string;
    next_best_action?: string;
  } | null;

  return (
    <div className="space-y-6">
      {/* Client header */}
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          {client.name}
        </h2>
        <div className="flex items-center gap-2 mt-1 text-sm text-[var(--text-secondary)]">
          {client.role_title && <span>{client.role_title}</span>}
          {client.role_title && client.company && <span>at</span>}
          {client.company && <span>{client.company}</span>}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {client.decision_style && (
            <Badge variant="outline" className="border-gold-500/30 text-gold-400 text-xs capitalize">
              {client.decision_style}
            </Badge>
          )}
          {client.primary_motivation && (
            <Badge variant="outline" className="border-border text-[var(--text-secondary)] text-xs">
              {client.primary_motivation.replace(/_/g, " ")}
            </Badge>
          )}
          {client.communication_pref && (
            <Badge variant="outline" className="border-border text-[var(--text-secondary)] text-xs">
              {client.communication_pref.replace(/_/g, " ")}
            </Badge>
          )}
          {client.industry && (
            <Badge variant="outline" className="border-border text-[var(--text-secondary)] text-xs">
              {client.industry}
            </Badge>
          )}
        </div>
      </div>

      {/* Principle Resonance Scores */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Principle Resonance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {principleScoreKeys.map(({ key, field }) => {
            const principle = PRINCIPLES[key];
            const score = (client[field] as number) || 0;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">
                    {principle.chapterLabel} — {principle.name}
                  </span>
                  <span className="font-medium text-foreground">{score}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all ${principleBarColors[key]}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* AI-Generated DNA Profile */}
      {dna && (
        <>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Personality Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {dna.personality_summary}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Coaching Approach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {dna.coaching_approach}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gold-500/20 bg-card glow-gold">
            <CardHeader>
              <CardTitle className="text-base text-gradient-gold">
                Next Best Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">
                {dna.next_best_action}
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* Key Concerns */}
      {client.key_concerns && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Key Concerns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {client.key_concerns}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
