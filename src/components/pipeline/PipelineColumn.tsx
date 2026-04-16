"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DealCard } from "./DealCard";
import type { Deal } from "@/lib/types";

interface PipelineColumnProps {
  id: string;
  title: string;
  emoji: string;
  deals: Deal[];
}

export function PipelineColumn({ id, title, emoji, deals }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const totalValue = deals.reduce(
    (sum, d) => sum + (Number(d.value) || 0),
    0
  );

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-[var(--surface)] transition-colors ${
        isOver ? "border-gold-500/40 bg-gold-500/5" : "border-border"
      }`}
    >
      {/* Column header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{emoji}</span>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-[10px] font-medium text-[var(--text-muted)]">
            {deals.length}
          </span>
        </div>
        {totalValue > 0 && (
          <p className="text-[10px] text-[var(--text-faint)] mt-1">
            ${totalValue.toLocaleString()}
          </p>
        )}
      </div>

      {/* Cards */}
      <SortableContext
        items={deals.map((d) => d.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-2 overflow-y-auto p-3 min-h-[100px]">
          {deals.length === 0 ? (
            <p className="text-center text-xs text-[var(--text-faint)] py-8">
              Drop deals here
            </p>
          ) : (
            deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}
