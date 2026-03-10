import type { CardTemplateConfig } from "@/types/cardTemplate";

/**
 * Single photo in rounded-rectangle frame + headline below.
 * Matches "single-photo-rect" layout.
 */
export function createRectPhotoFrameConfig(
  id: string,
  name: string,
  textureUrl?: string
): CardTemplateConfig {
  return {
    id,
    name,
    aspectRatio: 3 / 4,
    elements: [
      {
        id: "bg",
        type: "background",
        zIndex: 0,
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
        fill: "linear-gradient(to bottom, rgba(255,241,242,0.95), white, rgba(253,242,248,0.95))",
        assetUrl: textureUrl,
        assetOpacity: 0.12,
      },
      {
        id: "photo",
        type: "imageFrame",
        zIndex: 1,
        position: { x: "center", y: 30 },
        size: { width: 78, height: 42 },
        frameShape: "rect",
        borderWidth: 2,
        borderColor: "rgba(254,226,226,0.8)",
        placeholderLabel: "Photo",
      },
      {
        id: "headline",
        type: "headline",
        zIndex: 2,
        position: { x: "center", y: 74 },
        size: { width: 90, height: 18 },
        style: {
          fontFamily: "var(--font-display)",
          fontSize: 1.25,
          fontWeight: "bold",
          color: "hsl(var(--foreground))",
          align: "center",
          lineClamp: 4,
        },
        defaultTextKey: "headline",
      },
      {
        id: "subheading",
        type: "subheading",
        zIndex: 2,
        position: { x: "center", y: 84 },
        size: { width: 85, height: 8 },
        style: {
          fontFamily: "inherit",
          fontSize: 0.875,
          fontWeight: "medium",
          color: "hsl(var(--muted-foreground))",
          align: "center",
          lineClamp: 1,
        },
        defaultTextKey: "subheading",
      },
      {
        id: "body",
        type: "body",
        zIndex: 2,
        position: { x: "center", y: 90 },
        size: { width: 80, height: 8 },
        style: {
          fontFamily: "inherit",
          fontSize: 0.75,
          fontWeight: "normal",
          color: "hsl(var(--muted-foreground))",
          align: "center",
          lineClamp: 2,
        },
        defaultTextKey: "body",
      },
    ],
  };
}
