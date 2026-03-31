import { useParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CardTemplateRenderer from "@/components/CardTemplateRenderer";
import CardEditorPanel from "@/components/CardEditorPanel";
import CanvasCardPreview, {
  type CanvasCardPreviewHandle,
} from "@/components/CanvasCardPreview";
import CardPageEditorControls from "@/components/CardPageEditorControls";
import FullscreenCardEditor from "@/components/FullscreenCardEditor";
import FullscreenLegacyCardEditor from "@/components/FullscreenLegacyCardEditor";
import ModernTemplateEditor from "@/components/ModernTemplateEditor";
import MdPhotoOvalFrameEditor from "@/components/MdPhotoOvalFrameEditor";
import { loadCardEditorState, saveCardEditorState } from "@/lib/cardEditorLocalStorage";
import { renderPageToPngDataUrl, triggerPngDownload } from "@/lib/canvasCardCompose";
import { templateHidesFrontHeadline } from "@/lib/cardTemplateFlags";
import { cn } from "@/lib/utils";
import { OCCASIONS, type Occasion, type TemplateCard } from "@/lib/occasionsData";
import { getCardTemplateConfig } from "@/templates";
import {
  getCardPage,
  getCardTemplateById,
  getDefaultPhotoMap,
  getDefaultTextMap,
} from "@/data/cardTemplates";
import {
  createDefaultUserContent,
  getImageFrameIds,
  type CardUserContent,
} from "@/types/cardTemplate";

function getOccasion(slug: string | undefined): Occasion | undefined {
  if (!slug) return undefined;
  return OCCASIONS.find((o) => o.slug === slug);
}

function getTemplate(occasion: Occasion | undefined, templateId: string | undefined): TemplateCard | undefined {
  if (!occasion || !templateId) return undefined;
  return occasion.templates.find((t) => t.id === templateId);
}

function buildInitialUserContent(
  templateConfig: ReturnType<typeof getCardTemplateConfig>
): CardUserContent {
  const base = createDefaultUserContent();
  const frameIds = getImageFrameIds(templateConfig.elements);
  if (frameIds.length > 0) {
    const photoUrls: Record<string, string | null> = {};
    frameIds.forEach((id) => (photoUrls[id] = null));
    return { ...base, photoUrls };
  }
  return base;
}

const MOTHERS_DAY_FIXED_TEMPLATE_ID = "md-floral-photo-collage";
const MOTHERS_DAY_MODERN_TEMPLATE_ID = "md-photo-oval-frame";

const OccasionEditorPage = () => {
  const { slug, templateId } = useParams<{ slug: string; templateId: string }>();
  const occasion = getOccasion(slug);
  const templateCard = getTemplate(occasion, templateId);

  const fixedTemplate = templateId ? getCardTemplateById(templateId) : undefined;
  const useFixedTemplate = fixedTemplate?.id === MOTHERS_DAY_FIXED_TEMPLATE_ID;
  const useModernTemplate = templateId === MOTHERS_DAY_MODERN_TEMPLATE_ID;

  const templateConfig = useMemo(
    () => (templateCard ? getCardTemplateConfig(templateCard) : null),
    [templateCard]
  );

  const [userContent, setUserContent] = useState<CardUserContent>(() =>
    templateConfig ? buildInitialUserContent(templateConfig) : createDefaultUserContent()
  );

  const [activePageId, setActivePageId] = useState("front");
  const [textBySlotId, setTextBySlotId] = useState<Record<string, string>>(() => {
    const t = getCardTemplateById(MOTHERS_DAY_FIXED_TEMPLATE_ID);
    const defaults = t ? getDefaultTextMap(t) : {};
    const stored = loadCardEditorState();
    return { ...defaults, ...stored?.textBySlotId };
  });
  const [photoBySlotId, setPhotoBySlotId] = useState<Record<string, string | null>>(() => {
    const t = getCardTemplateById(MOTHERS_DAY_FIXED_TEMPLATE_ID);
    const defaults = t ? getDefaultPhotoMap(t) : {};
    const stored = loadCardEditorState();
    return { ...defaults, ...stored?.photoBySlotId };
  });
  const canvasPreviewRef = useRef<CanvasCardPreviewHandle>(null);
  const [fullscreenCanvasEditorOpen, setFullscreenCanvasEditorOpen] = useState(false);
  const [fullscreenLegacyEditorOpen, setFullscreenLegacyEditorOpen] = useState(false);

  const activePage = useMemo(() => {
    if (!fixedTemplate) return null;
    return getCardPage(fixedTemplate, activePageId) ?? fixedTemplate.pages[0] ?? null;
  }, [fixedTemplate, activePageId]);

  useEffect(() => {
    if (!templateConfig) return;
    const frameIds = getImageFrameIds(templateConfig.elements);
    if (frameIds.length > 0) {
      setUserContent((prev) => ({
        ...prev,
        photoUrls: Object.fromEntries(frameIds.map((id) => [id, prev.photoUrls?.[id] ?? null])),
      }));
    }
  }, [templateConfig]);

  useEffect(() => {
    if (!useFixedTemplate) return;
    const t = window.setTimeout(() => {
      saveCardEditorState({
        textBySlotId,
        photoBySlotId,
      });
    }, 400);
    return () => window.clearTimeout(t);
  }, [textBySlotId, photoBySlotId, useFixedTemplate]);

  const handleExportAllPngs = async () => {
    if (!fixedTemplate) return;
    for (const p of fixedTemplate.pages) {
      const dataUrl = await renderPageToPngDataUrl(p, textBySlotId, photoBySlotId);
      if (dataUrl) triggerPngDownload(dataUrl, `mothers-day-${p.id}.png`);
      await new Promise((r) => setTimeout(r, 400));
    }
  };

  if (!occasion || !templateCard) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="font-display text-2xl text-foreground mb-3">
            Card not found
          </h1>
          <p className="text-muted-foreground mb-6">
            This template or occasion does not exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (useModernTemplate && templateConfig) {
    return (
      <MdPhotoOvalFrameEditor backToUrl={`/occasions/${occasion.slug}`} />
    );
  }

  if (useFixedTemplate && fixedTemplate) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 w-full">
          <div className="container max-w-6xl py-6 md:py-10">
            <div className="mx-auto max-w-5xl border-x-4 border-border bg-muted/10 px-4 py-6 sm:px-8 sm:py-8">
            <Link
              to={`/occasions/${occasion.slug}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {occasion.name}
            </Link>
            <div className="mb-6 md:mb-8">
              <h1 className="font-display text-3xl md:text-4xl text-foreground tracking-tight">
                Customise your card
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl">
                Switch between the front cover and the inside pages. The preview is canvas-based and saves
                in this browser.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {fixedTemplate.pages.map((p) => (
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
                  onClick={() => setFullscreenCanvasEditorOpen(true)}
                  title="Open full screen editor"
                >
                  <span className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center opacity-0 transition group-hover:opacity-100">
                    <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow">
                      Click to edit full screen
                    </span>
                  </span>
                  {activePage && (
                    <CanvasCardPreview
                      ref={canvasPreviewRef}
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
                    headlinePlaceholder={`Happy ${occasion.name}!`}
                    messagePlaceholder="Your message"
                    onExportPng={() =>
                      canvasPreviewRef.current?.downloadPng(`mothers-day-${activePage.id}.png`)
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
            open={fullscreenCanvasEditorOpen}
            onClose={() => setFullscreenCanvasEditorOpen(false)}
            page={activePage}
            title={`Customise — ${occasion.name}`}
            textBySlotId={textBySlotId}
            onTextChange={(slotId, value) =>
              setTextBySlotId((prev) => ({ ...prev, [slotId]: value }))
            }
            photoUrlBySlotId={photoBySlotId}
            onPhotoChange={(slotId, url) =>
              setPhotoBySlotId((prev) => ({ ...prev, [slotId]: url }))
            }
            canvasPreviewRef={canvasPreviewRef}
            headlinePlaceholder={`Happy ${occasion.name}!`}
            messagePlaceholder="Your message"
            onExportPng={() =>
              canvasPreviewRef.current?.downloadPng(`mothers-day-${activePage.id}.png`)
            }
            onExportAllPngs={handleExportAllPngs}
          />
        )}
        <Footer />
      </div>
    );
  }

  if (!templateConfig) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="font-display text-2xl text-foreground mb-3">
            Card not found
          </h1>
          <p className="text-muted-foreground mb-6">
            This template or occasion does not exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
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
          <Link
            to={`/occasions/${occasion.slug}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {occasion.name}
          </Link>

          <div className="mb-6 md:mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-foreground tracking-tight">
              Customise your card
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl">
              {templateConfig.elements.some((el) => el.type === "imageFrame")
                ? "Add your photos. The card updates as you upload."
                : "Edit your message and add a photo. The card updates as you type."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8 lg:gap-12 items-start">
            <div className="flex justify-center lg:justify-start">
              <button
                type="button"
                className="group relative w-full max-w-[400px] flex-shrink-0 rounded-2xl overflow-hidden border border-border bg-white text-left shadow-card outline-none ring-offset-background transition hover:ring-2 hover:ring-ring/40 focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  aspectRatio: templateConfig.aspectRatio,
                  maxHeight: 560,
                }}
                onClick={() => setFullscreenLegacyEditorOpen(true)}
                title="Open full screen editor"
              >
                <span className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center opacity-0 transition group-hover:opacity-100">
                  <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow">
                    Click to edit full screen
                  </span>
                </span>
                <CardTemplateRenderer
                  template={templateConfig}
                  userContent={userContent}
                  forceTextColor="#000000"
                  className="h-full w-full"
                />
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <CardEditorPanel
                template={templateConfig}
                userContent={userContent}
                onUserContentChange={(patch) =>
                  setUserContent((prev) => ({ ...prev, ...patch }))
                }
                headlinePlaceholder={`Happy ${occasion.name}!`}
                hideFrontHeadline={
                  !!templateId && templateHidesFrontHeadline(templateId)
                }
              />
            </div>
          </div>
          </div>
        </div>
      </main>

      <FullscreenLegacyCardEditor
        open={fullscreenLegacyEditorOpen}
        onClose={() => setFullscreenLegacyEditorOpen(false)}
        title={`Customise — ${occasion.name}`}
        template={templateConfig}
        userContent={userContent}
        onUserContentChange={(patch) =>
          setUserContent((prev) => ({ ...prev, ...patch }))
        }
        headlinePlaceholder={`Happy ${occasion.name}!`}
      />

      <Footer />
    </div>
  );
};

export default OccasionEditorPage;
