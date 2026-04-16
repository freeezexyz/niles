import { PipelineBoard } from "@/components/pipeline/PipelineBoard";

export default function PipelinePage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Pharaoh&apos;s Pipeline
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Drag deals between stages to track your sales journey
        </p>
      </div>
      <PipelineBoard />
    </div>
  );
}
