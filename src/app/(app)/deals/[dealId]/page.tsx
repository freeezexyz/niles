"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RadarChart } from "@/components/deals/RadarChart";
import { HealthAlert } from "@/components/deals/HealthAlert";
import { DealActivityLog } from "@/components/deals/DealActivityLog";
import { HealthBar } from "@/components/shared/HealthBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, MessageSquare } from "lucide-react";
import type { Deal, DealActivity } from "@/lib/types";

const stageLabels: Record<string, string> = {
  prospecting: "Prospecting",
  vision_aligned: "Vision Aligned",
  trust_building: "Trust Building",
  leadership_phase: "Leadership Phase",
  closing: "Closing",
  won: "Won",
  lost: "Lost",
};

export default function DealDetailPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const { dealId } = use(params);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [activities, setActivities] = useState<DealActivity[]>([]);
  const [recalculating, setRecalculating] = useState(false);

  async function loadDeal() {
    const supabase = createClient();
    const { data } = await supabase
      .from("deals")
      .select("*, client:clients(id, name, company)")
      .eq("id", dealId)
      .single();
    setDeal(data);
  }

  async function loadActivities() {
    const supabase = createClient();
    const { data } = await supabase
      .from("deal_activities")
      .select("*")
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false })
      .limit(20);
    setActivities(data || []);
  }

  async function handleRecalculate() {
    setRecalculating(true);
    const res = await fetch(`/api/deals/${dealId}/recalculate-health`, {
      method: "POST",
    });
    if (res.ok) {
      await loadDeal();
      await loadActivities();
    }
    setRecalculating(false);
  }

  useEffect(() => {
    loadDeal();
    loadActivities();
  }, [dealId]);

  if (!deal) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading deal...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/pipeline"
            className="text-xs text-[var(--text-muted)] hover:text-foreground transition-colors"
          >
            &larr; Pipeline
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground mt-2">
            {deal.title}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge
              variant="outline"
              className="border-gold-500/30 text-gold-400 text-xs"
            >
              {stageLabels[deal.stage] || deal.stage}
            </Badge>
            {deal.value && (
              <span className="text-sm text-[var(--text-secondary)]">
                {deal.currency} {Number(deal.value).toLocaleString()}
              </span>
            )}
            {deal.client && (
              <Link
                href={`/clients/${deal.client.id}`}
                className="text-sm text-gold-500 hover:text-gold-400"
              >
                {deal.client.name}
              </Link>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/chat?dealId=${dealId}`}>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border text-[var(--text-secondary)]"
            >
              <MessageSquare className="h-3 w-3" />
              Coach
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={recalculating}
            className="gap-2 border-border text-[var(--text-secondary)]"
          >
            <RefreshCw
              className={`h-3 w-3 ${recalculating ? "animate-spin" : ""}`}
            />
            Recalculate
          </Button>
        </div>
      </div>

      {/* Health Alerts */}
      <HealthAlert deal={deal} />

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Deal Health Score</CardTitle>
            <span className="text-2xl font-bold text-gold-500">
              {deal.health_overall}
            </span>
          </CardHeader>
          <CardContent>
            <RadarChart deal={deal} />
          </CardContent>
        </Card>

        {/* Principle Breakdown */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Principle Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Ch.1 — Purpose", score: deal.health_purpose },
              { label: "Ch.2 — Visioning", score: deal.health_visioning },
              { label: "Ch.3 — Knowledge", score: deal.health_knowledge },
              { label: "Ch.4 — Kindness", score: deal.health_kindness },
              { label: "Ch.5 — Leadership", score: deal.health_leadership },
              { label: "Ch.6 — Trust", score: deal.health_trust },
              { label: "Ch.7 — EQ", score: deal.health_emotional_intel },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">
                    {item.label}
                  </span>
                  <span className="font-medium text-foreground">
                    {item.score}
                  </span>
                </div>
                <HealthBar score={item.score} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {deal.notes && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
              {deal.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Activity Log */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <DealActivityLog activities={activities} />
        </CardContent>
      </Card>
    </div>
  );
}
