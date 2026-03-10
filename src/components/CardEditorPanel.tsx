import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CardTemplateConfig, CardUserContent } from "@/types/cardTemplate";

interface CardEditorPanelProps {
  template: CardTemplateConfig;
  userContent: CardUserContent;
  onUserContentChange: (content: Partial<CardUserContent>) => void;
  /** Placeholder for headline when empty */
  headlinePlaceholder?: string;
  className?: string;
}

function hasElementType(
  template: CardTemplateConfig,
  type: "headline" | "subheading" | "body" | "imageFrame"
): boolean {
  return template.elements.some((el) => el.type === type);
}

export default function CardEditorPanel({
  template,
  userContent,
  onUserContentChange,
  headlinePlaceholder = "Your message",
  className,
}: CardEditorPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showHeadline = hasElementType(template, "headline");
  const showSubheading = hasElementType(template, "subheading");
  const showBody = hasElementType(template, "body");
  const showPhoto = hasElementType(template, "imageFrame");

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () =>
      onUserContentChange({ photoUrl: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removePhoto = () => onUserContentChange({ photoUrl: null });

  return (
    <div className={className ?? "flex flex-col gap-4 min-w-0"}>
      {showHeadline && (
        <div>
          <label
            htmlFor="card-headline"
            className="text-sm font-medium text-foreground block mb-1.5"
          >
            Your message
          </label>
          <Textarea
            id="card-headline"
            value={userContent.headline}
            onChange={(e) =>
              onUserContentChange({ headline: e.target.value })
            }
            placeholder={headlinePlaceholder}
            rows={4}
            className="resize-none rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            The card updates as you type.
          </p>
        </div>
      )}

      {showSubheading && (
        <div>
          <label
            htmlFor="card-subheading"
            className="text-sm font-medium text-foreground block mb-1.5"
          >
            Subheading
          </label>
          <input
            id="card-subheading"
            type="text"
            value={userContent.subheading ?? ""}
            onChange={(e) =>
              onUserContentChange({ subheading: e.target.value || undefined })
            }
            placeholder="Optional"
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}

      {showBody && (
        <div>
          <label
            htmlFor="card-body"
            className="text-sm font-medium text-foreground block mb-1.5"
          >
            Extra message
          </label>
          <Textarea
            id="card-body"
            value={userContent.body ?? ""}
            onChange={(e) =>
              onUserContentChange({ body: e.target.value || undefined })
            }
            placeholder="Optional"
            rows={2}
            className="resize-none rounded-xl border border-border bg-background text-foreground w-full"
          />
        </div>
      )}

      {showPhoto && (
        <div>
          <p className="text-sm font-medium text-foreground mb-1.5">Photo</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          {userContent.photoUrl ? (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-border bg-muted shrink-0">
                <img
                  src={userContent.photoUrl}
                  alt="Uploaded"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  Photo appears in the card frame.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 text-destructive hover:text-destructive"
                  onClick={removePhoto}
                >
                  Remove photo
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border bg-muted/30 py-6 px-4 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:bg-muted/50 transition"
            >
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              Upload a photo
            </button>
          )}
        </div>
      )}

      {!showHeadline && !showSubheading && !showBody && !showPhoto && (
        <p className="text-sm text-muted-foreground">
          This template has no editable fields.
        </p>
      )}
    </div>
  );
}
