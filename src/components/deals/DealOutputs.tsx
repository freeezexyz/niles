"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Presentation,
  ClipboardList,
  Compass,
  Eye,
  Copy,
  Download,
  ExternalLink,
  Check,
  Loader2,
} from "lucide-react";
import type { DealOutput, OutputType } from "@/lib/types";

type GenKind = "action_diagram" | "proposal" | "deck_html" | "deck_llm";

const TYPE_META: Record<
  OutputType,
  { label: string; icon: typeof FileText; ext: string; mime: string }
> = {
  action_diagram: { label: "Action Plan", icon: Compass, ext: "html", mime: "text/html" },
  proposal: { label: "Proposal", icon: FileText, ext: "md", mime: "text/markdown" },
  deck_html: { label: "HTML Deck", icon: Presentation, ext: "html", mime: "text/html" },
  deck_llm: { label: "Deck Outline", icon: ClipboardList, ext: "txt", mime: "text/plain" },
};

// Output types that render as a full HTML artifact — opened in a new tab rather
// than shown as source in the <pre> viewer.
const HTML_KINDS: OutputType[] = ["action_diagram", "deck_html"];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "output";
}

export function DealOutputs({
  dealId,
  onChange,
}: {
  dealId: string;
  onChange?: () => void;
}) {
  const [outputs, setOutputs] = useState<DealOutput[]>([]);
  const [generating, setGenerating] = useState<GenKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<DealOutput | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadOutputs = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("deal_outputs")
      .select("*")
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false });
    setOutputs(data || []);
  }, [dealId]);

  useEffect(() => {
    loadOutputs();
  }, [loadOutputs]);

  async function generate(kind: GenKind) {
    setGenerating(kind);
    setError(null);
    try {
      const endpoint =
        kind === "action_diagram"
          ? `/api/deals/${dealId}/action-diagram`
          : kind === "proposal"
          ? `/api/deals/${dealId}/proposal`
          : `/api/deals/${dealId}/deck`;
      const body =
        kind === "proposal" || kind === "action_diagram"
          ? {}
          : { format: kind === "deck_html" ? "html" : "llm" };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Generation failed. Please try again.");
        return;
      }
      await loadOutputs();
      onChange?.();
      // Full HTML artifacts (action plan, deck) render best in their own tab;
      // text artifacts open in the <pre> viewer.
      if (json.output) {
        if (HTML_KINDS.includes(json.output.output_type)) {
          openHtml(json.output);
        } else {
          setViewing(json.output);
        }
      }
    } catch {
      setError("Could not reach the generator. Please try again.");
    } finally {
      setGenerating(null);
    }
  }

  async function copy(output: DealOutput) {
    await navigator.clipboard.writeText(output.content);
    setCopiedId(output.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function download(output: DealOutput) {
    const meta = TYPE_META[output.output_type];
    const blob = new Blob([output.content], { type: meta.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(output.title || meta.label)}.${meta.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openHtml(output: DealOutput) {
    const blob = new Blob([output.content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    // Revoke shortly after; the new tab keeps its own loaded copy.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base">Generated Outputs</CardTitle>
        <p className="text-xs text-[var(--text-muted)]">
          Built from this deal&apos;s saved coaching conversations.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <GenButton
            label="Action Plan"
            icon={Compass}
            primary
            busy={generating === "action_diagram"}
            disabled={generating !== null}
            onClick={() => generate("action_diagram")}
          />
          <GenButton
            label="Proposal"
            icon={FileText}
            busy={generating === "proposal"}
            disabled={generating !== null}
            onClick={() => generate("proposal")}
          />
          <GenButton
            label="HTML Deck"
            icon={Presentation}
            busy={generating === "deck_html"}
            disabled={generating !== null}
            onClick={() => generate("deck_html")}
          />
          <GenButton
            label="Copy for LLM"
            icon={ClipboardList}
            busy={generating === "deck_llm"}
            disabled={generating !== null}
            onClick={() => generate("deck_llm")}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        {outputs.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            No outputs yet. Generate a proposal or deck from your coaching history.
          </p>
        ) : (
          <ul className="space-y-2">
            {outputs.map((output) => {
              const meta = TYPE_META[output.output_type];
              const Icon = meta.icon;
              return (
                <li
                  key={output.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2"
                >
                  <Icon className="h-4 w-4 shrink-0 text-gold-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {output.title || meta.label}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(output.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="hidden sm:inline-flex border-gold-500/30 text-gold-400 text-[10px]"
                  >
                    {meta.label}
                  </Badge>
                  <div className="flex gap-1">
                    {HTML_KINDS.includes(output.output_type) ? (
                      <IconBtn title="Open" onClick={() => openHtml(output)}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </IconBtn>
                    ) : (
                      <IconBtn title="View" onClick={() => setViewing(output)}>
                        <Eye className="h-3.5 w-3.5" />
                      </IconBtn>
                    )}
                    <IconBtn title="Copy" onClick={() => copy(output)}>
                      {copiedId === output.id ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </IconBtn>
                    <IconBtn title="Download" onClick={() => download(output)}>
                      <Download className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
          </DialogHeader>
          <pre className="flex-1 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-background/60 p-3 text-xs text-[var(--text-secondary)]">
            {viewing?.content}
          </pre>
          {viewing && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => copy(viewing)}>
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => download(viewing)}>
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function GenButton({
  label,
  icon: Icon,
  busy,
  disabled,
  onClick,
  primary = false,
}: {
  label: string;
  icon: typeof FileText;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  /** The hero / free deliverable — rendered filled to stand out. */
  primary?: boolean;
}) {
  return (
    <Button
      variant={primary ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={
        primary
          ? "gap-2 bg-gold-500 text-background hover:bg-gold-400"
          : "gap-2 border-gold-500/30 text-gold-400"
      }
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {label}
    </Button>
  );
}

function IconBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      title={title}
      onClick={onClick}
      className="text-[var(--text-muted)] hover:text-foreground"
    >
      {children}
    </Button>
  );
}
