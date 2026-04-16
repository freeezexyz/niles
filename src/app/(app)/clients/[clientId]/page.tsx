import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DnaProfile } from "@/components/clients/DnaProfile";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (!client) notFound();

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <Link
          href="/clients"
          className="text-xs text-[var(--text-muted)] hover:text-foreground transition-colors"
        >
          &larr; All Clients
        </Link>
        <Link href={`/clients/new?edit=${clientId}`}>
          <Button variant="outline" size="sm" className="gap-2 border-border text-[var(--text-secondary)]">
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        </Link>
      </div>
      <DnaProfile client={client} />
    </div>
  );
}
