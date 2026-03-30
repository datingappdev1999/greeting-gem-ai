import React from "react";
import type {
  CardTemplate,
  CardElementUnion,
  BackgroundElement,
  ImageElement,
  TextElementSlot,
  DecorationElement,
  UserCardContent,
} from "@/types/cardTemplate";
import type { ImageTransformMap } from "@/hooks/useCardEditor";
import { fontWeightToCss } from "@/lib/cardFontWeight";
import { cn } from "@/lib/utils";

interface CardArtboardProps {
  template: CardTemplate;
  userContent: UserCardContent;
  imageTransforms: ImageTransformMap;
  selectedElementId: string | null;
  onSelectElement?: (elementId: string) => void;
  className?: string;
}

function placementStyles(el: CardElementUnion): React.CSSProperties {
  const { position, size } = el;
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

  return { position: "absolute", left, top, width, height, transform };
}

function renderBackground(el: BackgroundElement): React.ReactNode {
  const base = placementStyles(el);
  return (
    <div
      key={el.id}
      style={{
        ...base,
        background: el.fill,
      }}
      className="overflow-hidden rounded-2xl"
    />
  );
}

function renderDecoration(el: DecorationElement): React.ReactNode {
  const base = placementStyles(el);
  return (
    <div
      key={el.id}
      style={{
        ...base,
        opacity: el.opacity ?? 1,
      }}
      className="pointer-events-none select-none"
    >
      <img
        src={el.assetUrl}
        alt=""
        className="h-full w-full object-cover"
        aria-hidden
      />
    </div>
  );
}

function frameShapeClasses(shape: ImageElement["frameShape"]): string {
  switch (shape) {
    case "oval":
      return "rounded-full";
    case "arch":
      return "rounded-t-[45%] rounded-b-2xl";
    case "rect":
    default:
      return "rounded-2xl";
  }
}

function renderImageFrame(
  el: ImageElement,
  userContent: UserCardContent,
  imageTransforms: ImageTransformMap,
  selectedElementId: string | null,
  onSelectElement?: (id: string) => void
): React.ReactNode {
  const base = placementStyles(el);
  const transform = imageTransforms[el.id] ?? {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  };

  const hasPhoto = !!userContent.photoUrl;

  return (
    <button
      key={el.id}
      type="button"
      style={base}
      onClick={() => onSelectElement?.(el.id)}
      className={cn(
        "group flex items-center justify-center overflow-hidden bg-white/95 shadow-card border-2 border-slate-300 relative focus:outline-none",
        frameShapeClasses(el.frameShape),
        selectedElementId === el.id &&
          "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {hasPhoto ? (
        <img
          src={userContent.photoUrl!}
          alt="Uploaded"
          className="h-full w-full object-cover"
          style={{
            transform: `translate(${transform.offsetX}%, ${transform.offsetY}%) scale(${transform.scale})`,
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs font-medium text-slate-500">
          {el.placeholderLabel ?? "Add photo"}
        </div>
      )}
    </button>
  );
}

function renderTextSlot(
  el: TextElementSlot,
  userContent: UserCardContent,
  selectedElementId: string | null,
  onSelectElement?: (id: string) => void
): React.ReactNode {
  const base = placementStyles(el);
  const key = el.defaultTextKey;
  const value =
    key === "headline"
      ? userContent.headline
      : key === "body"
      ? userContent.body ?? ""
      : userContent.subheading ?? "";

  const style = el.style;
  const lineClamp = style.lineClamp ?? 2;

  return (
    <button
      key={el.id}
      type="button"
      style={{
        ...base,
        fontFamily: style.fontFamily,
        fontSize: `${style.fontSize}rem`,
        fontWeight: fontWeightToCss(style.fontWeight),
        color: style.color,
        textAlign: style.align,
      }}
      onClick={() => onSelectElement?.(el.id)}
      className={cn(
        "flex items-center justify-center px-2 text-center leading-tight drop-shadow-sm break-words focus:outline-none",
        selectedElementId === el.id &&
          "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
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
        {value}
      </span>
    </button>
  );
}

export function CardArtboard({
  template,
  userContent,
  imageTransforms,
  selectedElementId,
  onSelectElement,
  className,
}: CardArtboardProps) {
  const sorted = [...template.elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-card",
        className
      )}
    >
      {sorted.map((el) => {
        if (el.type === "background") {
          return renderBackground(el);
        }
        if (el.type === "decorative") {
          return renderDecoration(el);
        }
        if (el.type === "imageFrame") {
          return renderImageFrame(
            el,
            userContent,
            imageTransforms,
            selectedElementId,
            onSelectElement
          );
        }
        if (el.type === "headline" || el.type === "subheading" || el.type === "body") {
          return renderTextSlot(el, userContent, selectedElementId, onSelectElement);
        }
        return null;
      })}
    </div>
  );
}

export default CardArtboard;

