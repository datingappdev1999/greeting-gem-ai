import type { CardPage, PhotoSlot, TextSlot } from "@/data/cardTemplates";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textSlotCss(slot: TextSlot): string {
  const minPx = slot.minFontPx ?? 10;
  const maxPx = slot.maxFontPx ?? 32;
  const lh = slot.lineHeightRatio ?? 1.2;
  const pad = slot.paddingPercent ?? 1.5;
  const vAlign = slot.verticalAlign === "center" ? "center" : "flex-start";
  const hJustify =
    slot.textAlign === "center"
      ? "center"
      : slot.textAlign === "right"
        ? "flex-end"
        : "flex-start";

  return `
    .card-text-slot[data-text-slot="${slot.id}"] {
      left: ${slot.x}%;
      top: ${slot.y}%;
      width: ${slot.width}%;
      height: ${slot.height}%;
      font-family: ${slot.fontFamily};
      color: ${slot.color};
      text-align: ${slot.textAlign};
      line-height: ${lh};
      font-size: clamp(${minPx}px, 4.2cqmin, ${maxPx}px);
      padding: ${pad}cqmin;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: ${slot.textAlign === "center" ? "center" : slot.textAlign === "right" ? "flex-end" : "flex-start"};
      justify-content: ${vAlign};
      white-space: pre-wrap;
      word-break: break-word;
      box-sizing: border-box;
    }
  `;
}

function photoSlotCss(slot: PhotoSlot): string {
  const radius = slot.shape === "oval" ? "50%" : "0";
  return `
    .card-photo-slot[data-photo-slot="${slot.id}"] {
      left: ${slot.x}%;
      top: ${slot.y}%;
      width: ${slot.width}%;
      height: ${slot.height}%;
      overflow: hidden;
      border-radius: ${radius};
    }
    .card-photo-slot[data-photo-slot="${slot.id}"] img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }
    .card-photo-slot[data-photo-slot="${slot.id}"].card-photo-slot--empty {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.35);
      border: 2px dashed rgba(0,0,0,0.2);
      box-sizing: border-box;
    }
    .card-photo-slot[data-photo-slot="${slot.id}"].card-photo-slot--empty .card-photo-placeholder {
      font-size: clamp(10px, 2.5cqmin, 14px);
      color: rgba(0,0,0,0.45);
      text-align: center;
      padding: 0.5em;
      line-height: 1.3;
    }
  `;
}

function buildTextSlotHtml(slot: TextSlot, text: string): string {
  const raw = text ?? slot.defaultText;
  const inner = escapeHtml(raw).replace(/\n/g, "<br/>");
  return `<div data-text-slot="${slot.id}" class="card-text-slot" data-gjs-editable="true">${inner}</div>`;
}

function buildPhotoSlotHtml(slot: PhotoSlot, url: string | null): string {
  if (url) {
    const safe = url.replace(/'/g, "%27");
    return `<div data-photo-slot="${slot.id}" class="card-photo-slot"><img src='${safe}' alt="" /></div>`;
  }
  return `<div data-photo-slot="${slot.id}" class="card-photo-slot card-photo-slot--empty"><span class="card-photo-placeholder">Photo — use the panel to upload</span></div>`;
}

/**
 * HTML + CSS for one card page inside GrapesJS canvas (percent layout matches {@link CardPage} / canvas export).
 */
export function buildGrapesCardPageMarkup(
  page: CardPage,
  textBySlotId: Record<string, string>,
  photoUrlBySlotId: Record<string, string | null>
): { html: string; css: string } {
  const ar = page.aspectRatio;
  const bgHtml = page.backgroundImage
    ? `<img class="card-bg" src="${page.backgroundImage}" alt="" draggable="false" />`
    : `<div class="card-bg card-bg--solid" style="background:${page.fallbackColor ?? "#ffffff"}"></div>`;

  const textHtml = page.textSlots.map((s) =>
    buildTextSlotHtml(s, textBySlotId[s.id] ?? s.defaultText)
  );
  const photoHtml = page.photoSlots.map((s) =>
    buildPhotoSlotHtml(s, photoUrlBySlotId[s.id] ?? null)
  );

  const html = `
    <div class="card-root" data-card-page="${page.id}">
      ${bgHtml}
      ${photoHtml.join("")}
      ${textHtml.join("")}
    </div>
  `;

  const css = `
    .card-root {
      position: relative;
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
      aspect-ratio: ${ar};
      container-type: size;
      container-name: card;
      background: #fff;
    }
    .card-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      pointer-events: none;
      user-select: none;
    }
    .card-bg--solid { pointer-events: none; }
    .card-text-slot, .card-photo-slot {
      position: absolute;
      box-sizing: border-box;
    }
    ${page.textSlots.map((s) => textSlotCss(s)).join("\n")}
    ${page.photoSlots.map((s) => photoSlotCss(s)).join("\n")}
  `;

  return { html, css };
}
