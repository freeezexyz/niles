import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { MODELS } from "@/lib/anthropic/models";
import { loadDealConversation } from "@/lib/deal-context";
import { buildDeckPrompt, type DeckFormat } from "@/lib/prompts/deck";
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

  const body = await req.json().catch(() => ({}));
  const format: DeckFormat = body?.format === "llm" ? "llm" : "html";

  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .single<Deal>();

  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  // Prefer the most recent proposal as source material; fall back to the raw
  // conversation transcript if no proposal has been generated yet.
  const { data: latestProposal } = await supabase
    .from("deal_outputs")
    .select("content")
    .eq("deal_id", dealId)
    .eq("output_type", "proposal")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const source =
    latestProposal?.content || (await loadDealConversation(supabase, dealId));

  const prompt = buildDeckPrompt({ deal, source, format });

  let content = "";
  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      // HTML deck is the polished payoff (Opus); the LLM outline is bulk (Haiku).
      model: format === "html" ? MODELS.elaborate : MODELS.bulk,
      max_tokens: format === "html" ? 8192 : 2048,
      messages: [{ role: "user", content: prompt }],
    });
    content = response.content[0].type === "text" ? response.content[0].text : "";
  } catch (err) {
    console.error("Deck generation failed:", err);
    return NextResponse.json(
      { error: "Deck generation is unavailable right now. Please try again later." },
      { status: 502 }
    );
  }

  content = format === "html" ? unfence(content) : content.trim();

  if (!content) {
    return NextResponse.json(
      { error: "The generator returned an empty deck. Please try again." },
      { status: 502 }
    );
  }

  const title = `${format === "html" ? "Deck" : "Deck outline"} — ${
    deal.contact_company || deal.title
  }`;

  const { data: output, error: insertError } = await supabase
    .from("deal_outputs")
    .insert({
      deal_id: dealId,
      user_id: user.id,
      output_type: format === "html" ? "deck_html" : "deck_llm",
      format: format === "html" ? "html" : "text",
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
    activity_type: "deck_generated",
    description: `${format === "html" ? "HTML deck" : "Copy-for-LLM deck"} generated for ${
      deal.contact_name || deal.title
    }`,
  });

  return NextResponse.json({ output });
}
