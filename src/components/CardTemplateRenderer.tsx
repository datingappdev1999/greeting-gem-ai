import type {
  CardTemplateConfig,
  CardUserContent,
  CardElement,
  BackgroundElement,
  ImageFrameElement,
  TextElement,
  FrameShape,
  DecorativeElement,
} from "@/types/cardTemplate";
import type { CardPreviewConfig, PhotoSlotConfig } from "@/types/cardPreview";
import { getCardPreviewConfig } from "@/templates";
import { fontWeightToCss } from "@/lib/cardFontWeight";
import { cn } from "@/lib/utils";

interface CardTemplateRendererProps {
  template: CardTemplateConfig;
  userContent: CardUserContent;
  className?: string;
  /** When true, do not render semi-transparent background texture overlays. */
  disableBackgroundAssetOverlay?: boolean;
}

/**
 * Renders one photo slot from config: position absolute with config left/top/width/height (%).
 * Image inside uses width: 100%, height: 100%, object-fit: cover; overflow: hidden on container.
 */
function ConfigPhotoSlot({
  slot,
  photoUrl,
}: {
  slot: PhotoSlotConfig;
  photoUrl: string | null;
}) {
  const isEmpty = !photoUrl;

  return (
    <div
      style={{
        position: "absolute",
        left: `${slot.left}%`,
        top: `${slot.top}%`,
        width: `${slot.width}%`,
        height: `${slot.height}%`,
        overflow: "hidden",
        boxSizing: "border-box",
        zIndex: 1,
      }}
      className={
        isEmpty
          ? "flex items-center justify-center border border-dashed border-black/15 bg-transparent"
          : ""
      }
    >
      {photoUrl ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
          }}
        >
          <img
            src={photoUrl}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        </div>
      ) : (
        <span className="text-xs font-medium text-black/30 pointer-events-none">
          {slot.placeholderLabel ?? "Add photo"}
        </span>
      )}
    </div>
  );
}

/**
 * Three-layer config-driven card preview:
 * Layer 1 — background image (position: relative container, fixed aspect ratio)
 * Layer 2 — photo slots (position: absolute from config, overflow: hidden, object-fit: cover)
 * Layer 3 — frame overlay (optional image on top: corner brackets, etc.)
 */
function ConfigDrivenPreview({
  config,
  userContent,
  className,
}: {
  config: CardPreviewConfig;
  userContent: CardUserContent;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl shadow-lg",
        className
      )}
      style={{
        aspectRatio: config.aspectRatio,
        width: "100%",
      }}
    >
      {/* Layer 1: Background — fills container */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${config.backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
        className="overflow-hidden rounded-2xl"
      />

      {/* Layer 2: Photo slots — position absolute from config */}
      {config.photoSlots.map((slot) => {
        const photoUrl =
          userContent.photoUrls && slot.id in userContent.photoUrls
            ? userContent.photoUrls[slot.id] ?? null
            : userContent.photoUrl;
        return (
          <ConfigPhotoSlot key={slot.id} slot={slot} photoUrl={photoUrl} />
        );
      })}

      {/* Layer 3: Frame overlay — corner brackets / frame decorations on top */}
      {config.frameOverlayImageUrl && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
            pointerEvents: "none",
          }}
          className="overflow-hidden rounded-2xl"
        >
          <img
            src={config.frameOverlayImageUrl}
            alt=""
            className="h-full w-full object-cover object-center"
            aria-hidden
          />
        </div>
      )}
    </div>
  );
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

/**
 * Generic photo frame for non–config templates. Frame has fixed position/size from placement; image inside does not affect it.
 */
