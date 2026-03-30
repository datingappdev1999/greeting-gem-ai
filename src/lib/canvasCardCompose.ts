import type { CardPage, PhotoSlot, TextSlot } from "@/data/cardTemplates";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/** object-fit: cover — fills dest rect, center-cropped */
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dWidth: number,
  dHeight: number
): void {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;
  const scale = Math.max(dWidth / iw, dHeight / ih);
  const sw = dWidth / scale;
  const sh = dHeight / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dWidth, dHeight);
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string
): string[] {
  const t = text.trim();
  if (!t) return [];
  ctx.font = `${fontSize}px ${fontFamily}`;
  const words = t.split(/\s+/);
  const lines: string[] = [];
  let line = words[0] ?? "";
  for (let i = 1; i < words.length; i++) {
    const w = words[i]!;
    const test = `${line} ${w}`;
    if (ctx.measureText(test).width <= maxWidth) line = test;
    else {
      lines.push(line);
      line = w;
    }
  }
  lines.push(line);
  return lines;
}

function blockFits(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxH: number,
  fontSize: number,
  fontFamily: string,
  lineHeight: number
): boolean {
  if (!text.trim()) return true;
  const lines = wrapLines(ctx, text, maxW, fontSize, fontFamily);
  return lines.length * lineHeight <= maxH;
}

export function fitTextToBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxH: number,
  minPx: number,
  maxPx: number,
  fontFamily: string,
  lineHeightRatio: number
): { fontSize: number; lines: string[] } {
  const t = text.trim();
  if (!t) return { fontSize: maxPx, lines: [] };

  let lo = minPx;
  let hi = maxPx;
  let best = minPx;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const lh = mid * lineHeightRatio;
    if (blockFits(ctx, t, maxW, maxH, mid, fontFamily, lh)) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  const lines = wrapLines(ctx, t, maxW, best, fontFamily);
  return { fontSize: best, lines };
}

function resolveCanvasFontFamily(slot: TextSlot): string {
  if (slot.canvasFontFamily) return slot.canvasFontFamily;
  if (slot.fontFamily.includes("var(")) return "Arial, Helvetica, sans-serif";
  return slot.fontFamily;
}

function textMetricsForSlot(
  slot: TextSlot,
  cw: number,
  ch: number
): { x: number; y: number; w: number; h: number; pad: number } {
  const padFrac = slot.paddingPercent ?? 1.5;
  const pad = (padFrac / 100) * Math.min(cw, ch);
  const x = (slot.x / 100) * cw + pad;
  const y = (slot.y / 100) * ch + pad;
  const w = (slot.width / 100) * cw - pad * 2;
  const h = (slot.height / 100) * ch - pad * 2;
  return { x, y, w, h, pad };
}

