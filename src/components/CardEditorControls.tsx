import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface CardEditorControlsProps {
  headline: string;
  onHeadlineChange: (value: string) => void;
  message: string;
  onMessageChange: (value: string) => void;
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
  headlinePlaceholder?: string;
  messagePlaceholder?: string;
  onExportPng?: () => void;
  exportDisabled?: boolean;
  className?: string;
}

/**
 * Controls for the fixed-template card editor: headline, message, one photo upload.
 */
export function CardEditorControls({
  headline,
  onHeadlineChange,
  message,
  onMessageChange,
  photoUrl,
  onPhotoChange,
  headlinePlaceholder = "Your headline",
  messagePlaceholder = "Your message",
  onExportPng,
  exportDisabled = false,
  className,
}: CardEditorControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemovePhoto = () => onPhotoChange(null);

  return (
    <div className={className ?? "space-y-6"}>
      <div>
        <label htmlFor="card-headline" className="text-sm font-medium text-foreground block mb-1.5">
          Headline
        </label>
        <Textarea
          id="card-headline"
          value={headline}
          onChange={(e) => onHeadlineChange(e.target.value)}
          placeholder={headlinePlaceholder}
          rows={2}
          className="resize-none rounded-xl border-border bg-background w-full"
        />
        <p className="text-xs text-muted-foreground mt-1">Appears at the top of the card.</p>
      </div>

      <div>
        <label htmlFor="card-message" className="text-sm font-medium text-foreground block mb-1.5">
          Message
        </label>
        <Textarea
          id="card-message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={messagePlaceholder}
          rows={4}
          className="resize-none rounded-xl border-border bg-background w-full"
        />
        <p className="text-xs text-muted-foreground mt-1">Appears on the card.</p>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-1.5">Photo</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        {photoUrl ? (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-border bg-muted shrink-0">
              <img src={photoUrl} alt="Uploaded" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Photo appears in the card.</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 text-destructive hover:text-destructive"
                onClick={handleRemovePhoto}
              >
                Remove photo
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border bg-muted/30 py-8 px-4 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:bg-muted/50 transition"
          >
            <ImagePlus className="h-8 w-8" />
            Upload a photo
          </button>
        )}
      </div>

      {onExportPng && (
        <div className="pt-2 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-xl"
            disabled={exportDisabled}
            onClick={onExportPng}
          >
            Download card as PNG
          </Button>
          <p className="text-xs text-muted-foreground mt-1.5">
            Exports the composed canvas at full artwork resolution.
          </p>
        </div>
      )}
    </div>
  );
}

export default CardEditorControls;
