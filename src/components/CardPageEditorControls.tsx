import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CardPage } from "@/data/cardTemplates";

export interface CardPageEditorControlsProps {
  page: CardPage;
  textBySlotId: Record<string, string>;
  onTextChange: (slotId: string, value: string) => void;
  photoUrlBySlotId: Record<string, string | null>;
  onPhotoChange: (slotId: string, url: string | null) => void;
  headlinePlaceholder?: string;
  messagePlaceholder?: string;
  onExportPng?: () => void;
  onExportAllPngs?: () => void;
  exportDisabled?: boolean;
  className?: string;
}

function labelForTextSlot(slot: { id: string; editorLabel?: string }): string {
  return slot.editorLabel ?? slot.id.replace(/([A-Z])/g, " $1").trim();
}

/**
 * Dynamic fields for one template page (text slots + photo slots).
 */
export function CardPageEditorControls({
  page,
  textBySlotId,
  onTextChange,
  photoUrlBySlotId,
  onPhotoChange,
  headlinePlaceholder = "Your text",
  messagePlaceholder = "Your message",
  onExportPng,
  onExportAllPngs,
  exportDisabled = false,
  className,
}: CardPageEditorControlsProps) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const setFileInputRef = (slotId: string, el: HTMLInputElement | null) => {
    fileInputRefs.current[slotId] = el;
  };

  const handlePhotoUpload = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(slotId, reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className={className ?? "space-y-6"}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Editing: {page.label}
      </p>

      {page.textSlots.map((slot) => (
        <div key={slot.id}>
          <label
            htmlFor={`card-text-${slot.id}`}
            className="text-sm font-medium text-foreground block mb-1.5"
          >
            {labelForTextSlot(slot)}
          </label>
          <Textarea
            id={`card-text-${slot.id}`}
            value={textBySlotId[slot.id] ?? slot.defaultText}
            onChange={(e) => onTextChange(slot.id, e.target.value)}
            placeholder={
              slot.id === "headline"
                ? headlinePlaceholder
                : slot.id === "message"
                  ? messagePlaceholder
                  : messagePlaceholder
            }
            rows={slot.id === "insideRightMessage" ? 6 : 3}
            className="resize-none rounded-xl border-border bg-background w-full"
          />
        </div>
      ))}

      {page.photoSlots.map((slot) => {
        const photoUrl = photoUrlBySlotId[slot.id] ?? null;
        return (
          <div key={slot.id}>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              {slot.editorLabel ?? "Photo"}
            </label>
            <input
              ref={(el) => setFileInputRef(slot.id, el)}
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoUpload(slot.id, e)}
              className="hidden"
            />
            {photoUrl ? (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-border bg-muted shrink-0">
                  <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onPhotoChange(slot.id, null)}
                  >
                    Remove photo
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRefs.current[slot.id]?.click()}
                className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border bg-muted/30 py-8 px-4 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:bg-muted/50 transition"
              >
                <ImagePlus className="h-8 w-8" />
                Upload a photo
              </button>
            )}
          </div>
        );
      })}

      {(onExportPng || onExportAllPngs) && (
        <div className="pt-2 border-t border-border space-y-2">
          {onExportPng && (
            <>
              <Button
                type="button"
                variant="secondary"
                className="w-full rounded-xl"
                disabled={exportDisabled}
                onClick={onExportPng}
              >
                Download this page as PNG
              </Button>
              <p className="text-xs text-muted-foreground">
                Exports the page shown above at full artwork resolution.
              </p>
            </>
          )}
          {onExportAllPngs && (
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl"
              disabled={exportDisabled}
              onClick={onExportAllPngs}
            >
              Download all pages (PNG)
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default CardPageEditorControls;
