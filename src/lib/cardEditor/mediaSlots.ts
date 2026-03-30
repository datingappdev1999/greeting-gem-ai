/**
 * Extensible media slot registry for the card editor.
 * Today: text + photo slots (canvas templates). Later: audio / video can register
 * parallel slot kinds and render targets without rewriting the Grapes shell.
 */
export type MediaSlotKind = "text" | "photo" | "audio" | "video";

export interface FutureMediaSlot {
  id: string;
  kind: Exclude<MediaSlotKind, "text" | "photo">;
  /** Reserved for when we add HTML/Grapes components for these types */
  label?: string;
}
