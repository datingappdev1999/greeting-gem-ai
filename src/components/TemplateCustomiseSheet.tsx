import { useState, useRef, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FLOWER_BOUQUETS, CHOCOLATE_OPTIONS } from "@/lib/addOnsData";
import CardTemplateRenderer from "@/components/CardTemplateRenderer";
import CardEditorPanel from "@/components/CardEditorPanel";
import { getCardTemplateConfig } from "@/templates";
import { createDefaultUserContent } from "@/types/cardTemplate";
import type { TemplateCard } from "@/lib/occasionsData";
import { cn } from "@/lib/utils";

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
  const [category, setCategory] = useState<AddOnCategory>("flowers");
  const [selectedFlowerId, setSelectedFlowerId] = useState<string | null>(null);
  const [selectedChocolateId, setSelectedChocolateId] = useState<string | null>(null);
  const defaultGreeting = occasionName ? `Happy ${occasionName}!` : "Happy [Occasion]!";
  const [userContent, setUserContent] = useState(() =>
    createDefaultUserContent(defaultGreeting)
  );

  const templateConfig = useMemo(
    () => (template ? getCardTemplateConfig(template) : null),
    [template]
  );

  useEffect(() => {
    if (open && template) {
      setUserContent(createDefaultUserContent(defaultGreeting));
    }
  }, [open, template, defaultGreeting]);

  const handleSelectFlower = (id: string) => {
    setSelectedFlowerId((prev) => (prev === id ? null : id));
  };

  const handleSelectChocolate = (id: string) => {
    setSelectedChocolateId((prev) => (prev === id ? null : id));
  };

  const handleContinue = () => {
    if (!template) return;
    const displayMessage = userContent.headline.trim() || defaultGreeting;
    onContinue({
      template,
      message: displayMessage,
      photoUrl: userContent.photoUrl,
      flowerId: category === "chocolates" ? null : selectedFlowerId,
      chocolateId: category === "flowers" ? null : selectedChocolateId,
    });
    onOpenChange(false);
  };

  if (!template) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-none flex-col border-l bg-card sm:max-w-2xl md:max-w-4xl overflow-hidden"
      >
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-display text-lg">Customise your card</SheetTitle>
        </SheetHeader>

        {/* Scrollable body: card + form, then add-ons */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Top section: Card preview (left) + Message & photo (right) - fixed max height so no overlap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 pb-6">
            {/* Left: Live card canvas (template + user content) - fixed size, no overlap */}
            <div className="flex items-center justify-center w-full">
              <div className="w-[200px] h-[267px] sm:w-[220px] sm:h-[293px] md:w-[240px] md:h-[320px] flex-shrink-0">
                {templateConfig && (
                  <CardTemplateRenderer
                    template={templateConfig}
                    userContent={userContent}
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
            />
          </div>

          {/* Add-ons: Flowers / Chocolates - always below, never overlapped */}
          <div className="border-t border-border pt-4 pb-2 flex-shrink-0">
            <p className="text-sm font-medium text-foreground mb-2">Add a gift (optional)</p>
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
                <div className="flex gap-3">
                  {FLOWER_BOUQUETS.map((bouquet) => {
                    const isSelected = selectedFlowerId === bouquet.id;
                    return (
                      <button
                        key={bouquet.id}
                        type="button"
                        onClick={() => handleSelectFlower(bouquet.id)}
                        className={cn(
                          "flex min-w-[120px] max-w-[140px] shrink-0 flex-col rounded-xl border-2 bg-card overflow-hidden text-left transition-all hover:border-primary/50",
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                            : "border-border",
                        )}
                      >
                        <div className="relative aspect-square w-full overflow-hidden bg-muted">
                          <img
                            src={bouquet.imageUrl}
                            alt={bouquet.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-1.5">
                          <span className="block truncate text-xs font-medium text-foreground">
                            {bouquet.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
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
                <div className="flex gap-3">
                  {CHOCOLATE_OPTIONS.map((choc) => {
                    const isSelected = selectedChocolateId === choc.id;
                    return (
                      <button
                        key={choc.id}
                        type="button"
                        onClick={() => handleSelectChocolate(choc.id)}
                        className={cn(
                          "flex min-w-[120px] max-w-[140px] shrink-0 flex-col rounded-xl border-2 bg-card overflow-hidden text-left transition-all hover:border-primary/50",
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                            : "border-border",
                        )}
                      >
                        <div className="relative aspect-square w-full overflow-hidden bg-muted">
                          <img
                            src={choc.imageUrl}
                            alt={choc.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-1.5">
                          <span className="block truncate text-xs font-medium text-foreground">
                            {choc.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
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
        </div>

        <SheetFooter className="flex-shrink-0 border-t border-border pt-4 mt-0">
          <Button className="w-full font-display" size="lg" onClick={handleContinue}>
            Continue & Customise
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TemplateCustomiseSheet;
