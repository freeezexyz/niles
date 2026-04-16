import { cn } from "@/lib/utils";
import { PRINCIPLES, type PrincipleKey } from "@/lib/utils/principles";

interface PrincipleTagProps {
  principleKey: PrincipleKey;
  className?: string;
}

const principleColorClasses: Record<PrincipleKey, string> = {
  purpose: "bg-principle-purpose/15 text-principle-purpose border-principle-purpose/30",
  visioning: "bg-principle-visioning/15 text-principle-visioning border-principle-visioning/30",
  knowledge: "bg-principle-knowledge/15 text-principle-knowledge border-principle-knowledge/30",
  kindness: "bg-principle-kindness/15 text-principle-kindness border-principle-kindness/30",
  leadership: "bg-principle-leadership/15 text-principle-leadership border-principle-leadership/30",
  trust: "bg-principle-trust/15 text-principle-trust border-principle-trust/30",
  emotional: "bg-principle-emotional/15 text-principle-emotional border-principle-emotional/30",
};

export function PrincipleTag({ principleKey, className }: PrincipleTagProps) {
  const principle = PRINCIPLES[principleKey];
  if (!principle) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        principleColorClasses[principleKey],
        className
      )}
    >
      {principle.chapterLabel} — {principle.name}
    </span>
  );
}
