import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function WeeklyReviewDetailPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  const { weekId } = await params;
  const supabase = await createClient();

  const { data: review } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("id", weekId)
    .single();

  if (!review) notFound();

  // Mark as read
  if (!review.is_read) {
    await supabase
      .from("weekly_reviews")
      .update({ is_read: true })
      .eq("id", weekId);
  }

  const summary = review.summary as any;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl">
      <Link
        href="/reviews"
        className="text-xs text-[var(--text-muted)] hover:text-foreground transition-colors"
      >
        &larr; All Reviews
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Week of {format(new Date(review.week_start), "MMMM d, yyyy")}
        </h1>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{summary.deals_moved ?? 0}</p>
          <p className="text-[10px] text-[var(--text-faint)] uppercase">Moved</p>
        </Card>
        <Card className="border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-gold-600">{summary.deals_stagnant ?? 0}</p>
          <p className="text-[10px] text-[var(--text-faint)] uppercase">Stagnant</p>
        </Card>
        <Card className="border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-principle-trust">{summary.wins ?? 0}</p>
          <p className="text-[10px] text-[var(--text-faint)] uppercase">Wins</p>
        </Card>
        <Card className="border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-destructive">{summary.losses ?? 0}</p>
          <p className="text-[10px] text-[var(--text-faint)] uppercase">Losses</p>
        </Card>
      </div>

      {/* Summary */}
      {summary.summary_text && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
              {summary.summary_text}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Priorities */}
      {summary.priorities?.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Top Priorities</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {summary.priorities.map((p: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-500 text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[var(--text-secondary)]">{p}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Blind Spots */}
      {summary.blind_spots?.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Blind Spots</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.blind_spots.map((b: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <Badge variant="outline" className="border-gold-600/30 text-gold-600 text-[10px] shrink-0 mt-0.5">
                    Watch
                  </Badge>
                  <p className="text-sm text-[var(--text-secondary)]">{b}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Wisdom Quote */}
      {summary.wisdom_quote && (
        <Card className="border-border bg-card glow-gold">
          <CardHeader>
            <CardTitle className="text-base text-gradient-gold">
              Pharaoh&apos;s Wisdom
            </CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-sm text-[var(--text-secondary)] italic leading-relaxed">
              &ldquo;{summary.wisdom_quote}&rdquo;
            </blockquote>
            <p className="text-xs text-[var(--text-faint)] mt-3">
              From The Pharaoh&apos;s Pitch by Ivan Yong
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
