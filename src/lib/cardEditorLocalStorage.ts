const STORAGE_KEY_V1 = "gg-card-editor-md-floral-photo-collage-v1";
const STORAGE_KEY_V2 = "gg-card-editor-md-floral-photo-collage-v2";

export type StoredCardEditorStateV2 = {
  textBySlotId: Record<string, string>;
  photoBySlotId: Record<string, string | null>;
};

export function loadCardEditorState(): Partial<StoredCardEditorStateV2> | null {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const p = JSON.parse(rawV2) as Record<string, unknown>;
      if (p.textBySlotId && typeof p.textBySlotId === "object" && !Array.isArray(p.textBySlotId)) {
        return {
          textBySlotId: p.textBySlotId as Record<string, string>,
          photoBySlotId:
            p.photoBySlotId && typeof p.photoBySlotId === "object" && !Array.isArray(p.photoBySlotId)
              ? (p.photoBySlotId as Record<string, string | null>)
              : {},
        };
      }
    }

    const rawV1 = localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) {
      const p = JSON.parse(rawV1) as Record<string, unknown>;
      if (typeof p.headline === "string" && typeof p.message === "string") {
        return {
          textBySlotId: {
            headline: p.headline,
            message: p.message,
            insideLeftGreeting: "With love on Mother's Day",
            insideRightMessage:
              "Thank you for everything you do for us. Wishing you a relaxing day filled with everything you love.",
          },
          photoBySlotId: {
            "photo-1": typeof p.photoDataUrl === "string" ? p.photoDataUrl : null,
          },
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function saveCardEditorState(data: StoredCardEditorStateV2): void {
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(data));
  } catch {
    // Quota or private mode
  }
}
