import { cn } from "@/lib/utils";

interface InsideRightTextStyle {
  color?: string;
  fontFamily?: string;
  fontSize?: string | number;
}

interface CardInsideRightPreviewProps {
  topText?: string;
  middleText?: string;
  bottomText?: string;
  /** Panel background (default soft lilac). */
  backgroundColor?: string;
  /** Optional text style overrides for inside-right copy. */
  textStyle?: InsideRightTextStyle;
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
  backgroundColor = "#FAEEF9",
  textStyle,
  className,
}: CardInsideRightPreviewProps) {
  const color = textStyle?.color ?? "#5c4d6b";
  const fontSize = textStyle?.fontSize ?? "30px";
  const cardFont = textStyle?.fontFamily ?? "'Dancing Script', cursive";

  const placeholderStyle = {
    color: `color-mix(in srgb, ${color} 50%, transparent)`,
  } as const;

  const renderBox = (
    value: string | undefined,
    placeholder: string,
    options?: { opacity?: number }
  ) => {
    const text = value?.trim() ?? "";
    return (
      <p
        className="whitespace-pre-wrap break-words text-center"
        style={{
          marginTop: 0,
          marginBottom: 0,
          fontFamily: cardFont,
          color,
          fontSize,
          lineHeight: 1.15,
          ...(options?.opacity != null ? { opacity: options.opacity } : {}),
        }}
      >
        {text.length > 0 ? (
          text
        ) : (
          <span style={placeholderStyle}>{placeholder}</span>
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
      <div
        className="absolute inset-0 flex flex-col items-center justify-between px-[10%] py-[12%]"
        style={{ color: "rgba(253, 250, 245, 1)" }}
      >
        <div className="w-full">{renderBox(topText, "Top")}</div>
        <div className="w-full">{renderBox(middleText, "Middle")}</div>
        <div className="w-full">{renderBox(bottomText, "Bottom")}</div>
      </div>
    </div>
  );
}
