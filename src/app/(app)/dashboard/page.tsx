import { createClient } from "@/lib/supabase/server";
import { TodoList } from "@/components/dashboard/TodoList";
import { CalendarDay } from "@/components/dashboard/CalendarDay";
import { WisdomCard } from "@/components/dashboard/WisdomCard";
import { StreakCounter } from "@/components/dashboard/StreakCounter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
    : { data: null };

  const today = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Command Center
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {today}
            {profile?.full_name ? ` \u2014 Welcome back, ${profile.full_name}` : ""}
          </p>
        </div>
        {profile && <StreakCounter days={profile.streak_days} />}
      </div>

      {/* Three-column grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Today's Focus */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-display">
              Today&apos;s Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TodoList />
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-display">Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarDay />
          </CardContent>
        </Card>

        {/* Pharaoh's Wisdom */}
        <Card className="border-border bg-card glow-gold">
          <CardHeader>
            <CardTitle className="text-sm font-display text-gradient-gold">
              Pharaoh&apos;s Wisdom
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WisdomCard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
