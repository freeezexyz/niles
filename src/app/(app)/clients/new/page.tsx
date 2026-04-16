import { DnaForm } from "@/components/clients/DnaForm";

export default function NewClientPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          New Client
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Fill in what you know — Niles will generate a DNA profile to guide your coaching.
        </p>
      </div>
      <DnaForm />
    </div>
  );
}
