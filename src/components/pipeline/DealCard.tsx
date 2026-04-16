"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HealthBar } from "@/components/shared/HealthBar";
import type { Deal } from "@/lib/types";

interface DealCardProps {
  deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const clientName = deal.client?.name;
  const clientCompany = deal.client?.company;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-xl border border-border bg-card p-3 cursor-grab active:cursor-grabbing hover:border-gold-500/30 transition-colors"
    >
      <Link href={`/deals/${deal.id}`} className="block" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-medium text-foreground truncate">
          {deal.title}
        </p>
        {(clientName || clientCompany) && (
          <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
            {[clientName, clientCompany].filter(Boolean).join(" — ")}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          {deal.value ? (
            <span className="text-xs font-medium text-gold-500">
              {deal.currency} {Number(deal.value).toLocaleString()}
            </span>
          ) : (
            <span />
          )}
          <span className="text-xs font-medium text-[var(--text-muted)]">
            {deal.health_overall}
          </span>
        </div>
        <HealthBar score={deal.health_overall} className="mt-1.5" />
      </Link>
    </div>
  );
}
