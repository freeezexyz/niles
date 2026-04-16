import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const { dealId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("deals")
    .select("*, client:clients(id, name, company, decision_style, primary_motivation)")
    .eq("id", dealId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const { dealId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Get current deal for stage change logging
  const { data: currentDeal } = await supabase
    .from("deals")
    .select("stage")
    .eq("id", dealId)
    .single();

  const { data, error } = await supabase
    .from("deals")
    .update(body)
    .eq("id", dealId)
    .select("*, client:clients(id, name, company)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log stage change if applicable
  if (body.stage && currentDeal && body.stage !== currentDeal.stage) {
    await supabase.from("deal_activities").insert({
      deal_id: dealId,
      user_id: user.id,
      activity_type: "stage_change",
      description: `Stage changed from ${currentDeal.stage} to ${body.stage}`,
      metadata: {
        old_stage: currentDeal.stage,
        new_stage: body.stage,
      },
    });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ dealId: string }> }
) {
  const { dealId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("deals").delete().eq("id", dealId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
