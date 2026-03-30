import type { CardTemplate, CardElementUnion } from "@/types/cardTemplate";
import type { ImageTransformMap } from "@/hooks/useCardEditor";
import type { UserCardContent } from "@/types/cardTemplate";
import { Textarea } from "@/components/ui/textarea";
import ImageSlotEditor from "@/components/ImageSlotEditor";

interface CardControlsPanelProps {
  template: CardTemplate;
  selectedElementId: string | null;
  userContent: UserCardContent;
  onChangeUserContent: (patch: Partial<UserCardContent>) => void;
  imageTransforms: ImageTransformMap;
  onChangeImageTransform: (elementId: string, patch: Partial<ImageTransformMap[string]>) => void;
  onChangePhoto: (url: string | null) => void;
}

export function CardControlsPanel({
  template,
  selectedElementId,
  userContent,
  onChangeUserContent,
  imageTransforms,
  onChangeImageTransform,
  onChangePhoto,
}: CardControlsPanelProps) {
  const selected: CardElementUnion | undefined = template.elements.find(
    (el) => el.id === selectedElementId
  );

  if (!selected) {
    return (
      <div className="text-sm text-muted-foreground">
        Select text or the photo area on the card to start editing.
      </div>
    );
  }

  if (selected.type === "headline" || selected.type === "body" || selected.type === "subheading") {
    const key = selected.defaultTextKey;
    const value =
      key === "headline"
        ? userContent.headline
        : key === "body"
        ? userContent.body ?? ""
        : userContent.subheading ?? "";

    const label =
      key === "headline" ? "Headline" : key === "body" ? "Message" : "Subheading";

    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Editing text slot
        </p>
        <label
          htmlFor={`editor-${key}`}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
        <Textarea
          id={`editor-${key}`}
          rows={key === "headline" ? 3 : 4}
          value={value}
          onChange={(e) => {
            const text = e.target.value;
            if (key === "headline") onChangeUserContent({ headline: text });
            else if (key === "body") onChangeUserContent({ body: text });
            else onChangeUserContent({ subheading: text });
          }}
          className="resize-none rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground">
          This text is positioned inside the template and updates the card in real time.
        </p>
      </div>
    );
  }

  if (selected.type === "imageFrame") {
    const transform = imageTransforms[selected.id] ?? {
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    };
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Editing photo slot
        </p>
        <ImageSlotEditor
          imageUrl={userContent.photoUrl}
          transform={transform}
          onChangeImage={onChangePhoto}
          onChangeTransform={(patch) => onChangeImageTransform(selected.id, patch)}
        />
      </div>
    );
  }

  return (
    <div className="text-sm text-muted-foreground">
      This layer is decorative and locked in the template.
    </div>
  );
}

export default CardControlsPanel;

