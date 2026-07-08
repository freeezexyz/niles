import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { MODELS } from "@/lib/anthropic/models";
import { queryPinecone, type BookChunk } from "@/lib/pinecone/query";
import { loadDealConversation } from "@/lib/deal-context";
import { buildActionDiagramPrompt } from "@/lib/prompts/action-diagram";
import type { Deal } from "@/lib/types";

export const maxDuration = 120;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Strip an accidental ```html / ``` code fence the model may wrap output in.
function unfence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:html)?\s*\n([\s\S]*?)\n```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

export async function POST(
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

  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .single<Deal>();

  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const conversation = await loadDealConversation(supabase, dealId);

  // Ground the strategy in the most relevant book passages. Degrade to no
  // grounding if the vector search is unavailable (e.g. keys not yet set).
  let bookContext: BookChunk[] = [];
  try {
    const query = [
      deal.title,
      deal.industry,
      deal.key_concerns,
      deal.primary_motivation?.replace(/_/g, " "),
      "next move strategy win the deal objection",
    ]
      .filter(Boolean)
      .join(" ");
    bookContext = await queryPinecone(query, { topK: 6 });
  } catch (err) {
    console.error("Action diagram: book grounding unavailable:", err);
  }

  const prompt = buildActionDiagramPrompt({ deal, bookContext, conversation });

  let content = "";
  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      // The signature free deliverable — quality is the moat, so Opus.
      model: MODELS.elaborate,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });
    content = response.content[0].type === "text" ? response.content[0].text : "";
  } catch (err) {
    console.error("Action diagram generation failed:", err);
    return NextResponse.json(
      { error: "Your action plan is unavailable right now. Please try again later." },
      { status: 502 }
    );
  }

  content = unfence(content);

  if (!content) {
    return NextResponse.json(
      { error: "The generator returned an empty action plan. Please try again." },
      { status: 502 }
    );
  }

  const title = `Action Plan — ${deal.contact_company || deal.title}`;

  const { data: output, error: insertError } = await supabase
    .from("deal_outputs")
    .insert({
      deal_id: dealId,
      user_id: user.id,
      output_type: "action_diagram",
      format: "html",
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
    activity_type: "action_diagram_generated",
    description: `Action plan generated for ${deal.contact_name || deal.title}`,
  });

  return NextResponse.json({ output });
}
