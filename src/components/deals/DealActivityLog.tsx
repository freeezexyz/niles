import { formatDistanceToNow } from "date-fns";
import type { DealActivity } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface DealActivityLogProps {
  activities: DealActivity[];
}

const activityIcons: Record<string, string> = {
  stage_change: "arrow-right",
  health_update: "activity",
  note: "file-text",
  chat_session: "message-square",
  pre_meeting: "calendar",
  debrief: "clipboard",
  email_sent: "mail",
  objection_handled: "shield",
  roleplay_completed: "swords",
  score_change: "trending-up",
};

const activityLabels: Record<string, string> = {
  stage_change: "Stage Change",
  health_update: "Health Update",
  note: "Note",
  chat_session: "Chat Session",
  pre_meeting: "Pre-Meeting",
  debrief: "Debrief",
  email_sent: "Email Sent",
  objection_handled: "Objection",
  roleplay_completed: "Role Play",
  score_change: "Score Change",
};

export function DealActivityLog({ activities }: DealActivityLogProps) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] py-4 text-center">
        No activity yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
        >
          <Badge
            variant="outline"
            className="border-border text-[var(--text-muted)] text-[10px] shrink-0 mt-0.5"
          >
            {activityLabels[activity.activity_type] || activity.activity_type}
          </Badge>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[var(--text-secondary)]">
              {activity.description || "No description"}
            </p>
            <p className="text-[10px] text-[var(--text-faint)] mt-1">
              {formatDistanceToNow(new Date(activity.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
