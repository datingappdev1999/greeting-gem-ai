import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type {
  CardTemplateConfig,
  CardUserContent,
  ImageFrameElement,
} from "@/types/cardTemplate";
import { cn } from "@/lib/utils";

/** Which card face is being edited (used with multi-tab preview). `all` shows every section. */
export type CardEditorPanelView = "front" | "insideLeft" | "insideRight" | "back" | "all";

interface CardEditorPanelProps {
  template: CardTemplateConfig;
  userContent: CardUserContent;
  onUserContentChange: (content: Partial<CardUserContent>) => void;
  /** Placeholder for headline when empty */
  headlinePlaceholder?: string;
  /** Optional className for the headline Textarea (front cover). */
  headlineInputClassName?: string;
  /**
   * When set, only the matching controls are shown (e.g. one panel per tab).
   * Default / `"all"` shows front content plus inside left, inside right, and back messages.
   */
  editingPanel?: CardEditorPanelView;
  /** When true, hides the front cover “Your message” field (label, textarea, helper text). */
  hideFrontHeadline?: boolean;
  className?: string;
}

function hasElementType(
  template: CardTemplateConfig,
  type: "headline" | "body" | "imageFrame"
): boolean {
  return template.elements.some((el) => el.type === type);
}

function getImageFrames(template: CardTemplateConfig): ImageFrameElement[] {
  return template.elements.filter(
    (el): el is ImageFrameElement => el.type === "imageFrame"
  );
}

