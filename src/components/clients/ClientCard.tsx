import Link from "next/link";
import type { Client } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface ClientCardProps {
  client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
  const avgScore = Math.round(
    (client.p_purpose +
      client.p_visioning +
      client.p_knowledge +
      client.p_kindness +
      client.p_leadership +
      client.p_trust +
      client.p_emotional_intel) /
      7
  );

  return (
    <Link href={`/clients/${client.id}`}>
      <div className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-gold-500/30 hover:bg-[var(--niles-surface-hover)]">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-500">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {client.name}
            </h3>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {[client.role_title, client.company].filter(Boolean).join(" at ") || "No details"}
            </p>
          </div>
          {avgScore > 0 && (
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{avgScore}</p>
              <p className="text-[10px] text-[var(--text-faint)] uppercase">Score</p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {client.decision_style && (
            <Badge variant="outline" className="border-border text-[var(--text-muted)] text-[10px] capitalize">
              {client.decision_style}
            </Badge>
          )}
          {client.industry && (
            <Badge variant="outline" className="border-border text-[var(--text-muted)] text-[10px]">
              {client.industry}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