function drawTextSlot(
  ctx: CanvasRenderingContext2D,
  slot: TextSlot,
  content: string,
  cw: number,
  ch: number
): void {
  const slotX = (slot.x / 100) * cw;
  const slotY = (slot.y / 100) * ch;
  const slotW = (slot.width / 100) * cw;
  const slotH = (slot.height / 100) * ch;

  const { x, y, w, h } = textMetricsForSlot(slot, cw, ch);
  const fontFamily = resolveCanvasFontFamily(slot);
  const minPx = slot.minFontPx ?? 10;
  const maxPx = slot.maxFontPx ?? Math.max(minPx, slot.fontSize * 16);
  const lineHeightRatio = slot.lineHeightRatio ?? 1.2;
  const { fontSize, lines } = fitTextToBox(ctx, content, w, h, minPx, maxPx, fontFamily, lineHeightRatio);
  const lh = fontSize * lineHeightRatio;
  if (lines.length === 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(slotX, slotY, slotW, slotH);
  ctx.clip();
  ctx.fillStyle = slot.color;
  ctx.textBaseline = "top";
  ctx.font = `${fontSize}px ${fontFamily}`;

  const totalH = lines.length * lh;
  const startY =
    slot.verticalAlign === "center" ? y + Math.max(0, (h - totalH) / 2) : y;

  lines.forEach((line, i) => {
    let drawX = x;
    if (slot.textAlign === "center") {
      ctx.textAlign = "center";
      drawX = x + w / 2;
    } else if (slot.textAlign === "right") {
      ctx.textAlign = "right";
      drawX = x + w;
    } else {
      ctx.textAlign = "left";
    }
    ctx.fillText(line, drawX, startY + i * lh);
  });
  ctx.restore();
}

function drawPhotoSlot(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  slot: PhotoSlot,
  cw: number,
  ch: number
): void {
  const x = (slot.x / 100) * cw;
  const y = (slot.y / 100) * ch;
  const w = (slot.width / 100) * cw;
  const h = (slot.height / 100) * ch;
  ctx.save();
  if (slot.shape === "oval") {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
  }
  drawImageCover(ctx, img, x, y, w, h);
  ctx.restore();
}

function canvasSourceSize(source: CanvasImageSource): { cw: number; ch: number } {
  if (source instanceof HTMLImageElement) {
    return { cw: source.naturalWidth, ch: source.naturalHeight };
  }
  return { cw: source.width, ch: source.height };
}

/** Solid or raster background for one card page. */
export async function loadBackgroundForPage(page: CardPage): Promise<CanvasImageSource> {
  if (page.backgroundImage) {
    try {
      return await loadImage(page.backgroundImage);
    } catch {
      // fall through to fallback
    }
  }
  const c = document.createElement("canvas");
  c.width = page.fallbackPixelSize.width;
  c.height = page.fallbackPixelSize.height;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.fillStyle = page.fallbackColor ?? "#ffffff";
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

export interface ComposeCardPageOptions {
  page: CardPage;
  textBySlotId: Record<string, string>;
  photoBySlotId: Record<string, HTMLImageElement | null>;
}

/**
 * Renders background, user photos (cover-crop), then text (auto-fit).
 * `background` may be an image or an offscreen canvas (solid panel).
 */
export function composeCardOnCanvas(
  canvas: HTMLCanvasElement,
  background: CanvasImageSource,
  options: ComposeCardPageOptions
): void {
  const { cw, ch } = canvasSourceSize(background);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = cw;
  canvas.height = ch;
  ctx.drawImage(background, 0, 0, cw, ch);

  const { page, textBySlotId, photoBySlotId } = options;

  for (const slot of page.photoSlots) {
    const img = photoBySlotId[slot.id];
    if (img && img.complete && img.naturalWidth) {
      drawPhotoSlot(ctx, img, slot, cw, ch);
    }
  }

  for (const slot of page.textSlots) {
    const raw = textBySlotId[slot.id] ?? slot.defaultText;
    drawTextSlot(ctx, slot, raw, cw, ch);
  }
}

async function loadPhotoMapForPage(
  page: CardPage,
  photoUrlBySlotId: Record<string, string | null>
): Promise<Record<string, HTMLImageElement | null>> {
  const out: Record<string, HTMLImageElement | null> = {};
  for (const slot of page.photoSlots) {
    const url = photoUrlBySlotId[slot.id] ?? null;
    if (!url) {
      out[slot.id] = null;
      continue;
    }
    try {
      out[slot.id] = await loadImage(url);
    } catch {
      out[slot.id] = null;
    }
  }
  return out;
}

/** Renders one page off-DOM (for exporting any page without a mounted canvas). */
export async function renderPageToPngDataUrl(
  page: CardPage,
  textBySlotId: Record<string, string>,
  photoUrlBySlotId: Record<string, string | null>
): Promise<string | null> {
  const bg = await loadBackgroundForPage(page);
  const photos = await loadPhotoMapForPage(page, photoUrlBySlotId);
  const canvas = document.createElement("canvas");
  composeCardOnCanvas(canvas, bg, { page, textBySlotId, photoBySlotId: photos });
  try {
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export function triggerPngDownload(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
