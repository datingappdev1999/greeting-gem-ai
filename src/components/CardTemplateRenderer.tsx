import type {
  CardTemplateConfig,
  CardUserContent,
  CardElement,
  BackgroundElement,
  ImageFrameElement,
  TextElement,
  FrameShape,
} from "@/types/cardTemplate";
import { cn } from "@/lib/utils";

interface CardTemplateRendererProps {
  template: CardTemplateConfig;
  userContent: CardUserContent;
  className?: string;
}

/** Resolve position/size to CSS (percent; "center" -> 50% with transform) */
function usePlacement(
  position: { x: number | "center"; y: number | "center" },
  size: { width: number; height: number }
) {
  const left = position.x === "center" ? "50%" : `${position.x}%`;
  const top = position.y === "center" ? "50%" : `${position.y}%`;
  const width = `${size.width}%`;
  const height = `${size.height}%`;
  const transform =
    position.x === "center" || position.y === "center"
      ? [
          position.x === "center" ? "translateX(-50%)" : "",
          position.y === "center" ? "translateY(-50%)" : "",
        ]
          .filter(Boolean)
          .join(" ") || undefined
      : undefined;
  return { left, top, width, height, transform };
}

function getFrameShapeClasses(shape: FrameShape): string {
  switch (shape) {
    case "oval":
      return "rounded-[50%]";
    case "rect":
      return "rounded-2xl";
    case "arch":
      return "rounded-t-[45%] rounded-b-2xl";
    default:
      return "rounded-2xl";
  }
}

function renderElement(
  el: CardElement,
  userContent: CardUserContent
): React.ReactNode {
  const placement = usePlacement(el.position, el.size);
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: placement.left,
    top: placement.top,
    width: placement.width,
    height: placement.height,
    transform: placement.transform,
    zIndex: el.zIndex,
  };

  switch (el.type) {
    case "background": {
      const bg = el as BackgroundElement;
      return (
        <div
          key={el.id}
          style={{
            ...baseStyle,
            background: bg.fill,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="overflow-hidden rounded-2xl"
        >
          {bg.assetUrl && (
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: `url(${bg.assetUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: bg.assetOpacity ?? 0.12,
              }}
            />
          )}
        </div>
      );
    }

    case "imageFrame": {
      const frame = el as ImageFrameElement;
      const shapeClass = getFrameShapeClasses(frame.frameShape);
      const hasPhoto = !!userContent.photoUrl;
      return (
        <div
          key={el.id}
          style={baseStyle}
          className={cn(
            "flex items-center justify-center overflow-hidden bg-white/95 shadow-lg border-2 border-rose-100/80",
            shapeClass
          )}
        >
          {hasPhoto ? (
            <img
              src={userContent.photoUrl!}
              alt="Your photo"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-rose-100/50 to-pink-100/50 flex items-center justify-center text-rose-400 text-sm font-medium">
              {frame.placeholderLabel ?? "Photo"}
            </div>
          )}
        </div>
      );
    }

    case "headline":
    case "subheading":
    case "body": {
      const textEl = el as TextElement;
      const key = textEl.defaultTextKey;
      const value =
        key === "headline"
          ? userContent.headline
          : key === "subheading"
            ? userContent.subheading ?? ""
            : userContent.body ?? "";
      const style = textEl.style;
      const lineClamp = style.lineClamp ?? 2;
      return (
        <div
          key={el.id}
          style={{
            ...baseStyle,
            fontFamily: style.fontFamily,
            fontSize: `${style.fontSize}rem`,
            fontWeight: style.fontWeight,
            color: style.color,
            textAlign: style.align,
            display: "flex",
            alignItems: "center",
            justifyContent:
              style.align === "center"
                ? "center"
                : style.align === "right"
                  ? "flex-end"
                  : "flex-start",
          }}
          className="leading-tight drop-shadow-sm break-words"
        >
          <span
            className="block w-full max-w-full"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: lineClamp,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {value || " "}
          </span>
        </div>
      );
    }

    default:
      return null;
  }
}

export default function CardTemplateRenderer({
  template,
  userContent,
  className,
}: CardTemplateRendererProps) {
  const sorted = [...template.elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-0 overflow-hidden rounded-2xl shadow-lg",
        className
      )}
      style={{ aspectRatio: template.aspectRatio }}
    >
      {sorted.map((el) => renderElement(el, userContent))}
    </div>
  );
}
