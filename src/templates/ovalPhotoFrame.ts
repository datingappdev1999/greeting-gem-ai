import type { CardTemplateConfig } from "@/types/cardTemplate";

/**
 * Single photo in oval frame + headline below.
 * Matches current "single-photo-oval" layout (e.g. md-photo-oval-frame).
 */
export function createOvalPhotoFrameConfig(
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
        // Tuned to align with the oval in the customise-sheet preview.
        // Current preview measured: 198×265px
        // Target bounds: left=48px, top=47px, width=104px, height=137px
        // Percent (on 198×265): left=24.24%, top=17.74%, width=52.53%, height=51.7%
        position: { x: 24.24, y: 17.74 },
        size: { width: 52.53, height: 51.7 },
        frameShape: "oval",
        borderWidth: 2,
        borderColor: "rgba(254,226,226,0.8)",
        placeholderLabel: "Photo",
      },
      {
        id: "headline",
        type: "headline",
        zIndex: 2,
        // Bottom script headline (gold), placed low to avoid floral overlap.
        position: { x: "center", y: 75 },
        size: { width: 92, height: 10 },
        style: {
          fontFamily: "'Dancing Script', cursive",
          // Tuned to match the editor preview (21px at 16px root).
          fontSize: 1.3125,
          fontWeight: "bold",
          color: "#b08a2b",
          align: "center",
          lineClamp: 1,
        },
        defaultTextKey: "headline",
      },
      {
        id: "subheading",
        type: "subheading",
        zIndex: 2,
        // Secondary line (pink/mauve), spaced under headline.
        position: { x: "center", y: 83.5 },
        size: { width: 92, height: 8 },
        style: {
          fontFamily: "'Dancing Script', cursive",
          fontSize: 1.05,
          fontWeight: "medium",
          color: "#7B3F6E",
          align: "center",
          lineClamp: 1,
        },
        defaultTextKey: "subheading",
      },
      {
        id: "body",
        type: "body",
        zIndex: 2,
        // Optional small sign-off line; kept away from artwork.
        position: { x: "center", y: 90.5 },
        size: { width: 90, height: 6 },
        style: {
          fontFamily: "'Dancing Script', cursive",
          fontSize: 0.9,
          fontWeight: "normal",
          color: "#7B3F6E",
          align: "center",
          lineClamp: 1,
        },
        defaultTextKey: "body",
      },
    ],
  };
}
