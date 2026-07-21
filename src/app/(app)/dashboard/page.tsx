import { createClient } from "@/lib/supabase/server";
import { CoachGreeting } from "@/components/dashboard/CoachGreeting";
import { RepDevelopmentCard } from "@/components/dashboard/RepDevelopmentCard";
import { DealHealthOverview } from "@/components/dashboard/DealHealthOverview";
import { TodoList } from "@/components/dashboard/TodoList";
import { CalendarDay } from "@/components/dashboard/CalendarDay";
import { StreakCounter } from "@/components/dashboard/StreakCounter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { repRowToScores } from "@/lib/rep-score";
import type { Deal } from "@/lib/types";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: deals }, { data: repScore }] = user
    ? await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("deals").select("*").eq("user_id", user.id),
        supabase
          .from("rep_principle_scores")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])
    : [{ data: null }, { data: null }, { data: null }];

  const today = format(new Date(), "EEEE, MMMM d");
  const firstName = profile?.full_name?.split(" ")[0] ?? null;
  const repScores = repScore ? repRowToScores(repScore) : null;

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
            {firstName ? ` — Welcome back, ${firstName}` : ""}
          </p>
        </div>
        {profile && <StreakCounter days={profile.streak_days} />}
      </div>

      {/* Proactive coach hero */}
      <CoachGreeting firstName={firstName} />

      {/* Rep development + deal health */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-display">
              Your Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            {repScores ? (
              <RepDevelopmentCard scores={repScores} />
            ) : (
              <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                Your development score will appear as you coach with Niles.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-display">Deal Health</CardTitle>
          </CardHeader>
          <CardContent>
            <DealHealthOverview deals={(deals as Deal[]) || []} />
          </CardContent>
        </Card>
      </div>

      {/* Today's focus + schedule */}
      <div className="grid gap-4 lg:grid-cols-2">
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

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-display">Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarDay />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
