import { cn } from "@/lib/utils";
import type { TextStyle } from "@/types/cardTemplate";

interface CardInsideRightPreviewProps {
  topText?: string;
  middleText?: string;
  bottomText?: string;
  /** Panel background (default warm cream). */
  backgroundColor?: string;
  /** Color and size; inside-right copy always uses Dancing Script on the card. */
  textStyle?: Pick<TextStyle, "fontFamily" | "color"> & {
    /** CSS font-size string (e.g. "24px" or "clamp(...)") */
    fontSize?: string;
  };
  className?: string;
}

/**
 * Renders the inside right-hand side of the card (when opened).
 * Text-only; matches card aspect ratio and styling.
 */
export default function CardInsideRightPreview({
  topText,
  middleText,
  bottomText,
  backgroundColor = "#F6F0E0",
  textStyle,
  className,
}: CardInsideRightPreviewProps) {
  const color = textStyle?.color ?? "#B08A2B";
  const fontSize = textStyle?.fontSize ?? "clamp(23px, 2.6vw, 24px)";
  /** Inside spread message slots always render in Dancing Script on the physical card. */
  const cardFont = "'Dancing Script', cursive";

  const renderBox = (value: string | undefined, placeholder: string) => {
    const text = value?.trim() ?? "";
    return (
      <p
        className="whitespace-pre-wrap break-words text-center"
        style={{
          fontFamily: cardFont,
          color,
          fontSize,
          lineHeight: 1.15,
        }}
      >
        {text.length > 0 ? (
          text
        ) : (
          <span style={{ opacity: 0.45 }}>{placeholder}</span>
        )}
      </p>
    );
  };

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-0 overflow-hidden rounded-2xl shadow-lg",
        className
      )}
      style={{
        aspectRatio: "3/4",
        background: backgroundColor,
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-between px-[10%] py-[12%]">
        <div className="w-full">{renderBox(topText, "Top")}</div>
        <div className="w-full">{renderBox(middleText, "Middle")}</div>
        <div className="w-full">{renderBox(bottomText, "Bottom")}</div>
      </div>
    </div>
  );
}
