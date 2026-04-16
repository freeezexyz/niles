import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/anthropic/client";
import { buildDnaProfilePrompt } from "@/lib/prompts/dna-profile";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get client data
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Generate DNA profile with Claude
  const anthropic = getAnthropicClient();
  const prompt = buildDnaProfilePrompt(client);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const content =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Parse the JSON response
  let dnaProfile;
  try {
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    dnaProfile = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse DNA profile" },
      { status: 500 }
    );
  }

  // Update client with DNA profile and principle scores
  const { error: updateError } = await supabase
    .from("clients")
    .update({
      dna_profile: dnaProfile,
      p_purpose: dnaProfile.principle_scores?.purpose || 0,
      p_visioning: dnaProfile.principle_scores?.visioning || 0,
      p_knowledge: dnaProfile.principle_scores?.knowledge || 0,
      p_kindness: dnaProfile.principle_scores?.kindness || 0,
      p_leadership: dnaProfile.principle_scores?.leadership || 0,
      p_trust: dnaProfile.principle_scores?.trust || 0,
      p_emotional_intel: dnaProfile.principle_scores?.emotional_intel || 0,
    })
    .eq("id", clientId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, dna: dnaProfile });
}
