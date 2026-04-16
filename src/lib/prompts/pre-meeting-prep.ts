import type { Client, Deal } from "@/lib/types";
import type { BookChunk } from "@/lib/pinecone/query";
import { formatBookContext } from "@/lib/pinecone/query";

interface PrepPromptOptions {
  meetingGoal: string;
  lastInteraction: string;
  bookContext: BookChunk[];
  client?: Client | null;
  deal?: Deal | null;
}

export function buildPreMeetingPrepPrompt({
  meetingGoal,
  lastInteraction,
  bookContext,
  client,
  deal,
}: PrepPromptOptions): string {
  const bookSection = formatBookContext(bookContext);

  return `You are Niles, an AI sales coach powered by "The Pharaoh's Pitch" by Ivan Yong.

Generate a principle-mapped meeting strategy for the upcoming meeting.

MEETING GOAL: ${meetingGoal}
LAST INTERACTION NOTES: ${lastInteraction || "None provided"}

${client ? `CLIENT DNA:
- Name: ${client.name} (${client.company || "Unknown company"})
- Decision Style: ${client.decision_style || "Unknown"}
- Primary Motivation: ${client.primary_motivation?.replace(/_/g, " ") || "Unknown"}
- Communication Preference: ${client.communication_pref?.replace(/_/g, " ") || "Unknown"}
- Key Concerns: ${client.key_concerns || "Not provided"}` : ""}

${deal ? `DEAL CONTEXT:
- Deal: ${deal.title}
- Stage: ${deal.stage.replace(/_/g, " ")}
- Health Score: ${deal.health_overall}/100` : ""}

CONTEXT FROM THE BOOK:
${bookSection}

Generate a meeting strategy with the following structure:

## Lead Principle
Which of the 7 Pharaoh Principles to lead with and why.

## 3 Key Questions to Ask
Specific, tailored questions grounded in the principles.

## 2 Most Likely Objections
What the client is likely to push back on, with a principle-based response strategy for each.

## Recommended Closing Move
One specific closing approach aligned with the client's DNA and the deal stage.

## Pre-Meeting Mindset
A brief motivational note grounded in the Pharaoh's Pitch philosophy.

Cite the specific chapter and principle for each recommendation.`;
}
