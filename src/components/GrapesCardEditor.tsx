import { useEffect, useRef } from "react";
import grapesjs from "grapesjs";
import type { Component, Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";

import type { CardPage } from "@/data/cardTemplates";
import { buildGrapesCardPageMarkup } from "@/lib/cardEditor/grapesMarkup";
import { cn } from "@/lib/utils";

export interface GrapesCardEditorProps {
  page: CardPage;
  textBySlotId: Record<string, string>;
  photoUrlBySlotId: Record<string, string | null>;
  onTextChange: (slotId: string, value: string) => void;
  onPhotoUrlChange?: (slotId: string, url: string | null) => void;
  className?: string;
}

function debounce<T extends (...args: never[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function walkComponents(c: Component, fn: (x: Component) => void): void {
  fn(c);
  const kids = c.components();
  if (!kids) return;
  kids.forEach((ch) => walkComponents(ch, fn));
}

function getTextSlotEl(root: Document | null, slotId: string): HTMLElement | null {
  if (!root) return null;
  return root.querySelector(`[data-text-slot="${CSS.escape(slotId)}"]`);
}

function setPhotoSlotDom(
  root: Document | null,
  page: CardPage,
  slotId: string,
  url: string | null
): void {
  if (!root) return;
  const slot = page.photoSlots.find((p) => p.id === slotId);
  if (!slot) return;
  const wrap = root.querySelector(`[data-photo-slot="${CSS.escape(slotId)}"]`);
  if (!wrap) return;

  if (url) {
    wrap.classList.remove("card-photo-slot--empty");
    wrap.innerHTML = `<img src="" alt="" />`;
    const img = wrap.querySelector("img");
    if (img) img.src = url;
  } else {
    wrap.classList.add("card-photo-slot--empty");
    wrap.innerHTML =
      '<span class="card-photo-placeholder">Photo — use the panel to upload</span>';
  }
}

/**
 * GrapesJS canvas for one {@link CardPage}: click text to edit; layout is fixed to match export.
 * State is synced with React (canvas preview + sidebar) via callbacks.
 */
export default function GrapesCardEditor({
  page,
  textBySlotId,
  photoUrlBySlotId,
  onTextChange,
  onPhotoUrlChange,
  className,
}: GrapesCardEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const skipExtractRef = useRef(false);

  const propsRef = useRef({
    page,
    textBySlotId,
    photoUrlBySlotId,
    onTextChange,
    onPhotoUrlChange,
  });
  propsRef.current = {
    page,
    textBySlotId,
    photoUrlBySlotId,
    onTextChange,
    onPhotoUrlChange,
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const { page: p, textBySlotId: text, photoUrlBySlotId: photos } = propsRef.current;
    const { html, css } = buildGrapesCardPageMarkup(p, text, photos);

    const editor = grapesjs.init({
      container: el,
      height: "100%",
      width: "100%",
      fromElement: false,
      storageManager: false,
      showDevices: false,
      noticeOnUnload: false,
      blockManager: { custom: true },
      components: html,
      style: css,
      // Plain text only — matches canvas export (fitTextToBox uses plain strings).
      richTextEditor: {
        actions: [],
      },
    });

    editorRef.current = editor;

    const lock = () => {
      walkComponents(editor.getWrapper(), (c) => {
        c.set({
          draggable: false,
          droppable: false,
          removable: false,
          copyable: false,
          highlightable: true,
          hoverable: true,
        });
      });
    };

    const extract = () => {
      if (skipExtractRef.current) return;
      const ed = editorRef.current;
      if (!ed) return;
      const { page: pg, textBySlotId: txt, photoUrlBySlotId: ph, onTextChange: onT, onPhotoUrlChange: onP } =
        propsRef.current;
      const frame = ed.Canvas.getFrameEl();
      const doc = frame?.contentDocument ?? null;

      for (const slot of pg.textSlots) {
        const el = getTextSlotEl(doc, slot.id);
        if (!el) continue;
        const next = el.innerText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        const prev = txt[slot.id] ?? slot.defaultText;
        if (next !== prev) onT(slot.id, next);
      }

      for (const slot of pg.photoSlots) {
        const wrap = doc?.querySelector(`[data-photo-slot="${CSS.escape(slot.id)}"]`);
        const img = wrap?.querySelector("img");
        const src = img?.getAttribute("src") ?? "";
        const normalized = src && src.length > 0 ? src : null;
        const prev = ph[slot.id] ?? null;
        if (normalized !== prev && onP) onP(slot.id, normalized);
      }
    };

    const debouncedExtract = debounce(extract, 120);
    editor.on("load", lock);
    editor.on("update", debouncedExtract);
    editor.on("component:update", debouncedExtract);

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [page.id]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    skipExtractRef.current = true;
    const frame = editor.Canvas.getFrameEl();
    const doc = frame?.contentDocument ?? null;

    for (const slot of page.textSlots) {
      const el = getTextSlotEl(doc, slot.id);
      if (!el) continue;
      const next = textBySlotId[slot.id] ?? slot.defaultText;
      if (el.innerText !== next) {
        el.textContent = next;
      }
    }

    for (const slot of page.photoSlots) {
      const url = photoUrlBySlotId[slot.id] ?? null;
      setPhotoSlotDom(doc, page, slot.id, url);
    }

    requestAnimationFrame(() => {
      skipExtractRef.current = false;
    });
  }, [page, textBySlotId, photoUrlBySlotId]);

  return (
    <div
      ref={containerRef}
      className={cn("gjs-card-editor-root h-full min-h-[320px] w-full", className)}
    />
  );
}
