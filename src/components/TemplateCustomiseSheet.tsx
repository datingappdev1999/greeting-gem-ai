import { useState, useEffect, useMemo, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FLOWER_BOUQUETS, CHOCOLATE_OPTIONS } from "@/lib/addOnsData";
import CardTemplateRenderer from "@/components/CardTemplateRenderer";
import CardEditorPanel from "@/components/CardEditorPanel";
import CardInsideRightPreview from "@/components/CardInsideRightPreview";
import CardInsideLeftPreview from "@/components/CardInsideLeftPreview";
import CardBackPreview from "@/components/CardBackPreview";
import { getCardTemplateConfig } from "@/templates";
import { createDefaultUserContent } from "@/types/cardTemplate";
import type { TextStyle } from "@/types/cardTemplate";
import type { TemplateCard } from "@/lib/occasionsData";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export type AddOnCategory = "flowers" | "chocolates";

interface TemplateCustomiseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TemplateCard | null;
  /** e.g. "Mother's Day" - used for default greeting */
  occasionName?: string | null;
  onContinue: (payload: {
    template: TemplateCard;
    message: string;
    photoUrl: string | null;
    insideLeftMessage?: string;
    insideRightMessage?: string;
    backMessage?: string;
    flowerId: string | null;
    chocolateId: string | null;
  }) => void;
}