function renderPhotoFrame(
  el: ImageFrameElement,
  placement: ReturnType<typeof usePlacement>,
  shapeClass: string,
  photoUrl: string | null,
  zIndex: number
): React.ReactNode {
  const hasPhoto = !!photoUrl;

  return (
    <div
      key={el.id}
      style={{
        position: "absolute",
        left: placement.left,
        top: placement.top,
        width: placement.width,
        height: placement.height,
        transform: placement.transform,
        zIndex,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
      className={cn(
        shapeClass,
        hasPhoto ? "bg-transparent" : "flex items-center justify-center border border-dashed border-black/15 bg-transparent"
      )}
    >
      {hasPhoto ? (
        <div
          className={cn("overflow-hidden", shapeClass)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
          }}
        >
          <img
            src={photoUrl}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        </div>
      ) : (
        <span className="text-xs font-medium text-black/35 pointer-events-none">
          {el.placeholderLabel ?? "Add photo"}
        </span>
      )}
    </div>
  );
}

function renderElement(
  el: CardElement,
  userContent: CardUserContent,
  templateId: string,
  options?: { disableBackgroundAssetOverlay?: boolean }
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
      const forceFullImage = !!bg.assetUrl && !!options?.disableBackgroundAssetOverlay;
      const useFullImage =
        forceFullImage || (!!bg.assetUrl && (bg.assetOpacity == null || bg.assetOpacity >= 1));
      return (
        <div
          key={el.id}
          style={{
            ...baseStyle,
            ...(useFullImage
              ? {
                  backgroundImage: `url(${bg.assetUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  background: bg.fill,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }),
            color: "rgba(247, 240, 224, 1)",
          }}
          className="overflow-hidden rounded-2xl"
        >
          {bg.assetUrl && !useFullImage && !options?.disableBackgroundAssetOverlay && (
            <div
              className="absolute inset-0"
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
      const photoUrlForSlot =
        userContent.photoUrls && el.id in userContent.photoUrls
          ? userContent.photoUrls[el.id] ?? null
          : userContent.photoUrl;

      const shapeClass = getFrameShapeClasses(frame.frameShape);
      return renderPhotoFrame(
        frame,
        placement,
        shapeClass,
        photoUrlForSlot,
        el.zIndex
      );
    }

    case "decorative": {
      const deco = el as DecorativeElement;
      return (
        <div
          key={el.id}
          style={{
            ...baseStyle,
            opacity: deco.opacity ?? 1,
          }}
          className="pointer-events-none select-none"
        >
          <img
            src={deco.assetUrl}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden
          />
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
      const isEmpty = value.trim().length === 0;
      // In the editor preview, empty optional fields shouldn't reserve space.
      if (isEmpty && key !== "headline") return null;

      const style = textEl.style;
      const lineClamp = style.lineClamp ?? 2;
      const headlineFontSize = "24px";
      const headlineVerticalPadding = "31px";
      const verticalPaddingPx = key === "headline" ? 23 : 20;

      // Full-bleed Easter template: wrap text in the lower band (default headline path is single-line).
      if (templateId === "easter-pastel-eggs-grid") {
        return (
          <div
            key={el.id}
            style={{
              ...baseStyle,
              fontFamily: style.fontFamily,
              fontWeight: fontWeightToCss(style.fontWeight),
              color: style.color,
              textAlign: style.align,
            }}
            className="leading-tight drop-shadow-sm break-words flex flex-col justify-center"
          >
            <span
              className="block w-full max-w-full"
              style={{
                fontSize: `${style.fontSize}rem`,
                lineHeight: 1.25,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: lineClamp,
                overflow: "hidden",
              }}
            >
              {value || (key === "headline" ? "\u00a0" : "")}
            </span>
          </div>
        );
      }

      return (
        <div
          key={el.id}
          style={{
            ...baseStyle,
            fontFamily: style.fontFamily,
            fontWeight: fontWeightToCss(style.fontWeight),
            color: style.color,
            textAlign: style.align,
          }}
          className="leading-tight drop-shadow-sm break-words"
        >
          <span
            className="block w-full max-w-full"
            style={{
              display: "flex",
              flexWrap: "nowrap",
              justifyContent: "center",
              alignItems: "center",
              whiteSpace: "nowrap",
              overflow: "visible",
              boxSizing: "content-box",
              backgroundSize: "none",
              height: "26px",
              paddingTop:
                key === "headline"
                  ? headlineVerticalPadding
                  : `${verticalPaddingPx}px`,
              paddingBottom:
                key === "headline"
                  ? headlineVerticalPadding
                  : `${verticalPaddingPx}px`,
              fontSize:
                key === "headline" ? headlineFontSize : `${style.fontSize}rem`,
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
  disableBackgroundAssetOverlay,
}: CardTemplateRendererProps) {
  const previewConfig = getCardPreviewConfig(template);

  if (previewConfig) {
    return (
      <ConfigDrivenPreview
        config={previewConfig}
        userContent={userContent}
        className={className}
      />
    );
  }

  const sorted = [...template.elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-0 overflow-hidden rounded-2xl shadow-lg isolate",
        className
      )}
      style={{
        aspectRatio: template.aspectRatio,
      }}
    >
      {sorted.map((el) =>
        renderElement(el, userContent, template.id, { disableBackgroundAssetOverlay })
      )}
    </div>
  );
}
