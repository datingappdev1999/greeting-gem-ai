import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface CardInsideLeftPreviewProps {
  insideLeftMessage?: string;
  photo1Url?: string | null;
  photo2Url?: string | null;
  photo3Url?: string | null;
  /** Panel background (default warm cream). */
  backgroundColor?: string;
  className?: string;
}

/**
 * Inside left-hand panel when the card is opened (paired with {@link CardInsideRightPreview}).
 */
export default function CardInsideLeftPreview({
  insideLeftMessage,
  photo1Url,
  photo2Url,
  photo3Url,
  backgroundColor = "#F6F0E0",
  className,
}: CardInsideLeftPreviewProps) {
  const renderPhotoSlot = (
    url: string | null | undefined,
    label: string,
    size: "sm" | "md" = "md"
  ) => {
    if (url) {
      return (
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
          aria-hidden
        />
      );
    }

    const iconWrapClass =
      size === "sm"
        ? "h-8 w-8 border-[3px]"
        : "h-10 w-10 border-4";
    const iconClass = size === "sm" ? "h-5 w-5" : "h-6 w-6";
    const labelClass = size === "sm" ? "text-sm" : "text-lg";
    const gapClass = size === "sm" ? "gap-1.5" : "gap-2";

    return (
      <div
        className={cn(
          "h-full w-full flex flex-col items-center justify-center text-muted-foreground text-center",
          gapClass
        )}
      >
        <div
          className={cn(
            "rounded-full border-muted-foreground/70 flex items-center justify-center",
            iconWrapClass
          )}
        >
          <Plus className={iconClass} />
        </div>
        <span className={cn("font-medium", labelClass)}>{label}</span>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col justify-center overflow-hidden rounded-2xl shadow-lg",
        className
      )}
      style={{
        aspectRatio: "3/4",
        background: backgroundColor,
      }}
    >
      {/* Collage-style photo layout */}
      <div className="absolute inset-0">
        {/* Top-left */}
        <div
          className="absolute h-[24%] w-[24%] overflow-hidden border-2 border-dashed border-primary/40 bg-transparent"
          style={{ transform: "rotate(-18deg)", left: 23, top: 18 }}
        >
          {renderPhotoSlot(photo1Url, "Add Photo", "sm")}
        </div>

        {/* Center */}
        <div
          className="absolute left-1/2 top-1/2 h-[38%] w-[52%] -translate-x-1/2 -translate-y-1/2 overflow-hidden border-2 border-dashed border-primary/40 bg-transparent"
          style={{ zIndex: 1 }}
        >
          {renderPhotoSlot(photo2Url, "Add Photo")}
        </div>

        {/* Bottom-right */}
        <div
          className="absolute h-[24%] w-[24%] overflow-hidden border-2 border-dashed border-primary/40 bg-transparent"
          style={{ transform: "rotate(18deg)", right: 18, bottom: 18, zIndex: 0 }}
        >
          {renderPhotoSlot(photo3Url, "Add Photo", "sm")}
        </div>
      </div>

      {/* Keep legacy message available for future use (not displayed in collage layout). */}
      <span className="sr-only">{insideLeftMessage}</span>
    </div>
  );
}
