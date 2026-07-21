import type { Deal } from "@/lib/types";

interface EmailDraftOptions {
  intent: string;
  additionalContext: string;
  deal?: Deal | null;
}

export function buildEmailDraftPrompt({
  intent,
  additionalContext,
  deal,
}: EmailDraftOptions): string {
  return `You are Niles, an AI sales coach powered by "The Pharaoh's Pitch" by Ivan Yong.

Draft a professional sales email based on the following:

EMAIL INTENT: ${intent}
ADDITIONAL CONTEXT: ${additionalContext || "None"}

${deal ? `DEAL CONTACT:
- Name: ${deal.contact_name || "Unknown"}
- Company: ${deal.contact_company || "Unknown"}
- Decision Style: ${deal.decision_style || "Unknown"}
- Primary Motivation: ${deal.primary_motivation?.replace(/_/g, " ") || "Unknown"}
- Communication Preference: ${deal.communication_pref?.replace(/_/g, " ") || "Unknown"}` : ""}

${deal ? `DEAL:
- Title: ${deal.title}
- Stage: ${deal.stage.replace(/_/g, " ")}` : ""}

INSTRUCTIONS:
- Calibrate tone to the client's DNA:
  - Analytical → data-heavy, structured, with specifics
  - Driver → direct, brief, action-oriented
  - Amiable → warm, personal, relationship-focused
  - Expressive → enthusiastic, big-picture, visionary
- Do NOT cite the Pharaoh principles in the email itself — the email should read naturally
- Keep it concise: 150-250 words max
- Include a clear call-to-action

Return your response in this format:

## Subject Line
<the email subject>

## Email Body
<the full email text>

## Coaching Note
Which Pharaoh Principle guided this email and why — this is for the salesperson's learning, not the client.`;
}
