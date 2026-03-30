/**
 * Config-driven card preview: three independent layers.
 * - Layer 1: Background image (position: relative container, fixed aspect ratio)
 * - Layer 2: Photo slots (position: absolute divs from config, overflow: hidden, object-fit: cover)
 * - Layer 3: Frame overlay (optional image for corner brackets / frame decorations on top)
 *
 * Slot positions are percentage-based (0–100) relative to the card container.
 * Adjust slot positions per template in JSON/config without touching component logic.
 */

/** One photo slot: position and size as % of the card container */
export interface PhotoSlotConfig {
  id: string;
  /** Left position, 0–100 */
  left: number;
  /** Top position, 0–100 */
  top: number;
  /** Width, 0–100 */
  width: number;
  /** Height, 0–100 */
  height: number;
  /** Placeholder label when empty (e.g. "Photo 1") */
  placeholderLabel?: string;
}

/** Full preview config for a card template */
export interface CardPreviewConfig {
  /** Template id (e.g. "md-floral-photo-collage") */
  templateId: string;
  /** Card aspect ratio (width / height) */
  aspectRatio: number;
  /** Background image URL — fills the container */
  backgroundImageUrl: string;
  /** Photo slots with percentage-based position/size */
  photoSlots: PhotoSlotConfig[];
  /** Optional overlay image (corner brackets, frame lines) — rendered on top of photo slots */
  frameOverlayImageUrl?: string;
}
