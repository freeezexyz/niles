export type PrincipleKey =
  | "purpose"
  | "visioning"
  | "knowledge"
  | "kindness"
  | "leadership"
  | "trust"
  | "emotional";

export interface Principle {
  key: PrincipleKey;
  name: string;
  chapter: number;
  chapterLabel: string;
  color: string;
  description: string;
}

export const PRINCIPLES: Record<PrincipleKey, Principle> = {
  purpose: {
    key: "purpose",
    name: "Purpose",
    chapter: 1,
    chapterLabel: "Ch.1",
    color: "var(--color-principle-purpose)",
    description: "Discovering your 'why' transforms every pitch into a calling",
  },
  visioning: {
    key: "visioning",
    name: "Visioning",
    chapter: 2,
    chapterLabel: "Ch.2",
    color: "var(--color-principle-visioning)",
    description: "Paint the future your client can't yet see",
  },
  knowledge: {
    key: "knowledge",
    name: "Knowledge & Wisdom",
    chapter: 3,
    chapterLabel: "Ch.3",
    color: "var(--color-principle-knowledge)",
    description: "Know your client better than they know themselves",
  },
  kindness: {
    key: "kindness",
    name: "Kindness",
    chapter: 4,
    chapterLabel: "Ch.4",
    color: "var(--color-principle-kindness)",
    description: "Sell from the heart — the head follows",
  },
  leadership: {
    key: "leadership",
    name: "Leadership",
    chapter: 5,
    chapterLabel: "Ch.5",
    color: "var(--color-principle-leadership)",
    description: "A servant leader earns the Pharaoh's trust",
  },
  trust: {
    key: "trust",
    name: "Trust",
    chapter: 6,
    chapterLabel: "Ch.6",
    color: "var(--color-principle-trust)",
    description: "Trust is the currency that closes every deal",
  },
  emotional: {
    key: "emotional",
    name: "Emotional Intelligence",
    chapter: 7,
    chapterLabel: "Ch.7",
    color: "var(--color-principle-emotional)",
    description: "Read the room, feel the moment, win the relationship",
  },
};

export const PRINCIPLE_LIST = Object.values(PRINCIPLES);
