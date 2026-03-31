import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CardEditorPanel from "@/components/CardEditorPanel";
import CardTemplateRenderer from "@/components/CardTemplateRenderer";
import type { CardTemplateConfig, CardUserContent } from "@/types/cardTemplate";
import { templateHidesFrontHeadline } from "@/lib/cardTemplateFlags";
import { cn } from "@/lib/utils";

export interface FullscreenLegacyCardEditorProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  template: CardTemplateConfig;
  userContent: CardUserContent;
  onUserContentChange: (content: Partial<CardUserContent>) => void;
  headlinePlaceholder?: string;
}

/**
 * Full-screen editor for CSS-based card templates (non-canvas). Matches inline editor fields.
 */
export default function FullscreenLegacyCardEditor({
  open,
  onClose,
  title = "Edit your card",
  template,
  userContent,
  onUserContentChange,
  headlinePlaceholder,
}: FullscreenLegacyCardEditorProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fullscreen-legacy-card-editor-title"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-4">
        <h2 id="fullscreen-legacy-card-editor-title" className="font-display text-2xl sm:text-3xl text-foreground tracking-tight">
          {title}
        </h2>
        <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={onClose}>
          <X className="h-4 w-4" />
          Close
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 border-x-4 border-border bg-muted/10 px-3 py-4 sm:px-6 sm:py-6 lg:flex-row lg:items-start lg:gap-10 lg:px-8">
        <div className="flex flex-1 justify-center lg:justify-start">
          <div
            className={cn(
              "w-full max-w-[420px] shrink-0 overflow-hidden rounded-2xl border border-border bg-white shadow-card"
            )}
            style={{
              aspectRatio: template.aspectRatio,
              maxHeight: "min(78vh, 620px)",
            }}
          >
            <CardTemplateRenderer
              template={template}
              userContent={userContent}
              className="h-full w-full"
            />
          </div>
        </div>
        <div className="w-full shrink-0 rounded-xl border border-border bg-card p-6 shadow-sm lg:max-w-md lg:min-w-[360px]">
          <CardEditorPanel
            template={template}
            userContent={userContent}
            onUserContentChange={onUserContentChange}
            headlinePlaceholder={headlinePlaceholder}
            hideFrontHeadline={templateHidesFrontHeadline(template.id)}
          />
        </div>
        </div>
      </div>
    </div>
  );
}
