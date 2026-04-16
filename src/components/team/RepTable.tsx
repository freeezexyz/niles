import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HealthBar } from "@/components/shared/HealthBar";

interface Rep {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  dealCount: number;
  avgHealth: number;
  pipelineValue: number;
}

interface RepTableProps {
  reps: Rep[];
}

export function RepTable({ reps }: RepTableProps) {
  if (reps.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] text-center py-8">
        No team members found
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
            <th className="text-left py-3 px-4">Rep</th>
            <th className="text-left py-3 px-4">Role</th>
            <th className="text-right py-3 px-4">Deals</th>
            <th className="text-right py-3 px-4">Pipeline</th>
            <th className="text-left py-3 px-4 w-32">Health</th>
          </tr>
        </thead>
        <tbody>
          {reps.map((rep) => (
            <tr
              key={rep.id}
              className="border-b border-border hover:bg-[var(--niles-surface-hover)] transition-colors"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gold-500/10 text-gold-500 text-xs font-medium">
                      {rep.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{rep.full_name}</p>
                    <p className="text-[10px] text-[var(--text-faint)]">{rep.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <Badge variant="outline" className="border-border text-[var(--text-muted)] text-[10px] capitalize">
                  {rep.role.replace(/_/g, " ")}
                </Badge>
              </td>
              <td className="py-3 px-4 text-right text-sm text-foreground">
                {rep.dealCount}
              </td>
              <td className="py-3 px-4 text-right text-sm text-gold-500">
                ${rep.pipelineValue.toLocaleString()}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <HealthBar score={rep.avgHealth} className="flex-1" />
                  <span className="text-xs text-[var(--text-muted)] w-6 text-right">
                    {rep.avgHealth}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
