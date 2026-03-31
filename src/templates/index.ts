import type { CardTemplateConfig } from "@/types/cardTemplate";
import type { TemplateCard } from "@/lib/occasionsData";
import type { LayoutType } from "@/lib/occasionsData";
import type { CardPreviewConfig } from "@/types/cardPreview";
import { createOvalPhotoFrameConfig } from "./ovalPhotoFrame";
import { createRectPhotoFrameConfig } from "./rectPhotoFrame";
import { createArchPhotoFrameConfig } from "./archPhotoFrame";
import { createEasterPastelEggsGridConfig, createTextOnlyConfig } from "./textOnly";
import {
  createMothersDayFloralCollageConfig,
  getMdFloralPreviewConfig,
} from "./mothersDayFloralCollage";

/**
 * Return the config-driven preview config for a template, if it has one.
 * Used for the three-layer card preview (background, photo slots, frame overlay).
 */
export function getCardPreviewConfig(
  template: CardTemplateConfig
): CardPreviewConfig | null {
  if (template.id === "md-floral-photo-collage") {
    const bg = template.elements.find((el) => el.type === "background");
    const backgroundImageUrl =
      bg && "assetUrl" in bg && bg.assetUrl ? bg.assetUrl : "";
    return getMdFloralPreviewConfig(backgroundImageUrl);
  }
  return null;
}

/**
 * Build a structured CardTemplateConfig from the existing TemplateCard
 * (which has layoutType + imageUrl). Keeps current look; template texture
 * comes from imageUrl.
 */
