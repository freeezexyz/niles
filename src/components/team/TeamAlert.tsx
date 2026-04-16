import { AlertTriangle } from "lucide-react";

interface Alert {
  repName: string;
  message: string;
}

interface TeamAlertProps {
  alerts: Alert[];
}

export function TeamAlert({ alerts }: TeamAlertProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl border border-gold-500/20 bg-gold-500/5 p-3"
        >
          <AlertTriangle className="h-4 w-4 text-gold-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground font-medium">{alert.repName}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {alert.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
