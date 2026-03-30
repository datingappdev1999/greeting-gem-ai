import type { CardTemplateConfig } from "@/types/cardTemplate";
import type { CardPreviewConfig } from "@/types/cardPreview";

/**
 * Mother's Day Floral Photo Collage: template image as full background,
 * four empty photo slots in a 2x2 grid. User can only add photos.
 */
export function createMothersDayFloralCollageConfig(
  backgroundImageUrl: string
): CardTemplateConfig {
  return {
    id: "md-floral-photo-collage",
    name: "Floral Photo Collage",
    aspectRatio: 1024 / 732,
    elements: [
      {
        id: "bg",
        type: "background",
        zIndex: 0,
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        fill: "transparent",
        assetUrl: backgroundImageUrl,
        assetOpacity: 1,
      },
      {
        id: "photo-1",
        type: "imageFrame",
        zIndex: 1,
        position: { x: 9, y: 20 },
        size: { width: 38, height: 30 },
        frameShape: "rect",
        borderWidth: 2,
        borderColor: "rgba(15, 23, 42, 0.2)",
        placeholderLabel: "Photo 1",
      },
      {
        id: "photo-2",
        type: "imageFrame",
        zIndex: 1,
        position: { x: 51, y: 20 },
        size: { width: 38, height: 30 },
        frameShape: "rect",
        borderWidth: 2,
        borderColor: "rgba(15, 23, 42, 0.2)",
        placeholderLabel: "Photo 2",
      },
      {
        id: "photo-3",
        type: "imageFrame",
        zIndex: 1,
        position: { x: 9, y: 52 },
        size: { width: 38, height: 30 },
        frameShape: "rect",
        borderWidth: 2,
        borderColor: "rgba(15, 23, 42, 0.2)",
        placeholderLabel: "Photo 3",
      },
      {
        id: "photo-4",
        type: "imageFrame",
        zIndex: 1,
        position: { x: 51, y: 52 },
        size: { width: 38, height: 30 },
        frameShape: "rect",
        borderWidth: 2,
        borderColor: "rgba(15, 23, 42, 0.2)",
        placeholderLabel: "Photo 4",
      },
    ],
  };
}

/** Preview config for Mother's Day Floral Collage — slot positions as % of card container. */
export function getMdFloralPreviewConfig(
  backgroundImageUrl: string,
  frameOverlayImageUrl?: string
): CardPreviewConfig {
  return {
    templateId: "md-floral-photo-collage",
    aspectRatio: 1024 / 732,
    backgroundImageUrl,
    frameOverlayImageUrl,
    photoSlots: [
      { id: "photo-1", left: 9, top: 20, width: 38, height: 30, placeholderLabel: "Photo 1" },
      { id: "photo-2", left: 51, top: 20, width: 38, height: 30, placeholderLabel: "Photo 2" },
      { id: "photo-3", left: 9, top: 52, width: 38, height: 30, placeholderLabel: "Photo 3" },
      { id: "photo-4", left: 51, top: 52, width: 38, height: 30, placeholderLabel: "Photo 4" },
    ],
  };
}
