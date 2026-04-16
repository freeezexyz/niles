import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");

  let query = supabase
    .from("deals")
    .select("*, client:clients(id, name, company)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (stage && stage !== "all") {
    query = query.eq("stage", stage);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { data, error } = await supabase
    .from("deals")
    .insert({ ...body, user_id: user.id })
    .select("*, client:clients(id, name, company)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from("deal_activities").insert({
    deal_id: data.id,
    user_id: user.id,
    activity_type: "stage_change",
    description: `Deal created in ${data.stage} stage`,
    metadata: { new_stage: data.stage },
  });

  return NextResponse.json(data, { status: 201 });
}
