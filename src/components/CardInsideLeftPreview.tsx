import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface CardInsideLeftPreviewProps {
  insideLeftMessage?: string;
  photo1Url?: string | null;
  photo2Url?: string | null;
  photo3Url?: string | null;
  /** Panel background (default soft lilac). */
  backgroundColor?: string;
  /** When set, empty-slot labels/icons use this (e.g. Bunny Photo Frame). */
  insideLeftTextColor?: string;
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
  backgroundColor = "#FAEEF9",
  insideLeftTextColor,
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
          "h-full w-full flex flex-col items-center justify-center text-center",
          gapClass,
          !insideLeftTextColor && "text-muted-foreground"
        )}
        style={insideLeftTextColor ? { color: insideLeftTextColor } : undefined}
      >
        <div
          className={cn(
            "rounded-full flex items-center justify-center",
            iconWrapClass,
            !insideLeftTextColor && "border-muted-foreground/70"
          )}
          style={
            insideLeftTextColor
              ? {
                  borderColor: `color-mix(in srgb, ${insideLeftTextColor} 72%, transparent)`,
                }
              : undefined
          }
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
      <div
        className="absolute inset-0"
        style={{
          color: insideLeftTextColor ?? "rgba(253, 250, 244, 1)",
          left: 1,
        }}
      >
        {/* Top-left */}
        <div
          className={cn(
            "absolute h-[24%] w-[24%] overflow-hidden bg-transparent",
            !photo1Url && "border-2 border-dashed border-primary/40"
          )}
          style={{ transform: "rotate(-18deg)", left: "11.14%", top: "3.75%" }}
        >
          {renderPhotoSlot(photo1Url, "Add Photo", "sm")}
        </div>

        {/* Center */}
        <div
          className={cn(
            "absolute left-1/2 top-1/2 h-[38%] w-[52%] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-transparent",
            !photo2Url && "border-2 border-dashed border-primary/40"
          )}
          style={{ zIndex: 1 }}
        >
          {renderPhotoSlot(photo2Url, "Add Photo")}
        </div>

        {/* Bottom-right */}
        <div
          className={cn(
            "absolute h-[24%] w-[24%] overflow-hidden bg-transparent",
            !photo3Url && "border-2 border-dashed border-primary/40"
          )}
          style={{ transform: "rotate(18deg)", left: "61.36%", top: "71.55%", zIndex: 0 }}
        >
          {renderPhotoSlot(photo3Url, "Add Photo", "sm")}
        </div>
      </div>

      {/* Keep legacy message available for future use (not displayed in collage layout). */}
      <span className="sr-only">{insideLeftMessage}</span>
    </div>
  );
}
