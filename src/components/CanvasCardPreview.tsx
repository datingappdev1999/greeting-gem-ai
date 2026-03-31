import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { CardPage } from "@/data/cardTemplates";
import {
  composeCardOnCanvas,
  loadBackgroundForPage,
  loadImage,
  triggerPngDownload,
} from "@/lib/canvasCardCompose";
import { cn } from "@/lib/utils";

export type CanvasCardPreviewHandle = {
  downloadPng: (filename?: string) => void;
};

export interface CanvasCardPreviewProps {
  page: CardPage;
  textBySlotId: Record<string, string>;
  photoUrlBySlotId: Record<string, string | null>;
  className?: string;
}

/**
 * Full-resolution canvas for one template page: background, cover-cropped photos, auto-fit text.
 */
export const CanvasCardPreview = forwardRef<CanvasCardPreviewHandle, CanvasCardPreviewProps>(
  function CanvasCardPreview({ page, textBySlotId, photoUrlBySlotId, className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bgRef = useRef<CanvasImageSource | null>(null);
    const photoImagesRef = useRef<Record<string, HTMLImageElement | null>>({});
    const [bgReady, setBgReady] = useState(false);
    const [photoEpoch, setPhotoEpoch] = useState(0);

    const photoLoadKey = page.photoSlots.map((s) => photoUrlBySlotId[s.id] ?? "").join("\0");

    useImperativeHandle(ref, () => ({
      downloadPng(filename = "card.png") {
        const c = canvasRef.current;
        if (!c?.width) return;
        triggerPngDownload(c.toDataURL("image/png"), filename);
      },
    }));

    useEffect(() => {
      let cancelled = false;
      setBgReady(false);
      bgRef.current = null;
      loadBackgroundForPage(page)
        .then((src) => {
          if (cancelled) return;
          bgRef.current = src;
          setBgReady(true);
        })
        .catch(() => {
          if (!cancelled) setBgReady(false);
        });
      return () => {
        cancelled = true;
      };
    }, [page]);

    useEffect(() => {
      let cancelled = false;
      photoImagesRef.current = {};
      const slots = page.photoSlots;
      if (slots.length === 0) {
        setPhotoEpoch((e) => e + 1);
        return;
      }

      let pending = slots.length;
      const checkDone = () => {
        pending -= 1;
        if (pending <= 0 && !cancelled) setPhotoEpoch((e) => e + 1);
      };

      for (const slot of slots) {
        const url = photoUrlBySlotId[slot.id] ?? null;
        if (!url) {
          photoImagesRef.current[slot.id] = null;
          checkDone();
          continue;
        }
        loadImage(url)
          .then((img) => {
            if (!cancelled) photoImagesRef.current[slot.id] = img;
          })
          .catch(() => {
            if (!cancelled) photoImagesRef.current[slot.id] = null;
          })
          .finally(() => {
            checkDone();
          });
      }

      return () => {
        cancelled = true;
      };
    }, [page, photoLoadKey, photoUrlBySlotId]);

    useLayoutEffect(() => {
      const canvas = canvasRef.current;
      const bg = bgRef.current;
      if (!canvas || !bgReady || !bg) return;

      const photoBySlotId: Record<string, HTMLImageElement | null> = {};
      for (const slot of page.photoSlots) {
        photoBySlotId[slot.id] = photoImagesRef.current[slot.id] ?? null;
      }

      composeCardOnCanvas(canvas, bg, {
        page,
        textBySlotId,
        photoBySlotId,
      });
    }, [page, textBySlotId, photoUrlBySlotId, bgReady, photoEpoch]);

    return (
      <canvas
        ref={canvasRef}
        className={cn("w-full h-auto block rounded-2xl bg-muted", className)}
        style={{ aspectRatio: page.aspectRatio }}
        aria-label={`Card preview: ${page.label}`}
      />
    );
  }
);

export default CanvasCardPreview;
