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
import { templateHidesFrontHeadline } from "@/lib/cardTemplateFlags";
import { cn } from "@/lib/utils";

/** Bunny Photo Frame front headline: yellow fill, dark yellow outer ring, light yellow inner ring. */
const BUNNY_HEADLINE_FILL = "#FFD700";
const BUNNY_HEADLINE_OUTLINE_DARK = "#A67C00";
const BUNNY_HEADLINE_OUTLINE_LIGHT = "#FFF9C4";

function bunnyHeadlineTextShadow(): string {
  const ring = (px: number, color: string) =>
    [
      `${-px}px ${-px}px 0 ${color}`,
      `${-px}px 0 0 ${color}`,
      `${-px}px ${px}px 0 ${color}`,
      `0 ${-px}px 0 ${color}`,
      `0 ${px}px 0 ${color}`,
      `${px}px ${-px}px 0 ${color}`,
      `${px}px 0 0 ${color}`,
      `${px}px ${px}px 0 ${color}`,
    ];
  return [
    ...ring(3, BUNNY_HEADLINE_OUTLINE_DARK),
    ...ring(1, BUNNY_HEADLINE_OUTLINE_LIGHT),
    "0 4px 8px rgba(0,0,0,0.12)",
  ].join(", ");
}

interface CardTemplateRendererProps {
  template: CardTemplateConfig;
  userContent: CardUserContent;
  className?: string;
  /** When true, do not render semi-transparent background texture overlays. */
  disableBackgroundAssetOverlay?: boolean;
  /** Optional color override for all text elements in this render. */
  forceTextColor?: string;
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
function getPlacement(
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
  placement: ReturnType<typeof getPlacement>,
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
  options?: { disableBackgroundAssetOverlay?: boolean; forceTextColor?: string }
): React.ReactNode {
  const placement = getPlacement(el.position, el.size);
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
            color: "rgba(250, 238, 249, 1)",
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
      if (templateId === "easter-bunny-photo-frame" && frame.id === "photo") {
        const hasPhoto = !!photoUrlForSlot;
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
              zIndex: el.zIndex,
              boxSizing: "content-box",
              overflow: "visible",
            }}
            className={cn(
              shapeClass,
              hasPhoto
                ? "bg-transparent"
                : "grid place-items-center border border-dashed border-black/15 bg-transparent"
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
                  src={photoUrlForSlot}
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
                {frame.placeholderLabel ?? "Add photo"}
              </span>
            )}
          </div>
        );
      }

      return renderPhotoFrame(frame, placement, shapeClass, photoUrlForSlot, el.zIndex);
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
      if (templateHidesFrontHeadline(templateId) && key === "headline") {
        return null;
      }
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
              ...(key === "headline" ? { height: "80px" } : null),
              fontFamily: style.fontFamily,
              fontWeight: fontWeightToCss(style.fontWeight),
              color: options?.forceTextColor ?? style.color,
              textAlign: style.align,
            }}
            className="leading-tight drop-shadow-sm break-words flex flex-col justify-center"
          >
            <span
              className="block w-full max-w-full"
              style={{
                fontSize:
                  key === "headline" ? "50px" : `${style.fontSize}rem`,
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

      const isSpringFloralsHeadline =
        templateId === "easter-spring-florals" && key === "headline";
      const isBunnyHeadline =
        templateId === "easter-bunny-photo-frame" && key === "headline";

      const headlineInnerLayout: React.CSSProperties = isSpringFloralsHeadline
        ? {}
        : {
            display: "grid",
            placeItems: "center",
          };

      return (
        <div
          key={el.id}
          style={{
            ...baseStyle,
            ...(isBunnyHeadline
              ? {
                  left: "-2px",
                  top: "226px",
                  width: "200px",
                  height: "10.22%",
                  transform: undefined,
                }
              : null),
            ...(isSpringFloralsHeadline
              ? {
                  left: "101px",
                  top: "223px",
                  width: "88%",
                  height: "16%",
                  transform: undefined,
                }
              : null),
            fontFamily: style.fontFamily,
            fontWeight: fontWeightToCss(style.fontWeight),
            color: options?.forceTextColor ?? style.color,
            textAlign: style.align,
            ...headlineInnerLayout,
            whiteSpace: isSpringFloralsHeadline || isBunnyHeadline ? "normal" : "nowrap",
            overflow: "visible",
            boxSizing: "content-box",
            backgroundSize: "none",
            height:
              isBunnyHeadline
                ? "10.22%"
                : isSpringFloralsHeadline
                  ? "auto"
                  : "26px",
            paddingTop:
              key === "headline"
                ? isBunnyHeadline
                  ? "0px"
                  : isSpringFloralsHeadline
                    ? "0px"
                    : headlineVerticalPadding
                : `${verticalPaddingPx}px`,
            paddingBottom:
              key === "headline"
                ? isBunnyHeadline
                  ? "0px"
                  : isSpringFloralsHeadline
                    ? "0px"
                    : headlineVerticalPadding
                : `${verticalPaddingPx}px`,
            fontSize:
              key === "headline"
                ? isBunnyHeadline
                  ? "50px"
                  : isSpringFloralsHeadline
                    ? "50px"
                    : headlineFontSize
                : `${style.fontSize}rem`,
            ...(isSpringFloralsHeadline
              ? {
                  color: options?.forceTextColor ?? "rgba(213, 173, 63, 1)",
                  width: "100%",
                  textAlign: "center",
                  lineHeight: 1.2,
                  textShadow:
                    "0 0 12px rgba(248, 244, 234, 0.95), 0 1px 2px rgba(248, 244, 234, 0.9)",
                }
              : null),
            ...(isBunnyHeadline
              ? {
                  width: "200px",
                  paddingLeft: "2.27%",
                  paddingRight: "2.27%",
                  color: options?.forceTextColor ?? BUNNY_HEADLINE_FILL,
                  textShadow: bunnyHeadlineTextShadow(),
                  marginTop: "0px",
                  marginBottom: "0px",
                  lineHeight: 1.1,
                }
              : null),
          }}
          className={cn(
            "leading-tight drop-shadow-sm break-words",
            isSpringFloralsHeadline && "flex flex-row flex-wrap justify-center items-center"
          )}
        >
          {value || " "}
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
  forceTextColor,
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
        renderElement(el, userContent, template.id, {
          disableBackgroundAssetOverlay,
          forceTextColor,
        })
      )}
    </div>
  );
}
