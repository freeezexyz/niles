import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeamSummaryCards } from "@/components/team/TeamSummaryCards";
import { RepTable } from "@/components/team/RepTable";
import { TeamAlert } from "@/components/team/TeamAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function TeamDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check role and tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !["dynasty", "empire"].includes(profile.tier)) {
    return (
      <div className="p-4 lg:p-6 flex flex-col items-center justify-center py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Team Dashboard
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-2 max-w-sm">
          Team features are available on the Dynasty and Empire plans.
          Upgrade to access team insights, rep performance tracking, and AI coaching alerts.
        </p>
      </div>
    );
  }

  if (!profile.team_id) {
    return (
      <div className="p-4 lg:p-6 flex flex-col items-center justify-center py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Team Dashboard
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-2 max-w-sm">
          You&apos;re not part of a team yet. Create or join a team in Settings to access the Team Dashboard.
        </p>
      </div>
    );
  }

  // Get team members
  const { data: teamMembers } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .eq("team_id", profile.team_id);

  // Get all deals for team members
  const memberIds = (teamMembers || []).map((m) => m.id);
  const { data: teamDeals } = await supabase
    .from("deals")
    .select("*")
    .in("user_id", memberIds)
    .not("stage", "in", '("won","lost")');

  const allDeals = teamDeals || [];
  const totalPipeline = allDeals.reduce((s, d) => s + (Number(d.value) || 0), 0);
  const avgHealth = allDeals.length > 0
    ? Math.round(allDeals.reduce((s, d) => s + d.health_overall, 0) / allDeals.length)
    : 0;
  const atRisk = allDeals.filter((d) => d.health_overall < 40).length;

  // Build rep data
  const reps = (teamMembers || []).map((member) => {
    const memberDeals = allDeals.filter((d) => d.user_id === member.id);
    return {
      ...member,
      dealCount: memberDeals.length,
      avgHealth: memberDeals.length > 0
        ? Math.round(memberDeals.reduce((s, d) => s + d.health_overall, 0) / memberDeals.length)
        : 0,
      pipelineValue: memberDeals.reduce((s, d) => s + (Number(d.value) || 0), 0),
    };
  });

  // Generate alerts
  const alerts = reps
    .filter((r) => r.avgHealth > 0 && r.avgHealth < 50)
    .map((r) => ({
      repName: r.full_name,
      message: `Average deal health is ${r.avgHealth}/100. Consider a 1-on-1 coaching session.`,
    }));

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Team Dashboard
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {teamMembers?.length || 0} team member{teamMembers?.length !== 1 ? "s" : ""}
        </p>
      </div>

      <TeamSummaryCards
        pipelineValue={totalPipeline}
        avgHealth={avgHealth}
        atRiskCount={atRisk}
      />

      {alerts.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Coaching Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamAlert alerts={alerts} />
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Team Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <RepTable reps={reps} />
        </CardContent>
      </Card>
    </div>
  );
}
