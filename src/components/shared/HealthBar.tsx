import { cn } from "@/lib/utils";

interface HealthBarProps {
  score: number;
  className?: string;
  showLabel?: boolean;
}

export function HealthBar({ score, className, showLabel = false }: HealthBarProps) {
  const color =
    score >= 70
      ? "bg-principle-trust"
      : score >= 40
        ? "bg-gold-500"
        : "bg-destructive";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 flex-1 rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-[var(--text-muted)] w-8 text-right">
          {score}
        </span>
      )}
    </div>
  );
}
