import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CardTemplateRenderer from "@/components/CardTemplateRenderer";
import CardInsideRightPreview from "@/components/CardInsideRightPreview";
import CardInsideLeftPreview from "@/components/CardInsideLeftPreview";
import CardBackPreview from "@/components/CardBackPreview";
import { OCCASIONS, type TemplateCard } from "@/lib/occasionsData";
import { getCardTemplateConfig } from "@/templates";
import type { CardUserContent } from "@/types/cardTemplate";

declare global {
  interface Window {
    __GG_PRINT_READY?: boolean;
  }
}

type PdfJobPayload = {
  templateId: string;
  template?: TemplateCard;
  userContent: CardUserContent;
};

function findTemplateCard(templateId: string) {
  for (const occ of OCCASIONS) {
    const found = occ.templates.find((t) => t.id === templateId);
    if (found) return found;
  }
  return null;
}

export default function PrintPage() {
  const [params] = useSearchParams();
  const jobId = params.get("jobId");
  const [job, setJob] = useState<PdfJobPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!jobId) return;
    fetch(`/api/pdf-job/${encodeURIComponent(jobId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Job not found"))))
      .then((data: PdfJobPayload) => {
        if (!cancelled) setJob(data);
      })
      .catch(() => {
        if (!cancelled) setJob(null);
      });
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const templateCard = useMemo(
    () => (job ? job.template ?? findTemplateCard(job.templateId) : null),
    [job]
  );
  const templateConfig = useMemo(
    () => (templateCard ? getCardTemplateConfig(templateCard) : null),
    [templateCard]
  );
  const isSuperDad = templateCard?.id === "fd-bold-super-dad";
  const isGrillKing = templateCard?.id === "fd-grill-king";
  const isToolsAndTies = templateCard?.id === "fd-tools-and-ties";
  const isDadPhotoCollage = templateCard?.id === "fd-photo-collage";
  const isGolfEnthusiast = templateCard?.id === "fd-golf-hobby";
  const isBirthdayRibbonFlorals = templateCard?.id === "bd-text-bottom-florals";
  const isBirthdayTopConfetti = templateCard?.id === "bd-text-top-confetti";
  const isBirthdayTemplate = templateCard?.id.startsWith("bd-") ?? false;
  const isEasterPastelEggsGrid = templateCard?.id === "easter-pastel-eggs-grid";
  const isEasterBunnyPhotoFrame = templateCard?.id === "easter-bunny-photo-frame";
  const isEasterSpringFlorals = templateCard?.id === "easter-spring-florals";
  const isEasterEggHunt = templateCard?.id === "easter-egg-hunt";

  const insidePanelsBackgroundColor = isEasterEggHunt
    ? "#E6E8BD"
    : isBirthdayRibbonFlorals || isBirthdayTopConfetti
      ? "#F8F9F1"
      : isBirthdayTemplate
        ? "#FEF7E7"
        : isSuperDad
          ? "#EFEFE7"
          : isGrillKing
            ? "#F7F0D2"
            : isToolsAndTies || isDadPhotoCollage
              ? "#FBF6E9"
              : isGolfEnthusiast
                ? "#F2F8E0"
    : isEasterBunnyPhotoFrame
      ? "#E1EDED"
      : isEasterSpringFlorals
        ? "#FFFFFF"
        : undefined;

  const insideRightPrintTextStyle = useMemo(() => {
    if (isSuperDad) {
      return {
        fontFamily: "'DM Sans', sans-serif",
        color: "#092B4E",
        fontSize: "25px",
      };
    }
    if (isBirthdayRibbonFlorals || isBirthdayTopConfetti) {
      return {
        color: "#886F46",
      };
    }
    if (isBirthdayTemplate) {
      return {
        color: "#CD0317",
      };
    }
    if (isGrillKing) {
      return {
        color: "#A22B11",
      };
    }
    if (isToolsAndTies || isDadPhotoCollage) {
      return {
        color: "#2A405E",
      };
    }
    if (isGolfEnthusiast) {
      return {
        color: "#10100E",
      };
    }
    if (isEasterBunnyPhotoFrame) {
      return {
        fontFamily: "'Shadows Into Light', cursive",
        color: "#EDC602",
        fontSize: "50px",
      };
    }
    if (isEasterPastelEggsGrid) {
      return {
        fontFamily: "'Shadows Into Light', cursive",
        color: "#200548",
        fontSize: "50px",
      };
    }
    return {
      fontFamily: "'Shadows Into Light', cursive",
      color: "#5c4d6b",
      fontSize: "50px",
    };
  }, [
    isSuperDad,
    isBirthdayRibbonFlorals,
    isBirthdayTopConfetti,
    isBirthdayTemplate,
    isGrillKing,
    isToolsAndTies,
    isDadPhotoCollage,
    isGolfEnthusiast,
    isEasterBunnyPhotoFrame,
    isEasterPastelEggsGrid,
  ]);

  const insideLeftTextColor = isSuperDad
    ? "#092B4E"
    : isGrillKing
      ? "#A22B11"
      : isToolsAndTies || isDadPhotoCollage
        ? "#2A405E"
        : isGolfEnthusiast
          ? "#10100E"
          : isBirthdayRibbonFlorals || isBirthdayTopConfetti
            ? "#886F46"
            : isEasterBunnyPhotoFrame || isEasterSpringFlorals
              ? "#EDC602"
              : undefined;

  const backTextColor = isSuperDad
    ? "#092B4E"
    : isGrillKing
      ? "#A22B11"
      : isToolsAndTies || isDadPhotoCollage
        ? "#2A405E"
        : isGolfEnthusiast
          ? "#10100E"
          : isBirthdayRibbonFlorals || isBirthdayTopConfetti
            ? "#886F46"
            : undefined;

  const frontForceTextColor = isGolfEnthusiast
    ? "#10100E"
    : isBirthdayRibbonFlorals || isBirthdayTopConfetti
      ? "#886F46"
      : isToolsAndTies || isDadPhotoCollage
        ? "#2A405E"
        : undefined;

  useEffect(() => {
    let cancelled = false;
    window.__GG_PRINT_READY = false;

    if (!jobId || !templateConfig || !job) return;

    const waitForImage = (img: HTMLImageElement) =>
      new Promise<void>((resolve) => {
        if (img.complete && img.naturalWidth > 0) {
          resolve();
          return;
        }
        const done = () => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve();
        };
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });

    const waitForNextPaint = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

    const markReadyWhenAssetsLoaded = async () => {
      const images = Array.from(document.querySelectorAll("img"));
      const allImagesLoaded = Promise.all(images.map(waitForImage)).then(() => undefined);
      const fontsLoaded = document.fonts?.ready ?? Promise.resolve();
      const timeout = new Promise<void>((resolve) => {
        window.setTimeout(resolve, 12_000);
      });

      // Avoid hanging forever on a broken asset; print once assets settle or timeout hits.
      await Promise.race([Promise.all([allImagesLoaded, fontsLoaded]), timeout]);
      await waitForNextPaint();

      if (!cancelled) {
        window.__GG_PRINT_READY = true;
      }
    };

    void markReadyWhenAssetsLoaded();

    return () => {
      cancelled = true;
      window.__GG_PRINT_READY = false;
    };
  }, [jobId, templateConfig, job]);

  if (!jobId) return <div>Missing jobId</div>;
  if (!job || !templateConfig) return <div>Loading…</div>;

  const uc = job.userContent;
  // Print tuning values (in mm) for folded A5-on-A4 output.
  // These help protect against tiny fold/cut drift in real-world printing.
  const BLEED_MM = 1.5;
  const SAFE_MM = 5;
  const OUTER_GUTTER_NUDGE_MM = 0.6;
  const INNER_GUTTER_NUDGE_MM = 0.6;

  return (
    <div className="gg-print-root">
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        html, body { margin: 0; padding: 0; }
        .gg-print-root { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .gg-page {
          width: 297mm;
          height: 210mm;
          display: flex;
          page-break-after: always;
          break-after: page;
        }
        .gg-panel {
          width: 148.5mm;
          height: 210mm;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
          display: flex;
          align-items: stretch;
          justify-content: stretch;
          overflow: hidden;
          background: white;
        }
        .gg-canvas {
          width: calc(100% + ${BLEED_MM * 2}mm);
          height: calc(100% + ${BLEED_MM * 2}mm);
          margin-left: -${BLEED_MM}mm;
          margin-top: -${BLEED_MM}mm;
          display: flex;
          align-items: stretch;
          justify-content: stretch;
        }
        .gg-canvas.gutter-left {
          transform: translateX(-${OUTER_GUTTER_NUDGE_MM}mm);
        }
        .gg-canvas.gutter-right {
          transform: translateX(${OUTER_GUTTER_NUDGE_MM}mm);
        }
        .gg-canvas.inner-left {
          transform: translateX(-${INNER_GUTTER_NUDGE_MM}mm);
        }
        .gg-canvas.inner-right {
          transform: translateX(${INNER_GUTTER_NUDGE_MM}mm);
        }
        .gg-card {
          width: 100% !important;
          height: 100% !important;
          min-width: 0;
          min-height: 0;
          flex: 1;
          aspect-ratio: unset !important;
        }
        .gg-safe-guide {
          position: absolute;
          inset: ${SAFE_MM}mm;
          pointer-events: none;
          border: 0;
        }
        .gg-panel-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      `}</style>

      {/* Page 1 (outer): Back on LHS, Front on RHS */}
      <div className="gg-page">
        <div className="gg-panel">
          <div className="gg-panel-wrap">
            <div className="gg-canvas gutter-left">
              <CardBackPreview
                backMessage={uc.backMessage}
                backgroundColor={insidePanelsBackgroundColor}
                textColor={backTextColor}
                className="gg-card"
              />
            </div>
            <div className="gg-safe-guide" />
          </div>
        </div>
        <div className="gg-panel">
          <div className="gg-panel-wrap">
            <div className="gg-canvas gutter-right">
              <CardTemplateRenderer
                template={templateConfig}
                userContent={uc}
                disableBackgroundAssetOverlay
                forceTextColor={frontForceTextColor}
                className="gg-card"
              />
            </div>
            <div className="gg-safe-guide" />
          </div>
        </div>
      </div>

      {/* Page 2 (inner): Inside Left on LHS, Inside Right on RHS */}
      <div className="gg-page">
        <div className="gg-panel">
          <div className="gg-panel-wrap">
            <div className="gg-canvas inner-left">
              <CardInsideLeftPreview
                insideLeftMessage={uc.insideLeftMessage}
                photo1Url={uc.photoUrls?.["inside-left-photo-1"] ?? null}
                photo2Url={uc.photoUrls?.["inside-left-photo-2"] ?? null}
                photo3Url={uc.photoUrls?.["inside-left-photo-3"] ?? null}
                backgroundColor={insidePanelsBackgroundColor}
                insideLeftTextColor={insideLeftTextColor}
                className="gg-card"
              />
            </div>
            <div className="gg-safe-guide" />
          </div>
        </div>
        <div className="gg-panel">
          <div className="gg-panel-wrap">
            <div className="gg-canvas inner-right">
              <CardInsideRightPreview
                topText={uc.insideRightTop}
                middleText={uc.insideRightMiddle}
                bottomText={uc.insideRightBottom}
                textStyle={insideRightPrintTextStyle}
                backgroundColor={insidePanelsBackgroundColor}
                className="gg-card"
              />
            </div>
            <div className="gg-safe-guide" />
          </div>
        </div>
      </div>
    </div>
  );
}

