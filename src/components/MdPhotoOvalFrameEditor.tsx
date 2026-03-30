import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Redo2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarPanel = "photo" | "text" | null;

type TextAlign = "left" | "center" | "right";
type TextBox = {
  id: string;
  text: string;
  x: number; // px within 400x560
  y: number; // px within 400x560
  width: number; // px
  fontFamily: string;
  fontSize: number; // px
  color: string; // hex
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline";
  textAlign: TextAlign;
};

type Snapshot = {
  photoDataUrl: string | null;
  boxes: TextBox[];
  selectedId: string | null;
};

const CARD_W = 400;
const CARD_H = 560;

const PHOTO_ZONE = { left: 88, top: 45, width: 224, height: 325 };
const BG_IMAGE_URL = "/templates/md-photo-oval-frame.png";

const TEXT_COLOR_PRESETS = [
  "#111827",
  "#B8860B",
  "#7B3F6E",
  "#ffffff",
  "#ef4444",
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#6b7280",
  "#ec4899",
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2, 10)}`;
}

function isValidHexColor(v: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(v);
}

export interface MdPhotoOvalFrameEditorProps {
  backToUrl: string;
}

export default function MdPhotoOvalFrameEditor({ backToUrl }: MdPhotoOvalFrameEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const [activePanel, setActivePanel] = useState<SidebarPanel>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const initialBoxes: TextBox[] = useMemo(
    () => [
      {
        id: "text-1",
        text: "Happy Mother's Day",
        x: 20,
        y: 420,
        width: 360,
        fontFamily: "'Dancing Script', cursive",
        fontSize: 20,
        color: "#b08a2b",
        fontWeight: "bold",
        fontStyle: "normal",
        textDecoration: "none",
        textAlign: "center",
      },
      {
        id: "text-2",
        text: "To the most wonderful Mom",
        x: 20,
        y: 492,
        width: 360,
        fontFamily: "'Dancing Script', cursive",
        fontSize: 20,
        color: "#7B3F6E",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        textAlign: "center",
      },
      {
        id: "text-3",
        text: "",
        x: 20,
        y: 528,
        width: 360,
        fontFamily: "'Dancing Script', cursive",
        fontSize: 20,
        color: "#7B3F6E",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        textAlign: "center",
      },
    ],
    []
  );

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<TextBox[]>(initialBoxes);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedBox = useMemo(
    () => boxes.find((b) => b.id === selectedId) ?? null,
    [boxes, selectedId]
  );

  const [history, setHistory] = useState<Snapshot[]>(() => [
    { photoDataUrl: null, boxes: initialBoxes, selectedId: null },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const applyingRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const commitHistory = () => {
    if (applyingRef.current) return;
    const snap: Snapshot = {
      photoDataUrl,
      boxes,
      selectedId,
    };
    setHistory((prev) => {
      const base = prev.slice(0, historyIndex + 1);
      const last = base[base.length - 1];
      if (
        last &&
        JSON.stringify(last.boxes) === JSON.stringify(snap.boxes) &&
        last.photoDataUrl === snap.photoDataUrl &&
        last.selectedId === snap.selectedId
      ) {
        return prev;
      }
      return [...base, snap];
    });
    setHistoryIndex((i) => i + 1);
  };

  const scheduleCommit = (delayMs: number) => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => commitHistory(), delayMs);
  };

  useEffect(() => {
    scheduleCommit(350);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoDataUrl, boxes, selectedId]);

  const applySnapshot = (snap: Snapshot) => {
    applyingRef.current = true;
    setPhotoDataUrl(snap.photoDataUrl);
    setBoxes(snap.boxes);
    setSelectedId(snap.selectedId);
    window.setTimeout(() => {
      applyingRef.current = false;
    }, 0);
  };

  const undo = () => {
    if (!canUndo) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    applySnapshot(history[nextIndex]);
  };

  const redo = () => {
    if (!canRedo) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    applySnapshot(history[nextIndex]);
  };

  // Dragging / resizing
  const dragState = useRef<
    | null
    | { kind: "drag"; id: string; offsetX: number; offsetY: number }
    | { kind: "resize"; id: string; startX: number; startW: number }
  >(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragState.current) return;
      const el = canvasRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();

      if (dragState.current.kind === "drag") {
        const { id, offsetX, offsetY } = dragState.current;
        const x = e.clientX - rect.left - offsetX;
        const y = e.clientY - rect.top - offsetY;
        setBoxes((prev) =>
          prev.map((b) => {
            if (b.id !== id) return b;
            // No boundaries: allow dragging anywhere.
            return { ...b, x, y };
          })
        );
      }

      if (dragState.current.kind === "resize") {
        const { id, startX, startW } = dragState.current;
        const delta = e.clientX - startX;
        const newW = clamp(startW + delta, 80, CARD_W - 10);
        setBoxes((prev) => prev.map((b) => (b.id === id ? { ...b, width: newW } : b)));
      }
    };
    const onUp = () => {
      if (!dragState.current) return;
      dragState.current = null;
      commitHistory();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyIndex, history]);

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-text-box]") || target.closest("[data-photo-zone]")) return;
    setSelectedId(null);
  };

  const addNewTextBox = () => {
    const id = newId("text");
    const box: TextBox = {
      id,
      text: "Your text here",
      x: CARD_W * 0.15,
      y: CARD_H * 0.5,
      width: CARD_W * 0.7,
      fontFamily: "Georgia, serif",
      fontSize: 20,
      color: "#111827",
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      textAlign: "center",
    };
    setBoxes((prev) => [...prev, box]);
    setSelectedId(id);
    setActivePanel("text");
  };

  const deleteSelectedText = () => {
    if (!selectedId) return;
    if (selectedId === "text-1" || selectedId === "text-2" || selectedId === "text-3") return;
    setBoxes((prev) => prev.filter((b) => b.id !== selectedId));
    setSelectedId(null);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-lg">
            <Link to={backToUrl}>← Exit</Link>
          </Button>
        </div>

        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
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
              onClick={undo}
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
              onClick={redo}
              disabled={!canRedo}
              title="Redo"
            >
              <Redo2 className="h-5 w-5" />
            </Button>
          </div>
          <button
            type="button"
            className="rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="flex w-20 shrink-0 flex-col items-center gap-1 border-r border-border bg-card py-3">
          <button
            type="button"
            className={cn(
              "flex w-[68px] flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-medium transition",
              activePanel === "photo"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={() => setActivePanel((p) => (p === "photo" ? null : "photo"))}
            title="Photo"
          >
            <span className="text-lg">📷</span>
            Photo
          </button>
          <button
            type="button"
            className={cn(
              "flex w-[68px] flex-col items-center gap-1 rounded-xl px-2 py-3 text-[11px] font-medium transition",
              activePanel === "text"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={() => setActivePanel((p) => (p === "text" ? null : "text"))}
            title="Text"
          >
            <span className="text-lg">✏️</span>
            Text
          </button>
        </nav>

        {/* Options Panel */}
        <aside
          className={cn(
            "w-[280px] shrink-0 overflow-y-auto border-r border-border bg-card p-4",
            activePanel ? "block" : "hidden"
          )}
        >
          {activePanel === "photo" && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">📷 Photo</p>
              <label
                className="block cursor-pointer rounded-xl border-2 border-dashed border-border bg-muted/20 px-4 py-6 text-center transition hover:border-primary/50 hover:bg-muted/40"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handlePhotoUpload(file);
                    if (e.target) e.target.value = "";
                  }}
                />
                <div className="text-muted-foreground mb-2">⬆︎</div>
                <div className="text-sm font-medium text-muted-foreground">
                  Click to upload photo
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WEBP — max 10MB
                </div>
              </label>
              {photoDataUrl && (
                <button
                  type="button"
                  className="mt-3 w-full rounded-lg border border-red-200 bg-background px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                  onClick={() => setPhotoDataUrl(null)}
                >
                  🗑 Remove Photo
                </button>
              )}
            </div>
          )}

          {activePanel === "text" && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-4">✏️ Text</p>
              <button
                type="button"
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:bg-muted/30 transition"
                onClick={addNewTextBox}
              >
                <span className="text-base">＋</span>
                Add Text Box
              </button>

              {selectedBox ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                        X (px)
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={Math.round(selectedBox.x)}
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setBoxes((prev) =>
                            prev.map((b) => (b.id === selectedBox.id ? { ...b, x: v } : b))
                          );
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                        Y (px)
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={Math.round(selectedBox.y)}
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setBoxes((prev) =>
                            prev.map((b) => (b.id === selectedBox.id ? { ...b, y: v } : b))
                          );
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                      Font
                    </label>
                    <select
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      value={selectedBox.fontFamily}
                      onChange={(e) =>
                        setBoxes((prev) =>
                          prev.map((b) =>
                            b.id === selectedBox.id ? { ...b, fontFamily: e.target.value } : b
                          )
                        )
                      }
                    >
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Times New Roman', serif">Times New Roman</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                      <option value="'Courier New', monospace">Courier New</option>
                      <option value="'Palatino Linotype', serif">Palatino</option>
                      <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                      Size: <span className="font-semibold">{selectedBox.fontSize}</span>px
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={72}
                      value={selectedBox.fontSize}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setBoxes((prev) =>
                          prev.map((b) => (b.id === selectedBox.id ? { ...b, fontSize: v } : b))
                        );
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                      Style
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-sm transition",
                          selectedBox.fontWeight === "bold"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary"
                        )}
                        onClick={() =>
                          setBoxes((prev) =>
                            prev.map((b) =>
                              b.id === selectedBox.id
                                ? { ...b, fontWeight: b.fontWeight === "bold" ? "normal" : "bold" }
                                : b
                            )
                          )
                        }
                      >
                        <b>B</b>
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-sm transition",
                          selectedBox.fontStyle === "italic"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary"
                        )}
                        onClick={() =>
                          setBoxes((prev) =>
                            prev.map((b) =>
                              b.id === selectedBox.id
                                ? { ...b, fontStyle: b.fontStyle === "italic" ? "normal" : "italic" }
                                : b
                            )
                          )
                        }
                      >
                        <i>I</i>
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-sm transition",
                          selectedBox.textDecoration === "underline"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary"
                        )}
                        onClick={() =>
                          setBoxes((prev) =>
                            prev.map((b) =>
                              b.id === selectedBox.id
                                ? {
                                    ...b,
                                    textDecoration:
                                      b.textDecoration === "underline" ? "none" : "underline",
                                  }
                                : b
                            )
                          )
                        }
                      >
                        <u>U</u>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                      Alignment
                    </label>
                    <div className="flex gap-2">
                      {(["left", "center", "right"] as const).map((a) => (
                        <button
                          key={a}
                          type="button"
                          className={cn(
                            "flex-1 rounded-md border px-3 py-2 text-sm transition",
                            selectedBox.textAlign === a
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground hover:border-primary"
                          )}
                          onClick={() =>
                            setBoxes((prev) =>
                              prev.map((b) =>
                                b.id === selectedBox.id ? { ...b, textAlign: a } : b
                              )
                            )
                          }
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                      Text Colour
                    </label>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {TEXT_COLOR_PRESETS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={cn(
                            "h-7 w-7 rounded-full border-2 transition",
                            selectedBox.color.toLowerCase() === c.toLowerCase()
                              ? "border-primary"
                              : "border-transparent"
                          )}
                          style={{
                            background: c,
                            borderColor: c === "#ffffff" ? "#e5e7eb" : undefined,
                          }}
                          onClick={() =>
                            setBoxes((prev) =>
                              prev.map((b) => (b.id === selectedBox.id ? { ...b, color: c } : b))
                            )
                          }
                          title={c}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-9 w-9 cursor-pointer rounded-lg border border-border bg-transparent p-0"
                        value={isValidHexColor(selectedBox.color) ? selectedBox.color : "#111827"}
                        onChange={(e) =>
                          setBoxes((prev) =>
                            prev.map((b) =>
                              b.id === selectedBox.id ? { ...b, color: e.target.value } : b
                            )
                          )
                        }
                        title="Custom colour"
                      />
                      <input
                        type="text"
                        value={selectedBox.color}
                        maxLength={7}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        onChange={(e) => {
                          const v = e.target.value;
                          setBoxes((prev) =>
                            prev.map((b) => (b.id === selectedBox.id ? { ...b, color: v } : b))
                          );
                        }}
                        onBlur={() => {
                          if (!selectedBox) return;
                          if (!isValidHexColor(selectedBox.color)) {
                            setBoxes((prev) =>
                              prev.map((b) =>
                                b.id === selectedBox.id ? { ...b, color: "#111827" } : b
                              )
                            );
                          }
                        }}
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full rounded-lg border border-red-200 bg-background px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                    onClick={deleteSelectedText}
                    disabled={selectedId === "text-1" || selectedId === "text-2" || selectedId === "text-3"}
                    title={
                      selectedId === "text-1" || selectedId === "text-2" || selectedId === "text-3"
                        ? "Default text boxes can't be deleted"
                        : "Delete text box"
                    }
                  >
                    Delete Text Box
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a text box on the card to edit it.
                </p>
              )}
            </div>
          )}
        </aside>

        {/* Canvas */}
        <main className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#e8e8e8] p-10">
          <div
            ref={canvasRef}
            onClick={onCanvasClick}
            className="relative shrink-0 overflow-visible rounded-[3px] shadow-[0_20px_60px_rgba(0,0,0,0.22)]"
            style={{ width: CARD_W, height: CARD_H }}
          >
            <img
              src={BG_IMAGE_URL}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-cover"
            />

            {/* Photo zone */}
            <div
              data-photo-zone
              className="absolute z-[2] overflow-hidden rounded-full"
              style={{
                left: PHOTO_ZONE.left,
                top: PHOTO_ZONE.top,
                width: PHOTO_ZONE.width,
                height: PHOTO_ZONE.height,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setActivePanel("photo");
                if (!photoDataUrl) fileInputRef.current?.click();
              }}
              title="Click to change photo"
            >
              {photoDataUrl ? (
                <img src={photoDataUrl} alt="Your photo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-white/25 px-4 text-center">
                  <div className="text-sm text-[#78503c]/50">Tap to add your photo</div>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition hover:bg-black/35 hover:opacity-100">
                <span className="text-center text-sm font-semibold text-white">
                  ✎ Change
                  <br />
                  Photo
                </span>
              </div>
            </div>

            {/* Text boxes */}
            {boxes.map((b) => {
              const isSelected = selectedId === b.id;
              return (
                <div
                  key={b.id}
                  data-text-box
                  className={cn(
                    "absolute z-[3] min-h-6 rounded-md border-2 px-1.5 py-1 leading-[1.4] transition",
                    isSelected ? "border-primary" : "border-transparent hover:border-primary/40"
                  )}
                  style={{
                    left: b.x,
                    top: b.y,
                    width: b.width,
                    fontFamily: b.fontFamily,
                    fontSize: b.fontSize,
                    color: b.color,
                    fontWeight: b.fontWeight,
                    fontStyle: b.fontStyle,
                    textDecoration: b.textDecoration,
                    textAlign: b.textAlign,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    cursor: "text",
                    userSelect: "text",
                  }}
                  onMouseDown={(e) => {
                    // drag on background; but keep text selection normal
                    if ((e.target as HTMLElement).closest("[data-resize-handle]")) return;
                    if ((e.target as HTMLElement).closest("[data-drag-handle]")) return;
                    if ((e.target as HTMLElement).isContentEditable) return;
                    e.stopPropagation();
                    setSelectedId(b.id);
                    setActivePanel("text");
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    dragState.current = {
                      kind: "drag",
                      id: b.id,
                      offsetX: e.clientX - rect.left - b.x,
                      offsetY: e.clientY - rect.top - b.y,
                    };
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(b.id);
                    setActivePanel("text");
                  }}
                  contentEditable={isSelected}
                  suppressContentEditableWarning
                  onInput={(e) => {
                    const text = (e.currentTarget.textContent ?? "").replace(/\u00A0/g, " ");
                    setBoxes((prev) => prev.map((x) => (x.id === b.id ? { ...x, text } : x)));
                    scheduleCommit(800);
                  }}
                >
                  {b.text}
                  {isSelected && (
                    <button
                      type="button"
                      data-drag-handle
                      className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 cursor-grab rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm active:cursor-grabbing"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const rect = canvasRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        dragState.current = {
                          kind: "drag",
                          id: b.id,
                          offsetX: e.clientX - rect.left - b.x,
                          offsetY: e.clientY - rect.top - b.y,
                        };
                      }}
                      title="Drag to move"
                      aria-label="Drag to move"
                    >
                      Drag
                    </button>
                  )}
                  {isSelected && (
                    <button
                      type="button"
                      data-resize-handle
                      className="absolute -bottom-1.5 -right-1.5 z-10 h-3.5 w-3.5 cursor-se-resize rounded-full bg-primary ring-2 ring-background"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        dragState.current = {
                          kind: "resize",
                          id: b.id,
                          startX: e.clientX,
                          startW: b.width,
                        };
                      }}
                      aria-label="Resize"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Preview modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-6"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPreviewOpen(false);
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-card p-8 shadow-xl text-center">
            <button
              type="button"
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              onClick={() => setPreviewOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="text-xl font-bold text-foreground">Looking good!</div>
            <div className="mt-1 text-sm text-muted-foreground">Here’s a preview of your card</div>
            <div className="mt-5 flex justify-center">
              <div
                className="overflow-visible rounded-[3px] shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
                style={{ width: CARD_W * 0.65, height: CARD_H * 0.65 }}
              >
                <div
                  className="origin-top-left"
                  style={{ transform: "scale(0.65)", width: CARD_W, height: CARD_H }}
                >
                  <div
                    className="relative overflow-visible"
                    style={{ width: CARD_W, height: CARD_H, borderRadius: 3 }}
                  >
                    <img
                      src={BG_IMAGE_URL}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      draggable={false}
                    />
                    <div
                      className="absolute overflow-hidden rounded-full"
                      style={{
                        left: PHOTO_ZONE.left,
                        top: PHOTO_ZONE.top,
                        width: PHOTO_ZONE.width,
                        height: PHOTO_ZONE.height,
                      }}
                    >
                      {photoDataUrl ? (
                        <img src={photoDataUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    {boxes.map((b) => (
                      <div
                        key={`preview-${b.id}`}
                        className="absolute px-1.5 py-1 leading-[1.4]"
                        style={{
                          left: b.x,
                          top: b.y,
                          width: b.width,
                          fontFamily: b.fontFamily,
                          fontSize: b.fontSize,
                          color: b.color,
                          fontWeight: b.fontWeight,
                          fontStyle: b.fontStyle,
                          textDecoration: b.textDecoration,
                          textAlign: b.textAlign,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {b.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition"
                onClick={() => setPreviewOpen(false)}
              >
                Keep Editing
              </button>
              <button
                type="button"
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background opacity-60"
                disabled
              >
                Add to Basket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

