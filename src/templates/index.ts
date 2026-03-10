import type { CardTemplateConfig } from "@/types/cardTemplate";
import type { TemplateCard } from "@/lib/occasionsData";
import type { LayoutType } from "@/lib/occasionsData";
import { createOvalPhotoFrameConfig } from "./ovalPhotoFrame";
import { createRectPhotoFrameConfig } from "./rectPhotoFrame";
import { createArchPhotoFrameConfig } from "./archPhotoFrame";
import { createTextOnlyConfig } from "./textOnly";

/**
 * Build a structured CardTemplateConfig from the existing TemplateCard
 * (which has layoutType + imageUrl). Keeps current look; template texture
 * comes from imageUrl.
 */
export function getCardTemplateConfig(templateCard: TemplateCard): CardTemplateConfig {
  const { id, name, imageUrl } = templateCard;
  const layoutType: LayoutType = templateCard.layoutType;

  switch (layoutType) {
    case "single-photo-oval":
      return createOvalPhotoFrameConfig(id, name, imageUrl);
    case "single-photo-rect":
      return createRectPhotoFrameConfig(id, name, imageUrl);
    case "single-photo-arch":
      return createArchPhotoFrameConfig(id, name, imageUrl);
    case "text-only":
      return createTextOnlyConfig(id, name, imageUrl);
    case "multi-photo":
      // Multi-photo not yet implemented as editable template; fallback to text-only with texture
      return createTextOnlyConfig(id, name, imageUrl);
    default:
      return createTextOnlyConfig(id, name, imageUrl);
  }
}

export { createOvalPhotoFrameConfig } from "./ovalPhotoFrame";
export { createRectPhotoFrameConfig } from "./rectPhotoFrame";
export { createArchPhotoFrameConfig } from "./archPhotoFrame";
export { createTextOnlyConfig } from "./textOnly";
