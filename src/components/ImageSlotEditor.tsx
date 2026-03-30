import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { ImageTransform } from "@/hooks/useCardEditor";

interface ImageSlotEditorProps {
  imageUrl: string | null;
  transform: ImageTransform;
  onChangeImage: (url: string | null) => void;
  onChangeTransform: (patch: Partial<ImageTransform>) => void;
}

export function ImageSlotEditor({
  imageUrl,
  transform,
  onChangeImage,
  onChangeTransform,
}: ImageSlotEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChangeImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemove = () => onChangeImage(null);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground mb-1.5">
          Photo slot
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        {imageUrl ? (
          <div className="flex items-center gap-3">
            <div className="h-20 w-20 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
              <img
                src={imageUrl}
                alt="Uploaded"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                Image is clipped to the frame on the card.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 text-destructive hover:text-destructive"
                onClick={handleRemove}
              >
                Remove photo
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border bg-muted/40 py-5 px-4 text-sm font-medium text-muted-foreground hover:border-primary/60 hover:bg-muted/60 transition"
          >
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
            Upload a photo
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1">
            Zoom
            <span className="tabular-nums text-[11px]">
              {transform.scale.toFixed(2)}×
            </span>
          </label>
          <Slider
            min={1}
            max={2.4}
            step={0.01}
            value={[transform.scale]}
            onValueChange={([scale]) => onChangeTransform({ scale })}
          />
        </div>
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1">
            Horizontal position
            <span className="tabular-nums text-[11px]">
              {transform.offsetX.toFixed(0)}%
            </span>
          </label>
          <Slider
            min={-50}
            max={50}
            step={1}
            value={[transform.offsetX]}
            onValueChange={([offsetX]) => onChangeTransform({ offsetX })}
          />
        </div>
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1">
            Vertical position
            <span className="tabular-nums text-[11px]">
              {transform.offsetY.toFixed(0)}%
            </span>
          </label>
          <Slider
            min={-50}
            max={50}
            step={1}
            value={[transform.offsetY]}
            onValueChange={([offsetY]) => onChangeTransform({ offsetY })}
          />
        </div>
      </div>
    </div>
  );
}

export default ImageSlotEditor;

