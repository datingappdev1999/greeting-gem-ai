import { useState, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
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
import type { CardUserContent, TextStyle } from "@/types/cardTemplate";
import type { TemplateCard } from "@/lib/occasionsData";
import { templateHidesFrontHeadline } from "@/lib/cardTemplateFlags";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type EditorStep = "design" | "addons" | "review";

interface TemplateCustomiseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TemplateCard | null;
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

const CARD_PRICE_GBP = 3;

const TemplateCustomiseSheet = ({
  open,
  onOpenChange,
  template,
  occasionName,
  onContinue: _onContinue,
}: TemplateCustomiseSheetProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<EditorStep>("design");
  const [selectedFlowerId, setSelectedFlowerId] = useState<string | null>(null);
  const [selectedChocolateId, setSelectedChocolateId] = useState<string | null>(null);
  const [cardView, setCardView] = useState<
    "front" | "insideLeft" | "insideRight" | "back"
  >("front");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isFlowersModalOpen, setIsFlowersModalOpen] = useState(false);
  const [isChocolatesModalOpen, setIsChocolatesModalOpen] = useState(false);
  /** Avoid resetting step to design when closing flowers only to open chocolates. */
  const transitioningToChocolatesRef = useRef(false);

  const isSuperDad = template?.id === "fd-bold-super-dad";

  const defaultGreeting = isSuperDad
    ? "SUPER DAD"
    : template?.id === "easter-bunny-photo-frame"
      ? "Happy easter"
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
  const isEasterBunnyPhotoFrame = template?.id === "easter-bunny-photo-frame";
  const isEasterSpringFlorals = template?.id === "easter-spring-florals";
  const isEasterEggHunt = template?.id === "easter-egg-hunt";

  /**
   * Egg Hunt Fun: sage panel fill on inside left, inside right, and back only.
   * Bunny: mint; Spring Florals: white; others: default #FAEEF9 on components.
   */
  const insidePanelsBackgroundColor = isEasterEggHunt
    ? "#E6E8BD"
    : isEasterBunnyPhotoFrame
      ? "#E1EDED"
      : isEasterSpringFlorals
        ? "#FFFFFF"
        : undefined;

  const insideRightPreviewTextStyle = useMemo(() => {
    if (isEasterBunnyPhotoFrame) {
      return {
        fontFamily: "'Shadows Into Light', cursive",
        color: "#EDC602",
        fontSize: "50px",
      };
    }
    if (isEasterPastelEggsGrid) {
      return {
        fontFamily: "'Shadows Into Light', cursive",
        color: "#200548",
        fontSize: "50px",
      };
    }
    return {
      fontFamily: "'Shadows Into Light', cursive",
      color: "#5c4d6b",
      fontSize: "50px",
    };
  }, [isEasterBunnyPhotoFrame, isEasterPastelEggsGrid, frontHeadlineStyle]);

  useEffect(() => {
    if (open && template) {
      setStep("design");
      setSelectedFlowerId(null);
      setSelectedChocolateId(null);
      setCardView("front");
      setIsGeneratingPdf(false);
      setIsFlowersModalOpen(false);
      setIsChocolatesModalOpen(false);
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
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleClose = () => onOpenChange(false);

  const handleProceedCheckout = async () => {
    if (!template) return;
    setIsGeneratingPdf(true);
    let pdfPath: string | null = null;
    try {
      const r = await fetch("/api/render-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          template,
          userContent,
        }),
      });
      if (!r.ok) {
        const err = await r
          .json()
          .catch(() => ({ message: "Failed to generate PDF." as string }));
        toast.error(err?.message || "Failed to generate PDF.");
        return;
      }
      const data: { pdfPath?: string } = await r.json();
      if (!data.pdfPath) {
        toast.error("PDF generation completed without a file path.");
        return;
      }
      pdfPath = data.pdfPath;
    } catch {
      toast.error("Could not reach the PDF service. Please try again.");
      return;
    } finally {
      setIsGeneratingPdf(false);
    }

    localStorage.setItem(
      "gg_checkout_order",
      JSON.stringify({
        pdfPath,
        flowerId: selectedFlowerId,
        chocolateId: selectedChocolateId,
        templateId: template.id,
        template,
      })
    );
    onOpenChange(false);
    navigate("/checkout");
  };

  const stepLabels: { key: EditorStep; label: string; number: number }[] = [
    { key: "design", label: "Customise Card", number: 1 },
    { key: "addons", label: "Add a Gift", number: 2 },
    { key: "review", label: "Review", number: 3 },
  ];

  if (!template || !templateConfig) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-background overflow-hidden"
        >
          {/* Top bar */}
          <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="container flex items-center justify-between h-14 px-4 gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to templates
              </button>
              <div className="flex-1 min-w-0" aria-hidden />
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="container pb-3">
              <div className="flex items-center gap-2">
                {stepLabels.map((s, i) => (
                  <div key={s.key} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (s.key === "design") {
                          setStep("design");
                          setIsFlowersModalOpen(false);
                          setIsChocolatesModalOpen(false);
                        } else if (s.key === "addons") {
                          setStep("addons");
                          setIsChocolatesModalOpen(false);
                          setIsFlowersModalOpen(true);
                        } else {
                          setStep("review");
                          setIsFlowersModalOpen(false);
                          setIsChocolatesModalOpen(false);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        step === s.key
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                          step === s.key
                            ? "bg-primary-foreground text-primary"
                            : "bg-border text-muted-foreground"
                        )}
                      >
                        {s.number}
                      </span>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                    {i < stepLabels.length - 1 && (
                      <div className="hidden sm:block w-8 h-px bg-border shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="container py-8">
              <AnimatePresence mode="wait">
                {(step === "design" || step === "addons") && (
                  <motion.div
                    key="design"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className="max-w-5xl mx-auto"
                      style={{ color: "rgba(253, 250, 245, 1)" }}
                    >
                      <Tabs
                        value={cardView}
                        onValueChange={(v) => setCardView(v as typeof cardView)}
                        className="w-full"
                      >
                        <TabsList className="w-full mb-4 grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 text-black [&_button[data-state=active]]:text-black">
                          <TabsTrigger value="front" className="flex-1 text-xs sm:text-sm">
                            Front
                          </TabsTrigger>
                          <TabsTrigger
                            value="insideLeft"
                            className="flex-1 text-xs sm:text-sm"
                          >
                            Inside Left
                          </TabsTrigger>
                          <TabsTrigger
                            value="insideRight"
                            className="flex-1 text-xs sm:text-sm"
                          >
                            Inside Right
                          </TabsTrigger>
                          <TabsTrigger
                            value="back"
                            className="flex-1 text-xs sm:text-sm"
                          >
                            Back
                          </TabsTrigger>
                        </TabsList>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                          <div className="order-1">
                            <div className="sticky top-36">
                              <TabsContent value="front" className="mt-0 w-full flex justify-center lg:justify-start">
                                <div
                                  className="rounded-xl overflow-hidden shadow-card border border-border shrink-0 mx-auto lg:mx-0"
                                  style={{
                                    aspectRatio: "3 / 4",
                                    maxHeight:
                                      "min(80dvh, calc(100dvh - 8rem))",
                                    width:
                                      "min(100%, 440px, calc((min(80dvh, calc(100dvh - 8rem))) * 0.75))",
                                  }}
                                >
                                  <CardTemplateRenderer
                                    template={templateConfig}
                                    userContent={userContent}
                                    disableBackgroundAssetOverlay
                                    className="h-full w-full"
                                  />
                                </div>
                              </TabsContent>

                              <TabsContent value="insideLeft" className="mt-0 w-full flex justify-center lg:justify-start">
                                <div
                                  className="rounded-xl overflow-hidden shadow-card border border-border shrink-0 mx-auto lg:mx-0"
                                  style={{
                                    aspectRatio: "3 / 4",
                                    maxHeight:
                                      "min(80dvh, calc(100dvh - 8rem))",
                                    width:
                                      "min(100%, 440px, calc((min(80dvh, calc(100dvh - 8rem))) * 0.75))",
                                  }}
                                >
                                  <CardInsideLeftPreview
                                    insideLeftMessage={userContent.insideLeftMessage}
                                    photo1Url={userContent.photoUrls?.["inside-left-photo-1"] ?? null}
                                    photo2Url={userContent.photoUrls?.["inside-left-photo-2"] ?? null}
                                    photo3Url={userContent.photoUrls?.["inside-left-photo-3"] ?? null}
                                    backgroundColor={insidePanelsBackgroundColor}
                                    insideLeftTextColor={
                                      isEasterBunnyPhotoFrame || isEasterSpringFlorals
                                        ? "#EDC602"
                                        : undefined
                                    }
                                    className="h-full w-full border-0 shadow-none rounded-none"
                                  />
                                </div>
                              </TabsContent>

                              <TabsContent value="insideRight" className="mt-0 w-full flex justify-center lg:justify-start">
                                <div
                                  className="rounded-xl overflow-hidden shadow-card border border-border shrink-0 mx-auto lg:mx-0"
                                  style={{
                                    aspectRatio: "3 / 4",
                                    maxHeight:
                                      "min(80dvh, calc(100dvh - 8rem))",
                                    width:
                                      "min(100%, 440px, calc((min(80dvh, calc(100dvh - 8rem))) * 0.75))",
                                  }}
                                >
                                  <CardInsideRightPreview
                                    topText={userContent.insideRightTop}
                                    middleText={userContent.insideRightMiddle}
                                    bottomText={userContent.insideRightBottom}
                                    textStyle={insideRightPreviewTextStyle}
                                    backgroundColor={insidePanelsBackgroundColor}
                                    className="h-full w-full border-0 shadow-none rounded-none"
                                  />
                                </div>
                              </TabsContent>

                              <TabsContent value="back" className="mt-0 w-full flex justify-center lg:justify-start">
                                <div
                                  className="rounded-xl overflow-hidden shadow-card border border-border shrink-0 mx-auto lg:mx-0"
                                  style={{
                                    aspectRatio: "3 / 4",
                                    maxHeight:
                                      "min(80dvh, calc(100dvh - 8rem))",
                                    width:
                                      "min(100%, 440px, calc((min(80dvh, calc(100dvh - 8rem))) * 0.75))",
                                  }}
                                >
                                  <CardBackPreview
                                    backMessage={userContent.backMessage}
                                    backgroundColor={insidePanelsBackgroundColor}
                                    className="h-full w-full border-0 shadow-none rounded-none"
                                  />
                                </div>
                              </TabsContent>
                            </div>
                          </div>

                          <div className="order-2 space-y-6 self-start">
                            <div className="w-full max-w-[min(100%,22rem)] sm:max-w-md mx-auto lg:mx-0 space-y-4">
                              <CardEditorPanel
                                template={templateConfig}
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
                                hideFrontHeadline={templateHidesFrontHeadline(
                                  template.id
                                )}
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  setStep("addons");
                                  setIsFlowersModalOpen(true);
                                }}
                                size="lg"
                                className="w-full font-display -mt-1"
                              >
                                Continue to add gifts
                                <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Tabs>
                    </div>
                  </motion.div>
                )}

                {step === "review" && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ReviewStepContent
                      template={template}
                      userContent={userContent}
                      selectedFlowerId={selectedFlowerId}
                      selectedChocolateId={selectedChocolateId}
                      cardPrice={CARD_PRICE_GBP}
                      onBack={() => {
                        setStep("addons");
                        setIsChocolatesModalOpen(false);
                        setIsFlowersModalOpen(true);
                      }}
                      onCheckout={handleProceedCheckout}
                      isGeneratingPdf={isGeneratingPdf}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <Dialog
            open={isFlowersModalOpen}
            onOpenChange={(next) => {
              setIsFlowersModalOpen(next);
              if (!next) {
                if (transitioningToChocolatesRef.current) {
                  transitioningToChocolatesRef.current = false;
                  return;
                }
                setIsChocolatesModalOpen(false);
                if (step === "addons") setStep("design");
              }
            }}
          >
            <DialogContent className="max-w-2xl z-[100]">
              <DialogHeader className="text-left">
                <DialogTitle className="mt-2 font-display">
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
                          className="h-14 w-14 rounded-lg object-cover border border-border bg-muted shrink-0"
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
              <DialogFooter className="sm:justify-end sm:flex-row flex-col gap-2">
                <Button
                  type="button"
                  className="w-full sm:w-auto font-display"
                  onClick={() => {
                    transitioningToChocolatesRef.current = true;
                    setIsChocolatesModalOpen(true);
                    setIsFlowersModalOpen(false);
                  }}
                >
                  Next
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isChocolatesModalOpen}
            onOpenChange={(next) => {
              setIsChocolatesModalOpen(next);
            }}
          >
            <DialogContent className="max-w-2xl z-[100]">
              <DialogHeader className="text-left">
                <DialogTitle className="mt-2 font-display">
                  You&apos;ll never go wrong with a sweet treat...
                </DialogTitle>
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
                          className="h-14 w-14 rounded-lg object-cover border border-border bg-muted shrink-0"
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
              <DialogFooter className="sm:justify-end sm:flex-row flex-col gap-2">
                <Button
                  type="button"
                  className="w-full sm:w-auto font-display"
                  onClick={() => {
                    setIsChocolatesModalOpen(false);
                    setStep("review");
                  }}
                >
                  Next
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function ReviewStepContent({
  template,
  userContent,
  selectedFlowerId,
  selectedChocolateId,
  cardPrice,
  onBack,
  onCheckout,
  isGeneratingPdf,
}: {
  template: TemplateCard;
  userContent: CardUserContent;
  selectedFlowerId: string | null;
  selectedChocolateId: string | null;
  cardPrice: number;
  onBack: () => void;
  onCheckout: () => void;
  isGeneratingPdf: boolean;
}) {
  const flower = FLOWER_BOUQUETS.find((b) => b.id === selectedFlowerId);
  const chocolate = CHOCOLATE_OPTIONS.find((c) => c.id === selectedChocolateId);
  const total = cardPrice + (flower?.price ?? 0) + (chocolate?.price ?? 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-5">
            <div className="w-24 h-32 rounded-lg overflow-hidden shrink-0 border border-border bg-muted">
              <img
                src={template.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg text-foreground">{template.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{template.shortDescription}</p>
              <p className="text-sm font-semibold text-foreground mt-3 tabular-nums">
                £{cardPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {(flower || chocolate) && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display text-lg text-foreground">Gifts</h3>
            {flower && (
              <div className="flex items-center justify-between gap-4 py-2 border-b border-border/60 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border bg-muted">
                    <img
                      src={flower.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{flower.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{flower.description}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground shrink-0 tabular-nums">
                  £{flower.price.toFixed(2)}
                </p>
              </div>
            )}
            {chocolate && (
              <div className="flex items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border bg-muted">
                    <img
                      src={chocolate.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{chocolate.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {chocolate.description}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground shrink-0 tabular-nums">
                  £{chocolate.price.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-foreground">Total</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              £{total.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            size="lg"
            className="font-display"
            disabled={isGeneratingPdf}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            type="button"
            onClick={onCheckout}
            size="lg"
            className="flex-1 font-display"
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? "Preparing…" : "Proceed to checkout"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TemplateCustomiseSheet;
