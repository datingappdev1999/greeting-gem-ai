import type { CardTemplateConfig } from "@/types/cardTemplate";

/**
 * Text-only card: headline (and optional subheading/body) centered.
 * No photo frame. Matches "text-only" layout.
 */
export function createTextOnlyConfig(
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
        id: "headline",
        type: "headline",
        zIndex: 1,
        position: { x: "center", y: "center" },
        size: { width: 88, height: 28 },
        style: {
          fontFamily: "var(--font-display)",
          fontSize: 1.5,
          fontWeight: "bold",
          color: "hsl(var(--foreground))",
          align: "center",
          lineClamp: 5,
        },
        defaultTextKey: "headline",
      },
      {
        id: "subheading",
        type: "subheading",
        zIndex: 1,
        position: { x: "center", y: 68 },
        size: { width: 85, height: 10 },
        style: {
          fontFamily: "inherit",
          fontSize: 0.875,
          fontWeight: "medium",
          color: "hsl(var(--muted-foreground))",
          align: "center",
          lineClamp: 2,
        },
        defaultTextKey: "subheading",
      },
      {
        id: "body",
        type: "body",
        zIndex: 1,
        position: { x: "center", y: 78 },
        size: { width: 80, height: 12 },
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

/**
 * Pastel Eggs Grid: full artwork as background; editable headline (+ optional subheading)
 * in the lower third where the design leaves open space.
 */
export function createEasterPastelEggsGridConfig(
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
        fill: "#FCF9F4",
        assetUrl: textureUrl,
        assetOpacity: 1,
      },
      {
        id: "headline",
        type: "headline",
        zIndex: 2,
        position: { x: "center", y: 74 },
        size: { width: 88, height: 14 },
        style: {
          fontFamily: "'Dancing Script', cursive",
          fontSize: 50 / 16,
          fontWeight: "light",
          color: "rgba(32, 5, 72, 1)",
          align: "center",
          lineClamp: 3,
        },
        defaultTextKey: "headline",
      },
      {
        id: "subheading",
        type: "subheading",
        zIndex: 2,
        position: { x: "center", y: 88 },
        size: { width: 85, height: 10 },
        style: {
          fontFamily: "inherit",
          fontSize: 0.95,
          fontWeight: "light",
          color: "hsl(var(--muted-foreground))",
          align: "center",
          lineClamp: 2,
        },
        defaultTextKey: "subheading",
      },
    ],
  };
}
