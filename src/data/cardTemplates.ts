/**
 * Canvas editor templates: one or more printable pages (e.g. front cover, inside left, inside right).
 * Coordinates in each page are % of that page’s width/height (0–100).
 *
 * ── Tuning ───────────────────────────────────────────────────────────────────
 * Adjust `pages[].textSlots` / `pages[].photoSlots` x, y, width, height per page.
 */

export interface PhotoSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "rect" | "oval";
  /** Side panel label */
  editorLabel?: string;
}

export interface TextSlot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  textAlign: "left" | "center" | "right";
  defaultText: string;
  canvasFontFamily?: string;
  minFontPx?: number;
  maxFontPx?: number;
  lineHeightRatio?: number;
  verticalAlign?: "top" | "center";
  paddingPercent?: number;
  editorLabel?: string;
}

export interface CardPage {
  id: string;
  /** Tab / UI label */
  label: string;
  /** Optional artwork; if omitted, a flat panel is used (fallbackPixelSize + fallbackColor). */
  backgroundImage?: string;
  /** Pixel size for solid fallback when there is no PNG (and if image load fails). */
  fallbackPixelSize: { width: number; height: number };
  fallbackColor?: string;
  aspectRatio: number;
  photoSlots: PhotoSlot[];
  textSlots: TextSlot[];
}

export interface CardTemplate {
  id: string;
  name: string;
  previewImage: string;
  pages: CardPage[];
}

import mdCanvasFoldFront from "@/assets/templates/md-canvas-fold-front.png";

const INSIDE_W = 512;
const INSIDE_H = 732;

/**
 * Mother’s Day — first template: front cover + inside left + inside right.
 * Inside panels default to plain white until you add dedicated PNGs (set backgroundImage per page).
 */
export const mothersDayFloralTemplate: CardTemplate = {
  id: "md-floral-photo-collage",
  name: "Floral Photo Collage",
  previewImage: mdCanvasFoldFront,
  pages: [
    {
      id: "front",
      label: "Front cover",
      backgroundImage: mdCanvasFoldFront,
      fallbackPixelSize: { width: 1024, height: 732 },
      aspectRatio: 1024 / 732,
      photoSlots: [
        {
          id: "photo-1",
          x: 52,
          y: 30,
          width: 44,
          height: 58,
          shape: "rect",
          editorLabel: "Photo",
        },
      ],
      textSlots: [
        {
          id: "headline",
          editorLabel: "Greeting",
          x: 51,
          y: 5,
          width: 46,
          height: 11,
          fontSize: 1.25,
          fontFamily: "Arial, Helvetica, sans-serif",
          canvasFontFamily: "Arial, Helvetica, sans-serif",
          color: "#000000",
          textAlign: "left",
          verticalAlign: "top",
          defaultText: "Hi Mum,",
          minFontPx: 14,
          maxFontPx: 36,
          lineHeightRatio: 1.15,
          paddingPercent: 1,
        },
        {
          id: "message",
          editorLabel: "Message (front)",
          x: 51,
          y: 16,
          width: 46,
          height: 12,
          fontSize: 1,
          fontFamily: "Arial, Helvetica, sans-serif",
          canvasFontFamily: "Arial, Helvetica, sans-serif",
          color: "#000000",
          textAlign: "left",
          verticalAlign: "top",
          defaultText: "Hope you have a wonderful Mother's Day.",
          minFontPx: 12,
          maxFontPx: 26,
          lineHeightRatio: 1.2,
          paddingPercent: 1,
        },
      ],
    },
    {
      id: "insideLeft",
      label: "Inside left",
      fallbackPixelSize: { width: INSIDE_W, height: INSIDE_H },
      fallbackColor: "#ffffff",
      aspectRatio: INSIDE_W / INSIDE_H,
      photoSlots: [],
      textSlots: [
        {
          id: "insideLeftGreeting",
          editorLabel: "Inside left",
          x: 8,
          y: 8,
          width: 84,
          height: 20,
          fontSize: 1.1,
          fontFamily: "Georgia, serif",
          canvasFontFamily: "Georgia, serif",
          color: "#111111",
          textAlign: "center",
          verticalAlign: "center",
          defaultText: "With love on Mother's Day",
          minFontPx: 14,
          maxFontPx: 32,
          lineHeightRatio: 1.2,
          paddingPercent: 2,
        },
      ],
    },
    {
      id: "insideRight",
      label: "Inside right",
      fallbackPixelSize: { width: INSIDE_W, height: INSIDE_H },
      fallbackColor: "#ffffff",
      aspectRatio: INSIDE_W / INSIDE_H,
      photoSlots: [],
      textSlots: [
        {
          id: "insideRightMessage",
          editorLabel: "Inside message",
          x: 8,
          y: 8,
          width: 84,
          height: 84,
          fontSize: 1,
          fontFamily: "Georgia, serif",
          canvasFontFamily: "Georgia, serif",
          color: "#111111",
          textAlign: "left",
          verticalAlign: "top",
          defaultText:
            "Thank you for everything you do for us. Wishing you a relaxing day filled with everything you love.",
          minFontPx: 11,
          maxFontPx: 22,
          lineHeightRatio: 1.35,
          paddingPercent: 2,
        },
      ],
    },
  ],
};

const templates: CardTemplate[] = [mothersDayFloralTemplate];

export function getCardTemplateById(id: string): CardTemplate | undefined {
  return templates.find((t) => t.id === id);
}

export function getCardTemplates(): CardTemplate[] {
  return templates;
}

export function getCardPage(template: CardTemplate, pageId: string): CardPage | undefined {
  return template.pages.find((p) => p.id === pageId);
}

/** Default text for every text slot (used for initial state + reset). */
export function getDefaultTextMap(template: CardTemplate): Record<string, string> {
  const m: Record<string, string> = {};
  for (const p of template.pages) {
    for (const s of p.textSlots) m[s.id] = s.defaultText;
  }
  return m;
}

export function getDefaultPhotoMap(template: CardTemplate): Record<string, string | null> {
  const m: Record<string, string | null> = {};
  for (const p of template.pages) {
    for (const s of p.photoSlots) m[s.id] = null;
  }
  return m;
}
