import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { MODELS } from "@/lib/anthropic/models";
import { queryPinecone, type BookChunk } from "@/lib/pinecone/query";
import { loadDealConversation } from "@/lib/deal-context";
import { buildProposalPrompt } from "@/lib/prompts/proposal";
import type { Deal } from "@/lib/types";

export const maxDuration = 120;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
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

  const { extraContext } = await req.json().catch(() => ({}));

  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .single<Deal>();

  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const conversation = await loadDealConversation(supabase, dealId);

  // Ground the proposal in the most relevant book passages. Degrade to no
  // grounding if the vector search is unavailable (e.g. keys not yet set).
  let bookContext: BookChunk[] = [];
  try {
    const query = [
      deal.title,
      deal.industry,
      deal.key_concerns,
      deal.primary_motivation?.replace(/_/g, " "),
      "winning proposal close the deal",
    ]
      .filter(Boolean)
      .join(" ");
    bookContext = await queryPinecone(query, { topK: 6 });
  } catch (err) {
    console.error("Proposal: book grounding unavailable:", err);
  }

  const prompt = buildProposalPrompt({
    deal,
    bookContext,
    conversation,
    extraContext,
  });

  let content = "";
  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: MODELS.elaborate,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });
    content = response.content[0].type === "text" ? response.content[0].text : "";
  } catch (err) {
    console.error("Proposal generation failed:", err);
    return NextResponse.json(
      { error: "Proposal generation is unavailable right now. Please try again later." },
      { status: 502 }
    );
  }

  if (!content.trim()) {
    return NextResponse.json(
      { error: "The generator returned an empty proposal. Please try again." },
      { status: 502 }
    );
  }

  const title = `Proposal — ${deal.contact_company || deal.title}`;

  const { data: output, error: insertError } = await supabase
    .from("deal_outputs")
    .insert({
      deal_id: dealId,
      user_id: user.id,
      output_type: "proposal",
      format: "markdown",
      title,
      content,
    })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase.from("deal_activities").insert({
    deal_id: dealId,
    user_id: user.id,
    activity_type: "proposal_generated",
    description: `Proposal generated for ${deal.contact_name || deal.title}`,
  });

  return NextResponse.json({ output });
}
