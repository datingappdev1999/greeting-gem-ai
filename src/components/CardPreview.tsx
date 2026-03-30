import type { CardTemplate } from "@/data/cardTemplates";
import { cn } from "@/lib/utils";

export interface CardPreviewProps {
  template: CardTemplate;
  headline: string;
  message: string;
  photoUrl: string | null;
  className?: string;
}

/**
 * Legacy DOM preview for the first page only (front cover). Prefer CanvasCardPreview for editing.
 */
export function CardPreview({
  template,
  headline,
  message,
  photoUrl,
  className,
}: CardPreviewProps) {
  const page = template.pages[0];
  if (!page) return null;

  const textBySlotId: Record<string, string> = {
    headline,
    message,
  };

  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-2xl shadow-lg bg-white", className)}
      style={{ aspectRatio: page.aspectRatio }}
    >
      {page.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center rounded-2xl"
          style={{ backgroundImage: `url(${page.backgroundImage})` }}
        />
      )}

      {page.textSlots.map((slot) => (
        <div
          key={slot.id}
          className="absolute flex overflow-hidden rounded-2xl"
          style={{
            left: `${slot.x}%`,
            top: `${slot.y}%`,
            width: `${slot.width}%`,
            height: `${slot.height}%`,
            fontFamily: slot.fontFamily,
            fontSize: `${slot.fontSize}rem`,
            color: slot.color,
            textAlign: slot.textAlign,
            justifyContent:
              slot.textAlign === "center" ? "center" : slot.textAlign === "right" ? "flex-end" : "flex-start",
            alignItems: "center",
          }}
        >
          <span className="block w-full overflow-hidden text-ellipsis line-clamp-4 leading-tight">
            {textBySlotId[slot.id] ?? slot.defaultText}
          </span>
        </div>
      ))}

      {page.photoSlots.map((slot) => (
        <div
          key={slot.id}
          className={cn(
            "absolute overflow-hidden bg-white/90 border border-black/10",
            slot.shape === "oval" ? "rounded-full" : "rounded-xl"
          )}
          style={{
            left: `${slot.x}%`,
            top: `${slot.y}%`,
            width: `${slot.width}%`,
            height: `${slot.height}%`,
          }}
        >
          {slot.id === "photo-1" && photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="w-full h-full object-cover object-center block"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-black/40 text-sm font-medium">
              Add photo
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CardPreview;
