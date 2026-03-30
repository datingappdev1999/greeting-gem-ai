import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CardTemplateRenderer from "@/components/CardTemplateRenderer";
import CardInsideRightPreview from "@/components/CardInsideRightPreview";
import CardInsideLeftPreview from "@/components/CardInsideLeftPreview";
import CardBackPreview from "@/components/CardBackPreview";
import { OCCASIONS } from "@/lib/occasionsData";
import { getCardTemplateConfig } from "@/templates";
import type { CardUserContent, TextStyle } from "@/types/cardTemplate";

type PdfJobPayload = {
  templateId: string;
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
    () => (job ? findTemplateCard(job.templateId) : null),
    [job]
  );
  const templateConfig = useMemo(
    () => (templateCard ? getCardTemplateConfig(templateCard) : null),
    [templateCard]
  );
  const frontHeadlineStyle = useMemo(() => {
    if (!templateConfig) return null;
    const el = templateConfig.elements.find((e) => e.type === "headline");
    if (!el || el.type !== "headline") return null;
    return el.style as TextStyle;
  }, [templateConfig]);

  const isEasterPastelEggsGrid = job?.templateId === "easter-pastel-eggs-grid";
  const easterPastelPanelBg = "#FCF9F4";

  const insideRightPrintTextStyle = useMemo(() => {
    if (isEasterPastelEggsGrid) {
      return {
        fontFamily: "var(--font-body)",
        color: "hsl(var(--foreground))",
        fontSize: "24px",
      };
    }
    return {
      fontFamily: frontHeadlineStyle?.fontFamily,
      color: frontHeadlineStyle?.color,
      fontSize: "24px",
    };
  }, [isEasterPastelEggsGrid, frontHeadlineStyle]);

  useEffect(() => {
    // Let Playwright know the page is ready to print.
    if ((window as any).__GG_PRINT_READY) return;
    if (jobId && templateConfig && job) {
      (window as any).__GG_PRINT_READY = true;
    }
  }, [jobId, templateConfig, job]);

  if (!jobId) return <div>Missing jobId</div>;
  if (!job || !templateConfig) return <div>Loading…</div>;

  const uc = job.userContent;

  return (
    <div className="gg-print-root">
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        html, body { margin: 0; padding: 0; }
        .gg-print-root { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .gg-page { width: 297mm; height: 210mm; display: flex; page-break-after: always; }
        .gg-panel { width: 148.5mm; height: 210mm; padding: 8mm; box-sizing: border-box; display: flex; align-items: center; justify-content: center; background: white; }
        .gg-card { width: 100%; height: 100%; }
      `}</style>

      {/* Outer spread: Back (left), Front (right) */}
      <div className="gg-page">
        <div className="gg-panel">
          <CardBackPreview backMessage={uc.backMessage} className="gg-card" />
        </div>
        <div className="gg-panel">
          <CardTemplateRenderer
            template={templateConfig}
            userContent={uc}
            disableBackgroundAssetOverlay
            className="gg-card"
          />
        </div>
      </div>

      {/* Inner spread: Inside left (left), Inside right (right) */}
      <div className="gg-page">
        <div className="gg-panel">
          <CardInsideLeftPreview
            insideLeftMessage={uc.insideLeftMessage}
            photo1Url={uc.photoUrls?.["inside-left-photo-1"] ?? null}
            photo2Url={uc.photoUrls?.["inside-left-photo-2"] ?? null}
            photo3Url={uc.photoUrls?.["inside-left-photo-3"] ?? null}
            backgroundColor={
              isEasterPastelEggsGrid ? easterPastelPanelBg : undefined
            }
            className="gg-card"
          />
        </div>
        <div className="gg-panel">
          <CardInsideRightPreview
            topText={uc.insideRightTop}
            middleText={uc.insideRightMiddle}
            bottomText={uc.insideRightBottom}
            backgroundColor={
              isEasterPastelEggsGrid ? easterPastelPanelBg : undefined
            }
            textStyle={insideRightPrintTextStyle}
            className="gg-card"
          />
        </div>
      </div>
    </div>
  );
}

