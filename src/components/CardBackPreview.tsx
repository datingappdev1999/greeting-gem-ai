import { cn } from "@/lib/utils";
import logoUrl from "@/assets/velvet-postbox-logo.png";

interface CardBackPreviewProps {
  backMessage?: string;
  /** Panel background (default off-white). */
  backgroundColor?: string;
  className?: string;
}

/**
 * Back cover of the card — short message or branding area.
 */
export default function CardBackPreview({
  backMessage,
  backgroundColor = "#FCF9F4",
  className,
}: CardBackPreviewProps) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden rounded-2xl shadow-lg",
        className
      )}
      style={{
        aspectRatio: "3/4",
        background: backgroundColor,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center px-[14%] py-[18%] pb-[34%]">
        <p
          className="text-center text-sm font-[inherit] leading-relaxed break-words whitespace-pre-wrap"
          style={{
            color: "hsl(var(--foreground) / 0.85)",
            fontFamily: "inherit",
          }}
        >
          {backMessage?.trim() ? backMessage.trim() : null}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-[9%] flex items-center justify-center pointer-events-none">
        <img
          src={logoUrl}
          alt="Velvet Postbox Cards"
          className="w-[44%] max-w-[140px] h-auto opacity-95"
        />
      </div>
    </div>
  );
}
