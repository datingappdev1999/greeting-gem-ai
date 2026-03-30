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
  fontWeight: "light" | "normal" | "medium" | "semibold" | "bold";
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

// New names requested in the latest architecture description.
// These are aliases so existing code (CardTemplateRenderer, etc.) continues to work.
export type CardTemplate = CardTemplateConfig;
export type CardElementUnion = CardElement;
export type TextElementSlot = TextElement;
export type ImageElement = ImageFrameElement;
export type DecorationElement = DecorativeElement;

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
  /** Data URL or URL of uploaded photo; replaces imageFrame placeholder (single-photo templates) */
  photoUrl: string | null;
  /** Multi-photo templates: elementId -> data URL. When set, imageFrame uses this over photoUrl. */
  photoUrls?: Record<string, string | null>;
  /** Text on the inside left panel when the card is opened */
  insideLeftMessage?: string;
  /** Text on the inside right panel when the card is opened (legacy single field). */
  insideRightMessage?: string;
  /** Inside right page: top text box */
  insideRightTop?: string;
  /** Inside right page: middle text box */
  insideRightMiddle?: string;
  /** Inside right page: bottom text box */
  insideRightBottom?: string;
  /** Text on the back of the card */
  backMessage?: string;
}

// Alias requested name
export type UserCardContent = CardUserContent;

/** Default content for a template (e.g. "Happy Mother's Day!") */
export function createDefaultUserContent(
  headline = "",
  subheading?: string,
  body?: string,
  insideRightMessage?: string,
  insideLeftMessage?: string,
  backMessage?: string,
  insideRightTop?: string,
  insideRightMiddle?: string,
  insideRightBottom?: string
): CardUserContent {
  return {
    headline: headline || "Your message",
    subheading,
    body,
    photoUrl: null,
    insideLeftMessage,
    insideRightMessage,
    insideRightTop,
    insideRightMiddle,
    insideRightBottom,
    backMessage,
  };
}

/** Image frame element ids for multi-photo templates */
export function getImageFrameIds(elements: CardElement[]): string[] {
  return elements
    .filter((el): el is ImageFrameElement => el.type === "imageFrame")
    .map((el) => el.id);
}
