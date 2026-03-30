import { useEffect, type RefObject } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CanvasCardPreview, {
  type CanvasCardPreviewHandle,
} from "@/components/CanvasCardPreview";
import CardPageEditorControls from "@/components/CardPageEditorControls";
import GrapesCardEditor from "@/components/GrapesCardEditor";
import type { CardPage } from "@/data/cardTemplates";
import { cn } from "@/lib/utils";

export interface FullscreenCardEditorProps {
  open: boolean;
  onClose: () => void;
  page: CardPage;
  title?: string;
  textBySlotId: Record<string, string>;
  onTextChange: (slotId: string, value: string) => void;
  photoUrlBySlotId: Record<string, string | null>;
  onPhotoChange: (slotId: string, url: string | null) => void;
  canvasPreviewRef: RefObject<CanvasCardPreviewHandle | null>;
  headlinePlaceholder?: string;
  messagePlaceholder?: string;
  onExportPng?: () => void;
  onExportAllPngs?: () => void;
}

/**
 * Full-screen visual editor (GrapesJS) plus live canvas preview and slot controls.
 * Designed so we can add more panels (e.g. audio/video) without restructuring the shell.
 */
export default function FullscreenCardEditor({
  open,
  onClose,
  page,
  title = "Edit your card",
  textBySlotId,
  onTextChange,
  photoUrlBySlotId,
  onPhotoChange,
  canvasPreviewRef,
  headlinePlaceholder,
  messagePlaceholder,
  onExportPng,
  onExportAllPngs,
}: FullscreenCardEditorProps) {
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
      aria-labelledby="fullscreen-card-editor-title"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 id="fullscreen-card-editor-title" className="font-display text-2xl sm:text-3xl text-foreground tracking-tight">
          {title}
        </h2>
        <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={onClose}>
          <X className="h-4 w-4" />
          Close
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section
          className={cn(
            "flex min-h-0 flex-1 flex-col border-b border-border lg:border-b-0 lg:border-r",
            "min-h-[45vh] lg:min-h-0"
          )}
        >
          <p className="shrink-0 border-b border-border px-3 py-2 text-xs text-muted-foreground">
            Visual editor — click text to edit. The printable preview updates as you type or upload.
          </p>
          <div className="min-h-0 flex-1 overflow-hidden p-2">
            <GrapesCardEditor
              page={page}
              textBySlotId={textBySlotId}
              photoUrlBySlotId={photoUrlBySlotId}
              onTextChange={onTextChange}
              onPhotoUrlChange={onPhotoChange}
            />
          </div>
        </section>

        <aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto bg-card/30 p-4 lg:w-[400px] lg:max-w-[40vw]">
          <div className="mx-auto w-full max-w-[min(100%,380px)] overflow-hidden rounded-2xl border border-border bg-white shadow-card">
            <CanvasCardPreview
              ref={canvasPreviewRef}
              page={page}
              textBySlotId={textBySlotId}
              photoUrlBySlotId={photoUrlBySlotId}
              className="w-full"
            />
          </div>
          <CardPageEditorControls
            page={page}
            textBySlotId={textBySlotId}
            onTextChange={onTextChange}
            photoUrlBySlotId={photoUrlBySlotId}
            onPhotoChange={onPhotoChange}
            headlinePlaceholder={headlinePlaceholder}
            messagePlaceholder={messagePlaceholder}
            onExportPng={onExportPng}
            onExportAllPngs={onExportAllPngs}
          />
        </aside>
      </div>
    </div>
  );
}
