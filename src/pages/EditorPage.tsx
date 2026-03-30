import { useState, useEffect, useRef, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CanvasCardPreview, {
  type CanvasCardPreviewHandle,
} from "@/components/CanvasCardPreview";
import CardPageEditorControls from "@/components/CardPageEditorControls";
import FullscreenCardEditor from "@/components/FullscreenCardEditor";
import {
  getCardPage,
  getCardTemplateById,
  getDefaultPhotoMap,
  getDefaultTextMap,
} from "@/data/cardTemplates";
import { loadCardEditorState, saveCardEditorState } from "@/lib/cardEditorLocalStorage";
import { renderPageToPngDataUrl, triggerPngDownload } from "@/lib/canvasCardCompose";
import { cn } from "@/lib/utils";

const MOTHERS_DAY_TEMPLATE_ID = "md-floral-photo-collage";

const EditorPage = () => {
  const template = getCardTemplateById(MOTHERS_DAY_TEMPLATE_ID);
  const canvasRef = useRef<CanvasCardPreviewHandle>(null);

  const [activePageId, setActivePageId] = useState("front");
  const [textBySlotId, setTextBySlotId] = useState<Record<string, string>>(() => {
    const t = getCardTemplateById(MOTHERS_DAY_TEMPLATE_ID);
    const defaults = t ? getDefaultTextMap(t) : {};
    const stored = loadCardEditorState();
    return { ...defaults, ...stored?.textBySlotId };
  });
  const [photoBySlotId, setPhotoBySlotId] = useState<Record<string, string | null>>(() => {
    const t = getCardTemplateById(MOTHERS_DAY_TEMPLATE_ID);
    const defaults = t ? getDefaultPhotoMap(t) : {};
    const stored = loadCardEditorState();
    return { ...defaults, ...stored?.photoBySlotId };
  });
  const [fullscreenEditorOpen, setFullscreenEditorOpen] = useState(false);

  const activePage = useMemo(() => {
    if (!template) return null;
    return getCardPage(template, activePageId) ?? template.pages[0] ?? null;
  }, [template, activePageId]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      saveCardEditorState({ textBySlotId, photoBySlotId });
    }, 400);
    return () => window.clearTimeout(t);
  }, [textBySlotId, photoBySlotId]);

  const handleExportAllPngs = async () => {
    if (!template) return;
    for (const p of template.pages) {
      const dataUrl = await renderPageToPngDataUrl(p, textBySlotId, photoBySlotId);
      if (dataUrl) triggerPngDownload(dataUrl, `card-${p.id}.png`);
      await new Promise((r) => setTimeout(r, 400));
    }
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="font-display text-2xl text-foreground">Template not found</h1>
          <p className="text-muted-foreground mt-2">The card template could not be loaded.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 w-full">
        <div className="container max-w-6xl py-6 md:py-10">
          <div className="mx-auto max-w-5xl border-x-4 border-border bg-muted/10 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mb-6 md:mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-foreground tracking-tight">
              Customise your card
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl">
              Front cover and inside pages — switch tabs to edit each. Canvas preview updates as you type.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {template.pages.map((p) => (
              <button
                key={p.id}
                type="button"
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  activePageId === p.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                onClick={() => setActivePageId(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8 lg:gap-12 items-start">
            <div className="flex justify-center lg:justify-start">
              <button
                type="button"
                className="group relative w-full max-w-[min(100%,580px)] flex-shrink-0 rounded-2xl overflow-hidden border border-border bg-white text-left shadow-card outline-none ring-offset-background transition hover:ring-2 hover:ring-ring/40 focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setFullscreenEditorOpen(true)}
                title="Open full screen editor"
              >
                <span className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center opacity-0 transition group-hover:opacity-100">
                  <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow">
                    Click to edit full screen
                  </span>
                </span>
                {activePage && (
                  <CanvasCardPreview
                    ref={canvasRef}
                    key={activePage.id}
                    page={activePage}
                    textBySlotId={textBySlotId}
                    photoUrlBySlotId={photoBySlotId}
                    className="w-full"
                  />
                )}
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              {activePage && (
                <CardPageEditorControls
                  page={activePage}
                  textBySlotId={textBySlotId}
                  onTextChange={(slotId, value) =>
                    setTextBySlotId((prev) => ({ ...prev, [slotId]: value }))
                  }
                  photoUrlBySlotId={photoBySlotId}
                  onPhotoChange={(slotId, url) =>
                    setPhotoBySlotId((prev) => ({ ...prev, [slotId]: url }))
                  }
                  headlinePlaceholder="Your headline"
                  messagePlaceholder="Your message"
                  onExportPng={() =>
                    canvasRef.current?.downloadPng(`card-${activePage.id}.png`)
                  }
                  onExportAllPngs={handleExportAllPngs}
                />
              )}
            </div>
          </div>
          </div>
        </div>
      </main>

      {activePage && (
        <FullscreenCardEditor
          open={fullscreenEditorOpen}
          onClose={() => setFullscreenEditorOpen(false)}
          page={activePage}
          title="Customise your card"
          textBySlotId={textBySlotId}
          onTextChange={(slotId, value) =>
            setTextBySlotId((prev) => ({ ...prev, [slotId]: value }))
          }
          photoUrlBySlotId={photoBySlotId}
          onPhotoChange={(slotId, url) =>
            setPhotoBySlotId((prev) => ({ ...prev, [slotId]: url }))
          }
          canvasPreviewRef={canvasRef}
          headlinePlaceholder="Your headline"
          messagePlaceholder="Your message"
          onExportPng={() =>
            canvasRef.current?.downloadPng(`card-${activePage.id}.png`)
          }
          onExportAllPngs={handleExportAllPngs}
        />
      )}

      <Footer />
    </div>
  );
};

export default EditorPage;
