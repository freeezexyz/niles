import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { BookOpen, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReviewsListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reviews } = user
    ? await supabase
        .from("weekly_reviews")
        .select("*")
        .eq("user_id", user.id)
        .order("week_start", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Weekly Reviews
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            AI-generated coaching insights from your week
          </p>
        </div>
        <GenerateButton />
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => {
            const summary = review.summary as any;
            return (
              <Link key={review.id} href={`/reviews/${review.id}`}>
                <Card className="border-border bg-card hover:border-gold-500/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Week of {format(new Date(review.week_start), "MMMM d, yyyy")}
                        </p>
                        <div className="flex gap-3 mt-1 text-xs text-[var(--text-muted)]">
                          {summary.wins > 0 && (
                            <span className="text-principle-trust">{summary.wins} win{summary.wins !== 1 ? "s" : ""}</span>
                          )}
                          {summary.deals_moved > 0 && (
                            <span>{summary.deals_moved} deal{summary.deals_moved !== 1 ? "s" : ""} moved</span>
                          )}
                          {summary.deals_stagnant > 0 && (
                            <span className="text-gold-600">{summary.deals_stagnant} stagnant</span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={review.is_read
                          ? "border-border text-[var(--text-faint)]"
                          : "border-gold-500/30 text-gold-500"
                        }
                      >
                        {review.is_read ? "Read" : "New"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-10 w-10 text-[var(--text-faint)] mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground">
            No reviews yet
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">
            Weekly reviews are generated every Monday. You can also generate one now.
          </p>
        </div>
      )}
    </div>
  );
}

function GenerateButton() {
  return (
    <form
      action={async () => {
        "use server";
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/cron/weekly-review`);
      }}
    >
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="gap-2 border-border text-[var(--text-secondary)]"
      >
        <RefreshCw className="h-3 w-3" />
        Generate Now
      </Button>
    </form>
  );
}
