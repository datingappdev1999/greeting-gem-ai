import type { CardTemplateConfig } from "@/types/cardTemplate";
import type { TemplateCard } from "@/lib/occasionsData";
import type { LayoutType } from "@/lib/occasionsData";
import type { CardPreviewConfig } from "@/types/cardPreview";
import { createOvalPhotoFrameConfig } from "./ovalPhotoFrame";
import { createRectPhotoFrameConfig } from "./rectPhotoFrame";
import { createArchPhotoFrameConfig } from "./archPhotoFrame";
import { createEasterPastelEggsGridConfig, createTextOnlyConfig } from "./textOnly";
import { fathersDaySuperDadTemplate } from "./fathersDaySuperDad";
import {
  createMothersDayFloralCollageConfig,
  getMdFloralPreviewConfig,
} from "./mothersDayFloralCollage";

/**
 * Return the config-driven preview config for a template, if it has one.
 * Used for the three-layer card preview (background, photo slots, frame overlay).
 */
export function getCardPreviewConfig(
  template: CardTemplateConfig
): CardPreviewConfig | null {
  if (template.id === "md-floral-photo-collage") {
    const bg = template.elements.find((el) => el.type === "background");
    const backgroundImageUrl =
      bg && "assetUrl" in bg && bg.assetUrl ? bg.assetUrl : "";
    return getMdFloralPreviewConfig(backgroundImageUrl);
  }
  return null;
}

/**
 * Build a structured CardTemplateConfig from the existing TemplateCard
 * (which has layoutType + imageUrl). Keeps current look; template texture
 * comes from imageUrl.
 */
export function getCardTemplateConfig(templateCard: TemplateCard): CardTemplateConfig {
  const { id, name, imageUrl } = templateCard;
  const layoutType: LayoutType = templateCard.layoutType;

  // Special structured template for the \"Super Dad\" card.
  if (id === "fd-bold-super-dad") {
    return fathersDaySuperDadTemplate;
  }

  // Mother's Day Floral Photo Collage: full template image as background + 4 photo slots.
  if (id === "md-floral-photo-collage") {
    return createMothersDayFloralCollageConfig(templateCard.imageUrl);
  }

  // Easter Pastel Eggs: artwork fills the card; text editable in the lower area.
  if (id === "easter-pastel-eggs-grid") {
    return createEasterPastelEggsGridConfig(id, name, imageUrl);
  }

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
