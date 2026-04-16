import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ClientCard } from "@/components/clients/ClientCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: clients } = user
    ? await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
    : { data: [] };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Clients
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {clients?.length || 0} client{clients?.length !== 1 ? "s" : ""} profiled
          </p>
        </div>
        <Link href="/clients/new">
          <Button className="bg-gold-500 text-background hover:bg-gold-600 gap-2">
            <Plus className="h-4 w-4" />
            New Client
          </Button>
        </Link>
      </div>

      {clients && clients.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/10 mb-4">
            <Plus className="h-6 w-6 text-gold-500" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            No clients yet
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">
            Create your first client profile to unlock AI-powered DNA assessments
            and personalized coaching.
          </p>
          <Link href="/clients/new" className="mt-4">
            <Button className="bg-gold-500 text-background hover:bg-gold-600">
              Create First Client
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