export function getCardTemplateConfig(templateCard: TemplateCard): CardTemplateConfig {
  const { id, name, imageUrl } = templateCard;
  const layoutType: LayoutType = templateCard.layoutType;

  // Mother's Day Floral Photo Collage: full template image as background + 4 photo slots.
  if (id === "md-floral-photo-collage") {
    return createMothersDayFloralCollageConfig(templateCard.imageUrl);
  }

  // Easter Pastel Eggs: artwork fills the card; text editable in the lower area.
  if (id === "easter-pastel-eggs-grid") {
    return createEasterPastelEggsGridConfig(id, name, imageUrl);
  }

  // Easter Bunny Photo Frame: match the playful handwritten “Happy Easter” headline styling.
  if (id === "easter-bunny-photo-frame") {
    const base = createRectPhotoFrameConfig(id, name, imageUrl);
    return {
      ...base,
      elements: base.elements.map((el) => {
        if (el.type === "background") {
          return {
            ...el,
            fill: "#FCF9F4",
            assetOpacity: 1,
          };
        }
        if (el.type === "imageFrame" && el.id === "photo") {
          return {
            ...el,
            // Tweaked to visually match the desired placement from the editor inspector.
            // Using % keeps it responsive across preview sizes.
            // ~53px / 92px / 169px / 195px at ~275x367 preview (3:4 card).
            position: { x: 19, y: 25 },
            size: { width: 62, height: 53 },
          };
        }
        if (el.type !== "headline") return el;
        return {
          ...el,
          style: {
            ...el.style,
            fontFamily: "'Fredoka', var(--font-body), sans-serif",
            // 1.875rem @ 16px root ≈ 30px (matches inspector target).
            fontSize: 1.875,
            fontWeight: "bold",
            // Yellow fill; dark + light rings in CardTemplateRenderer.
            color: "#FFD700",
          },
        };
      }),
    };
  }

  // Easter Spring Florals: full-bleed art + headline in lower cream band (percent-based, scales with card).
  if (id === "easter-spring-florals") {
    const base = createTextOnlyConfig(id, name, imageUrl);
    return {
      ...base,
      elements: base.elements.map((el) => {
        if (el.type === "background") {
          return {
            ...el,
            fill: "#FCF9F4",
            assetOpacity: 1,
          };
        }
        if (el.type !== "headline") return el;
        return {
          ...el,
          position: { x: "center", y: 80 },
          size: { width: 88, height: 16 },
          style: {
            ...el.style,
            fontFamily: "'Great Vibes', 'Dancing Script', cursive",
            fontWeight: "normal",
            color: "rgba(213, 173, 63, 1)",
            align: "center",
            lineClamp: 3,
          },
        };
      }),
    };
  }

  // Easter text-only templates should use full artwork, not faint overlays.
  if (id === "easter-minimal-cross" || id === "easter-egg-hunt") {
    const base = createTextOnlyConfig(id, name, imageUrl);
    return {
      ...base,
      elements: base.elements.map((el) =>
        el.type === "background"
          ? {
              ...el,
              fill: "#FCF9F4",
              assetOpacity: 1,
            }
          : el
      ),
    };
  }

  // Birthday photo-upload templates: tighten photo slots to the central white windows.
  if (id === "bd-confetti-photo-rect") {
    const base = createRectPhotoFrameConfig(id, name, imageUrl);
    return {
      ...base,
      elements: base.elements.map((el) =>
        el.type === "imageFrame" && el.id === "photo"
          ? {
              ...el,
              // Match requested inspector bounds on the current preview canvas.
              // Source target: left=58, top=257, width=325, height=265 on ~438x585 canvas.
              position: { x: 13.24, y: 43.93 },
              size: { width: 74.2, height: 45.3 },
            }
          : el
      ),
    };
  }

  // Birthday Confetti Text: add a centered photo window over the white panel area.
  if (id === "bd-text-top-confetti") {
    const base = createTextOnlyConfig(id, name, imageUrl);
    return {
      ...base,
      elements: [
        ...base.elements,
        {
          id: "photo",
          type: "imageFrame",
          zIndex: 1,
          // Match requested inspector bounds on current preview (~438x585):
          // left=40, top=189, width=357, height=252
          position: { x: 9.13, y: 32.31 },
          size: { width: 81.51, height: 43.08 },
          frameShape: "rect",
          borderWidth: 2,
          borderColor: "rgba(0,0,0,0.15)",
          placeholderLabel: "Photo",
        },
      ],
    };
  }

  if (id === "bd-balloons-photo-oval") {
    const base = createOvalPhotoFrameConfig(id, name, imageUrl);
    return {
      ...base,
      elements: base.elements.map((el) =>
        el.type === "imageFrame" && el.id === "photo"
          ? {
              ...el,
              // Match requested inspector bounds on current preview (~438x585):
              // left=64, top=140, width=312, height=400
              position: { x: 14.61, y: 23.93 },
              size: { width: 71.23, height: 68.38 },
            }
          : el
      ),
    };
  }

  if (id === "bd-floral-arch-photo") {
    const base = createArchPhotoFrameConfig(id, name, imageUrl);
    return {
      ...base,
      elements: base.elements.map((el) =>
        el.type === "imageFrame" && el.id === "photo"
          ? {
              ...el,
              // Match requested inspector bounds on current preview (~438x585):
              // left=219 (with centered transform), top=99, width=271, height=350
              position: { x: "center", y: 16.92 },
              size: { width: 61.87, height: 59.83 },
            }
          : el
      ),
    };
  }

  switch (layoutType) {
    case "single-photo-oval":
      return createOvalPhotoFrameConfig(id, name, imageUrl);
    case "single-photo-rect":
      return createRectPhotoFrameConfig(id, name, imageUrl);
    case "single-photo-arch":
      return createArchPhotoFrameConfig(id, name, imageUrl);
    case "text-only":
      return createTextOnlyConfig(id, name, imageUrl);
    case "multi-photo":
      // Multi-photo not yet implemented as editable template; fallback to text-only with texture
      return createTextOnlyConfig(id, name, imageUrl);
    default:
      return createTextOnlyConfig(id, name, imageUrl);
  }
}

export { createOvalPhotoFrameConfig } from "./ovalPhotoFrame";
export { createRectPhotoFrameConfig } from "./rectPhotoFrame";
export { createArchPhotoFrameConfig } from "./archPhotoFrame";
export { createTextOnlyConfig } from "./textOnly";