const TemplateCustomiseSheet = ({
  open,
  onOpenChange,
  template,
  occasionName,
  onContinue,
}: TemplateCustomiseSheetProps) => {
  const navigate = useNavigate();
  const [isPreviewing, setIsPreviewing] = useState(false);
  const editorScrollRef = useRef<HTMLDivElement | null>(null);
  const previewScrollRef = useRef<HTMLDivElement | null>(null);
  const lastEditorScrollTopRef = useRef(0);
  const lastPreviewScrollTopRef = useRef(0);
  const [category, setCategory] = useState<AddOnCategory>("flowers");
  const [selectedFlowerId, setSelectedFlowerId] = useState<string | null>(null);
  const [selectedChocolateId, setSelectedChocolateId] = useState<string | null>(null);
  const [cardView, setCardView] = useState<
    "front" | "insideLeft" | "insideRight" | "back"
  >("front");
  const [isFlowersModalOpen, setIsFlowersModalOpen] = useState(false);
  const [isChocolatesModalOpen, setIsChocolatesModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generatedPdfPath, setGeneratedPdfPath] = useState<string | null>(null);

  const isSuperDad = template?.id === "fd-bold-super-dad";

  const defaultGreeting = isSuperDad
    ? "SUPER DAD"
    : occasionName
      ? `Happy ${occasionName}!`
      : "Happy [Occasion]!";

  const [userContent, setUserContent] = useState(() =>
    isSuperDad
      ? {
          ...createDefaultUserContent("SUPER DAD"),
          body: "HAPPY FATHER'S DAY 2024",
        }
      : createDefaultUserContent(defaultGreeting)
  );

  const templateConfig = useMemo(
    () => (template ? getCardTemplateConfig(template) : null),
    [template]
  );

  const frontHeadlineStyle = useMemo(() => {
    if (!templateConfig) return null;
    const el = templateConfig.elements.find((e) => e.type === "headline");
    if (!el || el.type !== "headline") return null;
    return el.style as TextStyle;
  }, [templateConfig]);

  const isEasterPastelEggsGrid = template?.id === "easter-pastel-eggs-grid";
  const easterPastelPanelBg = "#FCF9F4";

  const insideRightPreviewTextStyle = useMemo(() => {
    if (isEasterPastelEggsGrid) {
      return {
        fontFamily: "var(--font-body)",
        color: "hsl(var(--foreground))",
        fontSize: "clamp(23px, 2.6vw, 24px)",
      };
    }
    return {
      fontFamily: frontHeadlineStyle?.fontFamily,
      color: frontHeadlineStyle?.color,
      fontSize: "clamp(23px, 2.6vw, 24px)",
    };
  }, [isEasterPastelEggsGrid, frontHeadlineStyle]);

  useEffect(() => {
    if (open && template) {
      setIsPreviewing(false);
      setIsFlowersModalOpen(false);
      setIsChocolatesModalOpen(false);
      setIsGeneratingPdf(false);
      setGeneratedPdfPath(null);
      lastEditorScrollTopRef.current = 0;
      lastPreviewScrollTopRef.current = 0;
      if (template.id === "fd-bold-super-dad") {
        setUserContent({
          ...createDefaultUserContent("SUPER DAD"),
          body: "HAPPY FATHER'S DAY 2024",
        });
      } else {
        setUserContent(createDefaultUserContent(defaultGreeting));
      }
    }
  }, [open, template, defaultGreeting]);

  useEffect(() => {
    // Restore the scroll position for whichever view is active.
    // This makes "Edit" return you to where you left off.
    const el = isPreviewing ? previewScrollRef.current : editorScrollRef.current;
    if (!el) return;
    if (isPreviewing) {
      el.scrollLeft = lastPreviewScrollTopRef.current;
    } else {
      el.scrollTop = lastEditorScrollTopRef.current;
    }
  }, [isPreviewing]);

  const handleSelectFlower = (id: string) => {
    setSelectedFlowerId((prev) => (prev === id ? null : id));
  };

  const handleSelectChocolate = (id: string) => {
    setSelectedChocolateId((prev) => (prev === id ? null : id));
  };

  const handleCheckout = () => {
    if (!template) return;
    // Always start the upsell flow immediately (PDF renders in background).
    setIsFlowersModalOpen(true);
    setIsGeneratingPdf(true);
    fetch("/api/render-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: template.id,
        userContent,
      }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to render PDF"))))
      .then((data: { pdfPath: string }) => {
        setGeneratedPdfPath(data.pdfPath);
      })
      .catch(() => {
        // Keep the flow going even if PDF generation fails.
        setGeneratedPdfPath(null);
      })
      .finally(() => setIsGeneratingPdf(false));
  };

  if (!template) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          // Full-viewport panel (overrides default Sheet `w-3/4` / `max-w-sm` from the right variant)
          "!inset-0 !left-0 !h-[100dvh] !w-screen !max-w-none sm:!max-w-none md:!max-w-none",
          "flex flex-col gap-0 border-0 bg-background p-0 overflow-hidden"
        )}
      >
        <SheetHeader className="flex-shrink-0 border-b border-border px-6 py-5 text-left">
          <SheetTitle className="font-display text-2xl sm:text-3xl tracking-tight">
            {isPreviewing ? "Preview your card" : "Customise your card"}
          </SheetTitle>
          <p className="text-base sm:text-lg text-muted-foreground font-normal mt-2 max-w-2xl">
            {isPreviewing
              ? "Scroll to preview each page."
              : "Full screen editor — continue to the detailed canvas editor when you are ready."}
          </p>
        </SheetHeader>

        {/* Scrollable body: card + form, then add-ons — inset with thick side borders */}
        <div
          ref={editorScrollRef}
          className="flex-1 min-h-0 overflow-y-auto"
          onScroll={(e) => {
            if (!isPreviewing) lastEditorScrollTopRef.current = e.currentTarget.scrollTop;
          }}
        >
          <div className="mx-auto w-full max-w-4xl min-h-full border-x-4 border-border bg-muted/15 px-4 py-4 sm:px-8 sm:py-6">
          {isPreviewing ? (
            <div className="py-2">
              <div
                ref={previewScrollRef}
                className="h-[calc(100dvh-220px)] min-h-[420px] overflow-x-auto overflow-y-hidden snap-x snap-mandatory rounded-2xl"
                onScroll={(e) => {
                  lastPreviewScrollTopRef.current = e.currentTarget.scrollLeft;
                }}
              >
                <div className="flex min-h-full w-max gap-3 px-2 py-2">
                  <div className="snap-start w-[32vw] min-w-[220px] max-w-[320px] min-h-full flex flex-col items-center justify-center py-6">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Front</p>
                  <div className="w-full aspect-[3/4] max-w-[300px]">
                    {templateConfig && (
                      <CardTemplateRenderer
                        template={templateConfig}
                        userContent={userContent}
                        disableBackgroundAssetOverlay
                        className="border border-border shadow-md h-full w-full"
                      />
                    )}
                  </div>
                </div>

                  <div className="snap-start w-[32vw] min-w-[220px] max-w-[320px] min-h-full flex flex-col items-center justify-center py-6">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Inside right</p>
                  <div className="w-full aspect-[3/4] max-w-[300px]">
                    <CardInsideRightPreview
                      topText={userContent.insideRightTop}
                      middleText={userContent.insideRightMiddle}
                      bottomText={userContent.insideRightBottom}
                      backgroundColor={
                        isEasterPastelEggsGrid ? easterPastelPanelBg : undefined
                      }
                      textStyle={insideRightPreviewTextStyle}
                      className="border border-border shadow-md h-full w-full"
                    />
                  </div>
                </div>

                  <div className="snap-start w-[32vw] min-w-[220px] max-w-[320px] min-h-full flex flex-col items-center justify-center py-6">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Inside left</p>
                  <div className="w-full aspect-[3/4] max-w-[300px]">
                    <CardInsideLeftPreview
                      insideLeftMessage={userContent.insideLeftMessage}
                      photo1Url={userContent.photoUrls?.["inside-left-photo-1"] ?? null}
                      photo2Url={userContent.photoUrls?.["inside-left-photo-2"] ?? null}
                      photo3Url={userContent.photoUrls?.["inside-left-photo-3"] ?? null}
                      backgroundColor={
                        isEasterPastelEggsGrid ? easterPastelPanelBg : undefined
                      }
                      className="border border-border shadow-md h-full w-full"
                    />
                  </div>
                </div>

                  <div className="snap-start w-[32vw] min-w-[220px] max-w-[320px] min-h-full flex flex-col items-center justify-center py-6">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Back</p>
                  <div className="w-full aspect-[3/4] max-w-[300px]">
                    <CardBackPreview
                      backMessage={userContent.backMessage}
                      className="border border-border shadow-md h-full w-full"
                    />
                  </div>
                </div>
                </div>
              </div>
            </div>
          ) : null}

          {!isPreviewing ? (
            <>
              {/* Top section: Card preview (left) + Message & photo (right) - fixed max height so no overlap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 pb-6">
            {/* Left: Live card canvas (template + user content) - fixed size, no overlap */}
            <div
              className="flex flex-col items-center justify-start w-full gap-3"
              style={{ color: "rgba(246, 240, 224, 1)" }}
            >
              <Tabs
                value={cardView}
                onValueChange={(v) =>
                  setCardView(v as "front" | "insideLeft" | "insideRight" | "back")
                }
                className="w-full max-w-[340px] sm:max-w-[380px]"
              >
                <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
                  <TabsTrigger value="front" className="text-[10px] px-1 sm:text-xs">
                    Front
                  </TabsTrigger>
                  <TabsTrigger value="insideLeft" className="text-[10px] px-1 sm:text-xs">
                    In. left
                  </TabsTrigger>
                  <TabsTrigger value="insideRight" className="text-[10px] px-1 sm:text-xs">
                    In. right
                  </TabsTrigger>
                  <TabsTrigger value="back" className="text-[10px] px-1 sm:text-xs">
                    Back
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="w-[260px] h-[347px] sm:w-[280px] sm:h-[373px] md:w-[300px] md:h-[400px] flex-shrink-0">
                {cardView === "front" && templateConfig && (
                  <CardTemplateRenderer
                    template={templateConfig}
                    userContent={userContent}
                    disableBackgroundAssetOverlay
                    className="border border-border shadow-md h-full w-full"
                  />
                )}
                {cardView === "insideLeft" && (
                  <CardInsideLeftPreview
                    insideLeftMessage={userContent.insideLeftMessage}
                    photo1Url={userContent.photoUrls?.["inside-left-photo-1"] ?? null}
                    photo2Url={userContent.photoUrls?.["inside-left-photo-2"] ?? null}
                    photo3Url={userContent.photoUrls?.["inside-left-photo-3"] ?? null}
                    backgroundColor={
                      isEasterPastelEggsGrid ? easterPastelPanelBg : undefined
                    }
                    className="border border-border shadow-md h-full w-full"
                  />
                )}
                {cardView === "insideRight" && (
                  <CardInsideRightPreview
                    topText={userContent.insideRightTop}
                    middleText={userContent.insideRightMiddle}
                    bottomText={userContent.insideRightBottom}
                    backgroundColor={
                      isEasterPastelEggsGrid ? easterPastelPanelBg : undefined
                    }
                    textStyle={insideRightPreviewTextStyle}
                    className="border border-border shadow-md h-full w-full"
                  />
                )}
                {cardView === "back" && (
                  <CardBackPreview
                    backMessage={userContent.backMessage}
                    className="border border-border shadow-md h-full w-full"
                  />
                )}
              </div>
            </div>

            {/* Right: Editable fields bound to template elements */}
            <CardEditorPanel
              template={templateConfig!}
              userContent={userContent}
              onUserContentChange={(patch) =>
                setUserContent((prev) => ({ ...prev, ...patch }))
              }
              headlinePlaceholder={defaultGreeting}
              headlineInputClassName={
                template.id === "md-photo-oval-frame"
                  ? "text-black"
                  : undefined
              }
              editingPanel={cardView}
            />
          </div>

              {/* Add-ons: Flowers / Chocolates - always below, never overlapped */}
              <div className="border-t border-border pt-4 pb-2 flex-shrink-0">
                <p className="text-sm font-medium text-foreground mb-2">
                  Add a gift (optional)
                </p>
                <Tabs value={category} onValueChange={(v) => setCategory(v as AddOnCategory)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="flowers" className="text-xs sm:text-sm">
                      Flowers
                    </TabsTrigger>
                    <TabsTrigger value="chocolates" className="text-xs sm:text-sm">
                      Chocolates
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="flowers" className="mt-3 data-[state=inactive]:hidden">
                    <div className="overflow-x-auto pb-2">
                      <div className="flex gap-2">
                        {FLOWER_BOUQUETS.map((bouquet) => {
                          const isSelected = selectedFlowerId === bouquet.id;
                          return (
                            <button
                              key={bouquet.id}
                              type="button"
                              onClick={() => handleSelectFlower(bouquet.id)}
                              className={cn(
                                "flex min-w-[76px] max-w-[92px] shrink-0 flex-col rounded-lg border-2 bg-card overflow-hidden text-left transition-all hover:border-primary/50",
                                isSelected
                                  ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                                  : "border-border"
                              )}
                            >
                              <div className="relative aspect-square w-full max-h-[72px] overflow-hidden bg-muted">
                                <img
                                  src={bouquet.imageUrl}
                                  alt={bouquet.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="p-1">
                                <span className="block truncate text-[10px] font-medium leading-tight text-foreground">
                                  {bouquet.name}
                                </span>
                                <span className="text-[9px] text-muted-foreground">
                                  £{bouquet.price.toFixed(2)}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="chocolates" className="mt-3 data-[state=inactive]:hidden">
                    <div className="overflow-x-auto pb-2">
                      <div className="flex gap-2">
                        {CHOCOLATE_OPTIONS.map((choc) => {
                          const isSelected = selectedChocolateId === choc.id;
                          return (
                            <button
                              key={choc.id}
                              type="button"
                              onClick={() => handleSelectChocolate(choc.id)}
                              className={cn(
                                "flex min-w-[76px] max-w-[92px] shrink-0 flex-col rounded-lg border-2 bg-card overflow-hidden text-left transition-all hover:border-primary/50",
                                isSelected
                                  ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                                  : "border-border"
                              )}
                            >
                              <div className="relative aspect-square w-full max-h-[72px] overflow-hidden bg-muted">
                                <img
                                  src={choc.imageUrl}
                                  alt={choc.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="p-1">
                                <span className="block truncate text-[10px] font-medium leading-tight text-foreground">
                                  {choc.name}
                                </span>
                                <span className="text-[9px] text-muted-foreground">
                                  £{choc.price.toFixed(2)}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : null}
          </div>
        </div>

        <SheetFooter className="flex-shrink-0 border-t border-border px-6 py-4 mt-0 bg-card/50">
          {isPreviewing ? (
            <div className="flex w-full gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 font-display"
                size="lg"
                onClick={() => setIsPreviewing(false)}
              >
                Edit
              </Button>
              <Button
                type="button"
                className="flex-1 font-display"
                size="lg"
                onClick={handleCheckout}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? "Preparing…" : "Check out"}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              className="w-full font-display"
              size="lg"
              onClick={() => setIsPreviewing(true)}
            >
              Continue
            </Button>
          )}
        </SheetFooter>

        {/* Flowers upsell */}
        <Dialog open={isFlowersModalOpen} onOpenChange={setIsFlowersModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="text-left">
              <DialogTitle className="mt-2">
                Let&apos;s add some flowers to make their day extra special!
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[55vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FLOWER_BOUQUETS.map((b) => {
                const isSelected = selectedFlowerId === b.id;
                return (
                  <div
                    key={b.id}
                    className={cn(
                      "group relative rounded-xl border p-3 text-left transition",
                      isSelected ? "border-primary bg-primary/5" : "border-border bg-card"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedFlowerId(b.id)}
                      className="flex w-full items-center gap-3"
                    >
                      <img
                        src={b.imageUrl}
                        alt={b.name}
                        className="h-14 w-14 rounded-lg object-cover border border-border bg-muted"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <p className="min-w-0 flex-1 text-left font-medium text-foreground truncate">
                            {b.name}
                          </p>
                          <p className="shrink-0 text-sm text-foreground tabular-nums text-right w-[72px]">
                            £{b.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 text-left">
                          {b.description}
                        </p>
                      </div>
                    </button>

                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-start pl-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                      <Button
                        type="button"
                        variant="secondary"
                        className="pointer-events-auto"
                        onClick={() => setSelectedFlowerId(b.id)}
                      >
                        Add to basket
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <DialogFooter className="sm:justify-end sm:flex-row flex-col">
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => {
                  setIsFlowersModalOpen(false);
                  setIsChocolatesModalOpen(true);
                }}
              >
                Next
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Chocolates upsell */}
        <Dialog open={isChocolatesModalOpen} onOpenChange={setIsChocolatesModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="text-left">
              <DialogTitle className="mt-2">You&apos;ll never go wrong with a sweet treat...</DialogTitle>
            </DialogHeader>
            <div className="max-h-[55vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHOCOLATE_OPTIONS.map((c) => {
                const isSelected = selectedChocolateId === c.id;
                return (
                  <div
                    key={c.id}
                    className={cn(
                      "group relative rounded-xl border p-3 text-left transition",
                      isSelected ? "border-primary bg-primary/5" : "border-border bg-card"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedChocolateId(c.id)}
                      className="flex w-full items-center gap-3"
                    >
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="h-14 w-14 rounded-lg object-cover border border-border bg-muted"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <p className="min-w-0 flex-1 text-left font-medium text-foreground truncate">
                            {c.name}
                          </p>
                          <p className="shrink-0 text-sm text-foreground tabular-nums text-right w-[72px]">
                            £{c.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 text-left">
                          {c.description}
                        </p>
                      </div>
                    </button>

                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-start pl-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                      <Button
                        type="button"
                        variant="secondary"
                        className="pointer-events-auto"
                        onClick={() => setSelectedChocolateId(c.id)}
                      >
                        Add to basket
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <DialogFooter className="sm:justify-end sm:flex-row flex-col">
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => {
                  setIsChocolatesModalOpen(false);
                  const order = {
                    pdfPath: generatedPdfPath,
                    flowerId: selectedFlowerId,
                    chocolateId: selectedChocolateId,
                    templateId: template?.id ?? null,
                  };
                  localStorage.setItem("gg_checkout_order", JSON.stringify(order));
                  onOpenChange(false);
                  navigate("/checkout");
                }}
              >
                Next
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
};

export default TemplateCustomiseSheet;
