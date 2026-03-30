import type { CardTemplate } from "@/types/cardTemplate";
import fdToolsAndTies from "@/assets/templates/fd-tools-and-ties.jpg";

// Father's Day classic template:
// - warm cream background
// - decorative tools-and-tie illustration as a locked element
// - one square photo slot under the illustration
// - bold headline above the body text
// - smaller body text for a short message

export const fathersDayClassicTemplate: CardTemplate = {
  id: "fd-classic-tools-photo",
  name: "Father's Day Classic",
  aspectRatio: 3 / 4,
  elements: [
    {
      id: "bg",
      type: "background",
      zIndex: 0,
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      fill:
        "linear-gradient(to bottom, rgba(249, 246, 239, 1), rgba(245, 240, 230, 1))",
    },
    {
      id: "decor-tools",
      type: "decorative",
      zIndex: 1,
      position: { x: "center", y: 24 },
      size: { width: 46, height: 30 },
      assetUrl: fdToolsAndTies,
      opacity: 0.9,
    },
    {
      id: "photo-slot",
      type: "imageFrame",
      zIndex: 2,
      position: { x: "center", y: 56 },
      size: { width: 54, height: 30 },
      frameShape: "rect",
      borderWidth: 2,
      borderColor: "rgba(15, 23, 42, 0.35)",
      placeholderLabel: "Your photo",
    },
    {
      id: "headline-slot",
      type: "headline",
      zIndex: 3,
      position: { x: "center", y: 12 },
      size: { width: 82, height: 12 },
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 1.4,
        fontWeight: "bold",
        color: "hsl(var(--foreground))",
        align: "center",
        lineClamp: 2,
      },
      defaultTextKey: "headline",
    },
    {
      id: "body-slot",
      type: "body",
      zIndex: 3,
      position: { x: "center", y: 82 },
      size: { width: 82, height: 12 },
      style: {
        fontFamily: "inherit",
        fontSize: 0.85,
        fontWeight: "normal",
        color: "hsl(var(--muted-foreground))",
        align: "center",
        lineClamp: 3,
      },
      defaultTextKey: "body",
    },
  ],
};

