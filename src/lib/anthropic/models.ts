// Model cost strategy (decided in the pivot meeting):
//   - Haiku for bulk/crawl/cheap reformatting work
//   - Sonnet for interactive chat coaching
//   - Opus reserved for elaboration/polish — the high-value "payoff" outputs
//     (proposals, the downloadable HTML deck) that justify the paid tier.
//
// Centralised here so the cost trade-offs are legible in one place and model
// IDs change in a single spot.
export const MODELS = {
  bulk: "claude-haiku-4-5-20251001",
  chat: "claude-sonnet-4-6",
  elaborate: "claude-opus-4-8",
} as const;

export type ModelTier = keyof typeof MODELS;
