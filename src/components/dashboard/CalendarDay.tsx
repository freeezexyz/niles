"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { CalendarEvent } from "@/lib/types";

const eventTypeColors: Record<string, string> = {
  meeting: "border-principle-purpose/40 text-principle-purpose",
  call: "border-principle-trust/40 text-principle-trust",
  demo: "border-principle-visioning/40 text-principle-visioning",
  auto: "border-gold-500/40 text-gold-500",
  review: "border-principle-knowledge/40 text-principle-knowledge",
};

export function CalendarDay() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    async function loadEvents() {
      const supabase = createClient();
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        .gte("starts_at", startOfDay)
        .lt("starts_at", endOfDay)
        .order("starts_at", { ascending: true });

      setEvents(data || []);
    }
    loadEvents();
  }, []);

  if (events.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] text-center py-4">
        No events today. Enjoy the open road.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
        >
          <div className="text-center shrink-0 w-12">
            <p className="text-xs font-medium text-foreground">
              {format(new Date(event.starts_at), "HH:mm")}
            </p>
            <p className="text-[10px] text-[var(--text-faint)]">
              {format(new Date(event.ends_at), "HH:mm")}
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              {event.title}
            </p>
            {event.description && (
              <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                {event.description}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`text-[9px] shrink-0 ${eventTypeColors[event.event_type] || ""}`}
          >
            {event.event_type}
          </Badge>
        </div>
      ))}
    </div>
  );
}
