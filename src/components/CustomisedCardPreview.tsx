import type { TemplateCard } from "@/lib/occasionsData";
import { getCardTemplateConfig } from "@/templates";
import CardTemplateRenderer from "@/components/CardTemplateRenderer";
import { cn } from "@/lib/utils";

/**
 * Legacy wrapper: accepts old props (template, photoUrl, greeting, tone, context)
 * and renders the card via the editable template system (CardTemplateRenderer).
 * Use CardTemplateRenderer + CardUserContent directly for new code.
 */
interface CustomisedCardPreviewProps {
  template: TemplateCard;
  photoUrl: string | null;
  greeting: string;
  tone?: string;
  context?: string;
  className?: string;
}

export default function CustomisedCardPreview({
  template,
  photoUrl,
  greeting,
  tone,
  context,
  className,
}: CustomisedCardPreviewProps) {
  const templateConfig = getCardTemplateConfig(template);
  const userContent = {
    headline: greeting,
    subheading: tone,
    body: context,
    photoUrl,
  };

  return (
    <CardTemplateRenderer
      template={templateConfig}
      userContent={userContent}
      className={className}
    />
  );
}
