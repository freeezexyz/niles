import type { PrincipleScores } from "@/components/deals/RadarChart";
import type { RepPrincipleScore } from "@/lib/types";
import type { PrincipleKey } from "@/lib/utils/principles";

// Maps the DB row columns (p_emotional_intel) to the principle keys used in
// the UI (emotional). Single source of truth for the rep-score shape.
const COLUMN_BY_PRINCIPLE: Record<PrincipleKey, keyof RepPrincipleScore> = {
  purpose: "p_purpose",
  visioning: "p_visioning",
  knowledge: "p_knowledge",
  kindness: "p_kindness",
  leadership: "p_leadership",
  trust: "p_trust",
  emotional: "p_emotional_intel",
};

/** Convert a rep_principle_scores row into the radar's PrincipleScores shape. */
export function repRowToScores(
  row: Pick<RepPrincipleScore, keyof RepPrincipleScore>
): PrincipleScores {
  return {
    purpose: row.p_purpose,
    visioning: row.p_visioning,
    knowledge: row.p_knowledge,
    kindness: row.p_kindness,
    leadership: row.p_leadership,
    trust: row.p_trust,
    emotional: row.p_emotional_intel,
  };
}

/** The principle the rep is weakest at — their development focus. */
export function repRowToWeakestPrinciple(
  row: Pick<RepPrincipleScore, keyof RepPrincipleScore>
): PrincipleKey {
  const keys = Object.keys(COLUMN_BY_PRINCIPLE) as PrincipleKey[];
  return keys.reduce((weakest, key) =>
    (row[COLUMN_BY_PRINCIPLE[key]] as number) <
    (row[COLUMN_BY_PRINCIPLE[weakest]] as number)
      ? key
      : weakest
  );
}

/** Overall development score (average of the 7 principles, 0-100). */
export function repScoreAverage(scores: PrincipleScores): number {
  const vals = Object.values(scores);
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}
