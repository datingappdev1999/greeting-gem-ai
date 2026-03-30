import CardArtboard from "@/components/CardArtboard";
import CardControlsPanel from "@/components/CardControlsPanel";
import { fathersDayClassicTemplate } from "@/templates/fathersDayClassic";
import { useCardEditor } from "@/hooks/useCardEditor";

export function FathersDayClassicEditor() {
  const {
    selectedElementId,
    setSelectedElementId,
    userContent,
    updateUserContent,
    imageTransforms,
    updateImageTransform,
    setPhotoUrl,
  } = useCardEditor(fathersDayClassicTemplate, {
    initialHeadline: "Happy Father's Day!",
    initialBody: "Thanks for all the little and big things you do.",
  });

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)] items-start">
      <div className="flex items-center justify-center">
        <CardArtboard
          template={fathersDayClassicTemplate}
          userContent={userContent}
          imageTransforms={imageTransforms}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
        />
      </div>
      <div className="rounded-xl border border-border bg-card p-4 md:p-5 shadow-card">
        <CardControlsPanel
          template={fathersDayClassicTemplate}
          selectedElementId={selectedElementId}
          userContent={userContent}
          onChangeUserContent={updateUserContent}
          imageTransforms={imageTransforms}
          onChangeImageTransform={updateImageTransform}
          onChangePhoto={setPhotoUrl}
        />
      </div>
    </div>
  );
}

export default FathersDayClassicEditor;