export default function CardEditorPanel({
  template,
  userContent,
  onUserContentChange,
  headlinePlaceholder = "Your message",
  headlineInputClassName,
  editingPanel = "all",
  hideFrontHeadline = false,
  className,
}: CardEditorPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiPhotoRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const showHeadline = hasElementType(template, "headline");
  const imageFrames = getImageFrames(template);
  const showPhoto = imageFrames.length > 0;
  const isMultiPhoto = imageFrames.length > 1;
  const hasFrontFields =
    showHeadline || showPhoto || isMultiPhoto;

  const showFrontBlock =
    editingPanel === "all" || editingPanel === "front";
  const showInsideLeftBlock =
    editingPanel === "all" || editingPanel === "insideLeft";
  const showInsideRightBlock =
    editingPanel === "all" || editingPanel === "insideRight";
  const showBackBlock = editingPanel === "all" || editingPanel === "back";

  const renderFrontFields =
    showFrontBlock && (editingPanel === "front" ? true : hasFrontFields);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () =>
      onUserContentChange({ photoUrl: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleMultiPhotoUpload =
    (frameId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        onUserContentChange({
          photoUrls: {
            ...(userContent.photoUrls ?? {}),
            [frameId]: reader.result as string,
          },
        });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    };

  const removePhoto = () => onUserContentChange({ photoUrl: null });
  const removeMultiPhoto = (frameId: string) =>
    onUserContentChange({
      photoUrls: {
        ...(userContent.photoUrls ?? {}),
        [frameId]: null,
      },
    });

  return (
    <div className={className ?? "flex flex-col gap-4 min-w-0"}>
      {editingPanel === "front" && !hasFrontFields && (
        <p className="text-sm text-muted-foreground">
          This template has no front cover text or photo fields. Use the other tabs for inside and
          back messages.
        </p>
      )}

      {showHeadline && renderFrontFields && !hideFrontHeadline && (
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
            className={cn(
              "resize-none rounded-xl border-border bg-white text-foreground placeholder:text-muted-foreground w-full",
              headlineInputClassName
            )}
          />
          <p className="text-xs text-muted-foreground mt-1">
            The card updates as you type.
          </p>
        </div>
      )}

      {showPhoto && !isMultiPhoto && renderFrontFields && (
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

      {isMultiPhoto && renderFrontFields && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground">Photos</p>
          <p className="text-xs text-muted-foreground">
            Add a photo to each box on the card. The card updates as you upload.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {imageFrames.map((frame) => {
              const url = userContent.photoUrls?.[frame.id] ?? null;
              return (
                <div key={frame.id}>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    {frame.placeholderLabel ?? frame.id}
                  </label>
                  <input
                    ref={(el) => {
                      multiPhotoRefs.current[frame.id] = el;
                    }}
                    type="file"
                    accept="image/*"
                    onChange={handleMultiPhotoUpload(frame.id)}
                    className="hidden"
                  />
                  {url ? (
                    <div className="flex items-center gap-2">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden border-2 border-border bg-muted shrink-0">
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeMultiPhoto(frame.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => multiPhotoRefs.current[frame.id]?.click()}
                      className="flex flex-col items-center justify-center gap-1.5 w-full rounded-xl border-2 border-dashed border-border bg-muted/30 py-4 px-3 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:bg-muted/50 transition"
                    >
                      <ImagePlus className="h-6 w-6" />
                      Add photo
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showInsideLeftBlock && (
        <div
          className={cn(
            editingPanel === "all" && hasFrontFields && "border-t border-border pt-4 mt-2"
          )}
        >
          <p className="text-sm font-medium text-foreground mb-1.5">Inside left</p>
          <p className="text-xs text-muted-foreground mb-2">
            Shown on the left-hand inside page when the card is opened.
          </p>

          <div className="space-y-3 mb-3">
            <p className="text-xs font-medium text-muted-foreground">Photos</p>
            <div className="grid grid-cols-3 gap-3">
              {(["inside-left-photo-1", "inside-left-photo-2", "inside-left-photo-3"] as const).map(
                (slotId, idx) => {
                  const url = userContent.photoUrls?.[slotId] ?? null;
                  return (
                    <div key={slotId}>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">
                        Photo {idx + 1}
                      </label>
                      <input
                        ref={(el) => {
                          multiPhotoRefs.current[slotId] = el;
                        }}
                        type="file"
                        accept="image/*"
                        onChange={handleMultiPhotoUpload(slotId)}
                        className="hidden"
                      />
                      {url ? (
                        <div className="space-y-1.5">
                          <div className="relative aspect-square w-full rounded-lg overflow-hidden border-2 border-border bg-muted">
                            <img src={url} alt="" className="h-full w-full object-cover" />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[11px] text-destructive hover:text-destructive"
                            onClick={() => removeMultiPhoto(slotId)}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => multiPhotoRefs.current[slotId]?.click()}
                          className="flex flex-col items-center justify-center gap-1.5 w-full rounded-xl border-2 border-dashed border-border bg-muted/30 py-3 px-2 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:bg-muted/50 transition"
                        >
                          <ImagePlus className="h-5 w-5" />
                          Add
                        </button>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}

      {showInsideRightBlock && (
        <div
          className={cn(
            editingPanel === "all" && "border-t border-border pt-4 mt-2"
          )}
        >
          <p className="text-sm font-medium text-foreground mb-1.5">Inside right</p>
          <p className="text-xs text-muted-foreground mb-2">
            Shown on the right-hand inside page when the card is opened.
          </p>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="card-inside-right-top"
                className="text-xs font-medium text-muted-foreground block mb-1.5"
              >
                Top
              </label>
              <Textarea
                id="card-inside-right-top"
                value={userContent.insideRightTop ?? ""}
                onChange={(e) =>
                  onUserContentChange({ insideRightTop: e.target.value || undefined })
                }
                placeholder="Top"
                rows={2}
                className="resize-none rounded-xl border-border bg-white text-black placeholder:text-muted-foreground w-full"
              />
            </div>

            <div>
              <label
                htmlFor="card-inside-right-middle"
                className="text-xs font-medium text-muted-foreground block mb-1.5"
              >
                Middle
              </label>
              <Textarea
                id="card-inside-right-middle"
                value={userContent.insideRightMiddle ?? ""}
                onChange={(e) =>
                  onUserContentChange({ insideRightMiddle: e.target.value || undefined })
                }
                placeholder="Middle"
                rows={2}
                className="resize-none rounded-xl border-border bg-white text-black placeholder:text-muted-foreground w-full"
              />
            </div>

            <div>
              <label
                htmlFor="card-inside-right-bottom"
                className="text-xs font-medium text-muted-foreground block mb-1.5"
              >
                Bottom
              </label>
              <Textarea
                id="card-inside-right-bottom"
                value={userContent.insideRightBottom ?? ""}
                onChange={(e) =>
                  onUserContentChange({ insideRightBottom: e.target.value || undefined })
                }
                placeholder="Bottom"
                rows={2}
                className="resize-none rounded-xl border-border bg-white text-black placeholder:text-muted-foreground w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Intentionally no right-side controls for the Back panel in this flow. */}

    </div>
  );
}
