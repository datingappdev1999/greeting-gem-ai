import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Redo2, Undo2, X, Image as ImageIcon, Type, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CardTemplate, UserCardContent } from "@/types/cardTemplate";
import { createDefaultUserContent } from "@/types/cardTemplate";
import { useCardEditor } from "@/hooks/useCardEditor";
import CardArtboard from "@/components/CardArtboard";
import CardControlsPanel from "@/components/CardControlsPanel";

type SidebarPanel = "photo" | "text" | "style" | null;

export interface ModernTemplateEditorProps {
  occasionName: string;
  backToUrl: string;
  template: CardTemplate;
  initialContent?: Partial<UserCardContent>;
}

type HistorySnapshot = {
  userContent: UserCardContent;
  imageTransforms: ReturnType<typeof useCardEditor>["imageTransforms"];
  selectedElementId: string | null;
};

function findFirstElementId(template: CardTemplate, type: "imageFrame" | "headline" | "body" | "subheading" | "background") {
  return template.elements.find((el) => el.type === type)?.id ?? null;
}

export default function ModernTemplateEditor({
  occasionName,
  backToUrl,
  template,
  initialContent,
}: ModernTemplateEditorProps) {
  const editor = useCardEditor(template, {
    initialHeadline: initialContent?.headline ?? `Happy ${occasionName}!`,
    initialBody: initialContent?.body ?? "",
  });

  // Ensure we respect provided initial content (subheading etc) once at mount.
  useEffect(() => {
    if (!initialContent) return;
    editor.updateUserContent({
      ...initialContent,
      headline: initialContent.headline ?? editor.userContent.headline,
      photoUrl: initialContent.photoUrl ?? editor.userContent.photoUrl,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activePanel, setActivePanel] = useState<SidebarPanel>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [history, setHistory] = useState<HistorySnapshot[]>(() => [
    {
      userContent: createDefaultUserContent(
        initialContent?.headline ?? `Happy ${occasionName}!`,
        initialContent?.subheading,
        initialContent?.body
      ),
      imageTransforms: editor.imageTransforms,
      selectedElementId: null,
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const applyingHistoryRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const currentSnapshot = useMemo(
    () => history[historyIndex] ?? null,
    [history, historyIndex]
  );

  // Keep editor state in sync when applying undo/redo.
  useEffect(() => {
    if (!currentSnapshot) return;
    if (!applyingHistoryRef.current) return;
    editor.updateUserContent(currentSnapshot.userContent);
    editor.setSelectedElementId(currentSnapshot.selectedElementId);
    // imageTransforms isn't exposed as a setter in the hook; update via patching each key.
    Object.entries(currentSnapshot.imageTransforms).forEach(([id, t]) => {
      editor.updateImageTransform(id, t);
    });
    applyingHistoryRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSnapshot]);

  const scheduleSaveHistory = () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      // Avoid saving during undo/redo application.
      if (applyingHistoryRef.current) return;

      const snap: HistorySnapshot = {
        userContent: editor.userContent,
        imageTransforms: editor.imageTransforms,
        selectedElementId: editor.selectedElementId,
      };

      setHistory((prev) => {
        const base = prev.slice(0, historyIndex + 1);
        const last = base[base.length - 1];
        // Cheap equality: if nothing meaningful changed, skip.
        if (
          last &&
          JSON.stringify(last.userContent) === JSON.stringify(snap.userContent) &&
          JSON.stringify(last.imageTransforms) === JSON.stringify(snap.imageTransforms) &&
          last.selectedElementId === snap.selectedElementId
        ) {
          return prev;
        }
        return [...base, snap];
      });
      setHistoryIndex((i) => {
        // If history grew, the new snapshot will be at the end.
        return Math.min(i + 1, history.length);
      });
    }, 350);
  };

  useEffect(() => {
    scheduleSaveHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.userContent, editor.imageTransforms, editor.selectedElementId]);

  const handleUndo = () => {
    if (!canUndo) return;
    applyingHistoryRef.current = true;
    setHistoryIndex((i) => Math.max(0, i - 1));
  };

  const handleRedo = () => {
    if (!canRedo) return;
    applyingHistoryRef.current = true;
    setHistoryIndex((i) => Math.min(history.length - 1, i + 1));
  };

  const togglePanel = (panel: SidebarPanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
    if (panel === "photo") {
      editor.setSelectedElementId(findFirstElementId(template, "imageFrame"));
    } else if (panel === "text") {
      editor.setSelectedElementId(
        findFirstElementId(template, "headline") ??
          findFirstElementId(template, "body") ??
          findFirstElementId(template, "subheading")
      );
    } else if (panel === "style") {
      editor.setSelectedElementId(findFirstElementId(template, "background"));
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-lg">
            <Link to={backToUrl}>← Exit</Link>
          </Button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <h1 className="font-display text-sm font-semibold text-foreground">
            Edit Your Design
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-lg"
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo"
            >
              <Undo2 className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-lg"
              onClick={handleRedo}
              disabled={!canRedo}
              title="Redo"
            >
              <Redo2 className="h-5 w-5" />
            </Button>
          </div>
          <Button type="button" className="rounded-lg" onClick={() => setPreviewOpen(true)}>
            Preview
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <nav className="flex w-20 shrink-0 flex-col items-center gap-1 border-r border-border bg-card py-3">
          <button
            type="button"
            onClick={() => togglePanel("photo")}
            className={cn(
              "flex w-[68px] flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-medium transition",
              activePanel === "photo"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title="Photo"
          >
            <ImageIcon className="h-5 w-5" />
            Photo
          </button>
          <button
            type="button"
            onClick={() => togglePanel("text")}
            className={cn(
              "flex w-[68px] flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-medium transition",
              activePanel === "text"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title="Text"
          >
            <Type className="h-5 w-5" />
            Text
          </button>
          <button
            type="button"
            onClick={() => togglePanel("style")}
            className={cn(
              "flex w-[68px] flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-medium transition",
              activePanel === "style"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title="Style"
          >
            <Palette className="h-5 w-5" />
            Style
          </button>
        </nav>

        <aside
          className={cn(
            "w-[280px] shrink-0 overflow-y-auto border-r border-border bg-card p-4",
            activePanel ? "block" : "hidden"
          )}
        >
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            {activePanel === "photo" ? "Photo" : activePanel === "text" ? "Text" : "Card Style"}
          </h2>
          {activePanel === "style" ? (
            <p className="text-sm text-muted-foreground">
              Style controls are coming next. For now, select the photo or text to edit content.
            </p>
          ) : (
            <CardControlsPanel
              template={template}
              selectedElementId={editor.selectedElementId}
              userContent={editor.userContent}
              onChangeUserContent={editor.updateUserContent}
              imageTransforms={editor.imageTransforms}
              onChangeImageTransform={editor.updateImageTransform}
              onChangePhoto={editor.setPhotoUrl}
            />
          )}
        </aside>

        <main className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-muted/40 p-8">
          <div className="w-full max-w-[520px]">
            <CardArtboard
              template={template}
              userContent={editor.userContent}
              imageTransforms={editor.imageTransforms}
              selectedElementId={editor.selectedElementId}
              onSelectElement={(id) => {
                editor.setSelectedElementId(id);
                // Open the right panel when selecting directly on the artboard.
                const el = template.elements.find((e) => e.id === id);
                if (el?.type === "imageFrame") setActivePanel("photo");
                else if (el?.type === "headline" || el?.type === "subheading" || el?.type === "body")
                  setActivePanel("text");
              }}
              className="mx-auto"
            />
          </div>
        </main>
      </div>

      {previewOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 rounded-lg"
              onClick={() => setPreviewOpen(false)}
              title="Close"
            >
              <X className="h-5 w-5" />
            </Button>
            <h3 className="font-display text-lg text-foreground">Looking good!</h3>
            <p className="mt-1 text-sm text-muted-foreground">Here’s how your card will look.</p>
            <div className="mt-5 flex justify-center">
              <div className="w-[280px]">
                <CardArtboard
                  template={template}
                  userContent={editor.userContent}
                  imageTransforms={editor.imageTransforms}
                  selectedElementId={null}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setPreviewOpen(false)}>
                Keep editing
              </Button>
              <Button type="button" disabled>
                Add to Basket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

