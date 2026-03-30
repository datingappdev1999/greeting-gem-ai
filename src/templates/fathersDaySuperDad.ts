import type { CardTemplate } from "@/types/cardTemplate";
// Note: We intentionally do NOT use the flattened \"Super Dad\" card image as a
// decorative asset here, because the goal is to make the card itself fully
// editable text-wise. The design below rebuilds that layout using live text
// elements (headline + body) only.

/**
 * Father's Day "Super Dad" template.
 *
 * Structured layout:
 * - Cream background
 * - Editable headline slot for the big SUPER DAD text (top)
 * - Locked geometric badge decorative element (center)
 * - Editable body text slot for the small footer line (bottom)
 */
export const fathersDaySuperDadTemplate: CardTemplate = {
  id: "fd-super-dad-structured",
  name: "Super Dad",
  aspectRatio: 3 / 4,
  elements: [
    {
      id: "bg",
      type: "background",
      zIndex: 0,
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      fill:
        "linear-gradient(to bottom, rgba(249, 250, 251, 1), rgba(241, 245, 249, 1))",
    },
    {
      id: "headline",
      type: "headline",
      zIndex: 1,
      position: { x: "center", y: 18 },
      size: { width: 86, height: 20 },
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 2.1,
        fontWeight: "bold",
        color: "#0b2348", // deep navy to match original
        align: "center",
        lineClamp: 2,
      },
      defaultTextKey: "headline",
    },
    {
      id: "body",
      type: "body",
      zIndex: 2,
      position: { x: "center", y: 78 },
      size: { width: 80, height: 12 },
      style: {
        fontFamily: "inherit",
        fontSize: 0.9,
        fontWeight: "medium",
        color: "#0b2348",
        align: "center",
        lineClamp: 2,
      },
      defaultTextKey: "body",
    },
  ],
};

