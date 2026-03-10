/**
 * Card template system: structured, editable layers (Canva-style).
 * - template: layout + default styles (positions, sizes, fonts, frame shapes)
 * - userContent: user-edited text + uploaded image
 * - renderedCard: CardTemplateRenderer(template, userContent)
 */

/** Position/size in percentage of card (0–100) or "center" for alignment */
export type PositionUnit = number | "center";

export interface Position {
  /** 0–100 or "center" */
  x: PositionUnit;
  /** 0–100 or "center" */
  y: PositionUnit;
}

export interface Size {
  /** width as % of card */
  width: number;
  /** height as % of card */
  height: number;
}

/** Text alignment within the element */
export type TextAlign = "left" | "center" | "right";

export interface TextStyle {
  fontFamily: string;
  fontSize: number; // rem or px - we use Tailwind scale: 1 = xs, 2 = sm, 3 = base, 4 = lg, 5 = xl, 6 = 2xl, 7 = 3xl, 8 = 4xl
  fontWeight: "normal" | "medium" | "semibold" | "bold";
  color: string; // CSS color or Tailwind token name
  align: TextAlign;
  lineClamp?: number; // max lines
}

/** Shape of the photo frame (mask) */
export type FrameShape = "oval" | "rect" | "arch";

/** Element types in the template */
export type CardElementType =
  | "background"
  | "imageFrame"
  | "headline"
  | "subheading"
  | "body"
  | "decorative";

export interface BaseElement {
  id: string;
  type: CardElementType;
  zIndex: number;
  /** Position as % (0–100). "center" means 50 with align. */
  position: Position;
  /** Size as % of card */
  size: Size;
}

export interface BackgroundElement extends BaseElement {
  type: "background";
  /** Optional decorative asset URL (e.g. template texture) */
  assetUrl?: string;
  /** Opacity of asset 0–1 */
  assetOpacity?: number;
  /** CSS gradient or solid (e.g. "linear-gradient(...)" or "rgb(...)") */
  fill?: string;
}

export interface ImageFrameElement extends BaseElement {
  type: "imageFrame";
  frameShape: FrameShape;
  /** Border/style */
  borderWidth?: number;
  borderColor?: string;
  /** Placeholder when no user photo */
  placeholderLabel?: string;
}

export interface TextElement extends BaseElement {
  type: "headline" | "subheading" | "body";
  style: TextStyle;
  /** Default/placeholder text key (headline, subheading, body) */
  defaultTextKey: "headline" | "subheading" | "body";
}

export interface DecorativeElement extends BaseElement {
  type: "decorative";
  assetUrl: string;
  opacity?: number;
}

export type CardElement =
  | BackgroundElement
  | ImageFrameElement
  | TextElement
  | DecorativeElement;

export interface CardTemplateConfig {
  id: string;
  name: string;
  /** Aspect ratio width / height */
  aspectRatio: number;
  /** Ordered by zIndex; background first, then frame, text, decorative */
  elements: CardElement[];
}

/** User-editable content: what the user types and uploads */
export interface CardUserContent {
  headline: string;
  subheading?: string;
  body?: string;
  /** Data URL or URL of uploaded photo; replaces imageFrame placeholder */
  photoUrl: string | null;
}

/** Default content for a template (e.g. "Happy Mother's Day!") */
export function createDefaultUserContent(
  headline = "",
  subheading?: string,
  body?: string
): CardUserContent {
  return {
    headline: headline || "Your message",
    subheading,
    body,
    photoUrl: null,
  };
}
