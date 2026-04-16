export type TierKey = "pharaoh" | "dynasty" | "empire";

export interface TierConfig {
  key: TierKey;
  name: string;
  price: string;
  queryLimit: number; // -1 = unlimited
  maxClients: number; // -1 = unlimited
  features: string[];
}

export const TIERS: Record<TierKey, TierConfig> = {
  pharaoh: {
    key: "pharaoh",
    name: "Pharaoh",
    price: "$29/mo",
    queryLimit: 500,
    maxClients: 20,
    features: [
      "AI Chat Coach",
      "Client DNA",
      "Deal Health Score",
      "Pipeline Board",
      "Daily Command Center",
      "Pre-Meeting Prep",
      "Post-Call Debrief",
      "Objection Handler",
      "Email Drafting",
      "Weekly Review",
    ],
  },
  dynasty: {
    key: "dynasty",
    name: "Dynasty",
    price: "$79/seat/mo",
    queryLimit: -1,
    maxClients: -1,
    features: [
      "All Pharaoh features",
      "Unlimited queries",
      "Team Dashboard",
      "Role Play Practice",
      "Team AI Alerts",
    ],
  },
  empire: {
    key: "empire",
    name: "Empire",
    price: "Custom",
    queryLimit: -1,
    maxClients: -1,
    features: [
      "All Dynasty features",
      "CRM integration",
      "SSO/SAML",
      "White-label option",
      "Dedicated support",
    ],
  },
};

export function hasFeature(tier: TierKey, feature: string): boolean {
  const tierConfig = TIERS[tier];
  if (!tierConfig) return false;
  if (tier === "empire") return true;
  if (tier === "dynasty" && TIERS.dynasty.features.includes(feature))
    return true;
  return tierConfig.features.includes(feature);
}

export function isWithinQueryLimit(
  tier: TierKey,
  currentCount: number
): boolean {
  const limit = TIERS[tier].queryLimit;
  if (limit === -1) return true;
  return currentCount < limit;
}
