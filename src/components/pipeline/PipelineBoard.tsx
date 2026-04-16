"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { createClient } from "@/lib/supabase/client";
import { PipelineColumn } from "./PipelineColumn";
import { PipelineStats } from "./PipelineStats";
import { DealCard } from "./DealCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import type { Deal, DealStage } from "@/lib/types";

const STAGES: { id: DealStage; title: string; emoji: string }[] = [
  { id: "prospecting", title: "Prospecting", emoji: "\u{1F31F}" },
  { id: "vision_aligned", title: "Vision Aligned", emoji: "\u{1F441}\u{FE0F}" },
  { id: "trust_building", title: "Trust Building", emoji: "\u{1F91D}" },
  { id: "leadership_phase", title: "Leadership Phase", emoji: "\u{1F451}" },
  { id: "closing", title: "Closing", emoji: "\u{26A1}" },
];

export function PipelineBoard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [newDealTitle, setNewDealTitle] = useState("");
  const [newDealValue, setNewDealValue] = useState("");
  const [creating, setCreating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  async function loadDeals() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("deals")
      .select("*, client:clients(id, name, company)")
      .eq("user_id", user.id)
      .in("stage", STAGES.map((s) => s.id))
      .order("updated_at", { ascending: false });

    setDeals(data || []);
  }

  useEffect(() => {
    loadDeals();
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const deal = deals.find((d) => d.id === event.active.id);
    setActiveDeal(deal || null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as DealStage;

    // Check if dropped on a column (stage)
    if (!STAGES.find((s) => s.id === newStage)) return;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    );

    // Persist
    await fetch(`/api/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
  }

  async function handleCreateDeal(e: React.FormEvent) {
    e.preventDefault();
    if (!newDealTitle.trim()) return;
    setCreating(true);

    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newDealTitle.trim(),
        value: newDealValue ? parseFloat(newDealValue) : null,
        stage: "prospecting",
      }),
    });

    if (res.ok) {
      setNewDealTitle("");
      setNewDealValue("");
      setShowNewDeal(false);
      await loadDeals();
    }
    setCreating(false);
  }

  return (
    <div className="space-y-6">
      <PipelineStats deals={deals} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              id={stage.id}
              title={stage.title}
              emoji={stage.emoji}
              deals={deals.filter((d) => d.stage === stage.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? <DealCard deal={activeDeal} /> : null}
        </DragOverlay>
      </DndContext>

      {/* New Deal button */}
      <Button
        onClick={() => setShowNewDeal(true)}
        className="bg-gold-500 text-background hover:bg-gold-600 gap-2"
      >
        <Plus className="h-4 w-4" />
        New Deal
      </Button>

      {/* New Deal dialog */}
      <Dialog open={showNewDeal} onOpenChange={setShowNewDeal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>New Deal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateDeal} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dealTitle">Deal Title</Label>
              <Input
                id="dealTitle"
                value={newDealTitle}
                onChange={(e) => setNewDealTitle(e.target.value)}
                placeholder="e.g. Acme Corp Enterprise License"
                className="bg-[var(--input)]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealValue">Value (USD)</Label>
              <Input
                id="dealValue"
                type="number"
                value={newDealValue}
                onChange={(e) => setNewDealValue(e.target.value)}
                placeholder="e.g. 50000"
                className="bg-[var(--input)]"
              />
            </div>
            <Button
              type="submit"
              disabled={creating}
              className="w-full bg-gold-500 text-background hover:bg-gold-600"
            >
              {creating ? "Creating..." : "Create Deal"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
