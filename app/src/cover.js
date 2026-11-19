// Neon Shore cover engine — paints a multi-panel GTA-style poster cover onto a
// 2D canvas. No libraries, no network. All geometry is derived from the canvas
// size, so the preview and every export size (1080x1080, 1080x1350, 1920x1080)
// are drawn by the exact same code path.
//
// A photo slot looks like { img, cx, cy, zoom }. cx/cy is the focal point of
// the photo (fractions 0..1) that sits at the centre of its panel; zoom >= 1
// magnifies the cover-fitted photo. A null slot is an empty panel.

export const LAYOUTS = {
  hero: { label: 'Hero', panels: 1 },
  duo: { label: 'Duo', panels: 2 },
  trio: { label: 'Trio', panels: 3 },
  quad: { label: 'Quad', panels: 4 },
};

export const GRADES = {
  sunset: { label: 'Sunset', top: '#ff9a3c', bottom: '#ff2e88', wash: 'rgba(255,110,60,0.10)' },
  neon: { label: 'Neon Night', top: '#00e5c7', bottom: '#ff2e88', wash: 'rgba(255,46,136,0.10)' },
  gold: { label: 'Golden Hour', top: '#ffd166', bottom: '#e4572e', wash: 'rgba(255,190,80,0.12)' },
  noir: { label: 'Noir', top: '#8d99ae', bottom: '#14121a', wash: 'rgba(20,18,26,0.16)' },
};

export const TITLE_COLORS = ['#ffffff', '#ff5da2', '#ffc46b', '#5df2d6'];

/** Panel rectangles for a layout, in canvas pixels, on a white poster board. */
export function panelsFor(layout, W, H) {
  const gap = Math.max(4, Math.round(Math.min(W, H) * 0.008));
  const left = gap;
  const top = gap;
  const right = W - gap;
  const bottom = H - gap;
  const fullW = right - left;
  const fullH = bottom - top;
  // The big panel takes 56% of the width; the rest stacks beside it.
  const splitX = left + Math.round(fullW * 0.56);
  const splitY = top + Math.round(fullH * 0.5);
  const big = { x: left, y: top, w: splitX - gap - left, h: fullH };
  const sideTop = { x: splitX, y: top, w: right - splitX, h: splitY - gap - top };
  const sideBottom = { x: splitX, y: splitY, w: right - splitX, h: bottom - splitY };
  if (layout === 'duo') return [big, { x: splitX, y: top, w: right - splitX, h: fullH }];
  if (layout === 'trio') return [big, sideTop, sideBottom];
  if (layout === 'quad') {
    return [
      { x: left, y: top, w: splitX - gap - left, h: splitY - gap - top },
      { x: splitX, y: top, w: right - splitX, h: splitY - gap - top },
      { x: left, y: splitY, w: splitX - gap - left, h: bottom - splitY },
      { x: splitX, y: splitY, w: right - splitX, h: bottom - splitY },
    ];
  }
  return [{ x: left, y: top, w: fullW, h: fullH }];
}

/** Cover-fits one photo into its panel, centred on the photo's focal point. */
export function paintPhoto(ctx, panel, photo) {
  const { x, y, w, h } = panel;
  if (!photo || !photo.img) {
    paintEmpty(ctx, panel);
    return;
  }
  const img = photo.img;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const zoom = Math.max(1, photo.zoom || 1);
  const scale = Math.max(w / iw, h / ih) * zoom;
  const drawnW = iw * scale;
  const drawnH = ih * scale;
  // The focal point (cx, cy) of the photo lands on the panel centre.
  const focusX = (photo.cx ?? 0.5) * drawnW;
  const focusY = (photo.cy ?? 0.5) * drawnH;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, x + w / 2 - focusX, y + h / 2 - focusY, drawnW, drawnH);
  // A light warm wash inside every photo, so panels feel graded even before
  // the cover-wide grade is painted over them.
  const warm = ctx.createLinearGradient(x, y, x, y + h);
  warm.addColorStop(0, 'rgba(255,150,60,0.05)');
  warm.addColorStop(1, 'rgba(255,46,136,0.10)');
  ctx.fillStyle = warm;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** Gradient placeholder with a plus mark for a panel with no photo yet. */
export function paintEmpty(ctx, panel) {
  const { x, y, w, h } = panel;
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, '#3b1d5a');
  grad.addColorStop(0.55, '#c22a72');
  grad.addColorStop(1, '#ff7a3c');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
  const s = Math.min(w, h);
  const arm = s * 0.09;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(2, s * 0.02);
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - arm, y + h / 2);
  ctx.lineTo(x + w / 2 + arm, y + h / 2);
  ctx.moveTo(x + w / 2, y + h / 2 - arm);
  ctx.lineTo(x + w / 2, y + h / 2 + arm);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `${Math.max(10, Math.round(s * 0.045))}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('ADD A PHOTO', x + w / 2, y + h / 2 + s * 0.17);
}

/** Cover-wide colour grade: a soft-light sunset/neon wash plus a vignette. */
export function paintGrade(ctx, W, H, gradeName) {
  const grade = GRADES[gradeName] || GRADES.sunset;
  const wash = ctx.createLinearGradient(0, 0, W, H);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(1, grade.bottom);
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = grade.wash;
  ctx.fillRect(0, 0, W, H);
  const vig = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.42,
    W / 2, H / 2, Math.max(W, H) * 0.75,
  );
  vig.addColorStop(0, 'rgba(10,6,18,0)');
  vig.addColorStop(1, 'rgba(10,6,18,0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** Shrinks one line of display type until it fits, never below a floor size. */
export function fitLine(ctx, text, maxWidth, startSize, family) {
  let size = startSize;
  const floor = Math.max(10, Math.round(startSize * 0.22));
  do {
    ctx.font = `${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size = Math.round(size * 0.92);
  } while (size > floor);
  ctx.font = `${size}px ${family}`;
  return size;
}

/** The caption band: dark foot, gradient accent rule, big title, script tagline. */
export function paintCaption(ctx, W, H, title, tagline, titleColor) {
  const bandH = H * 0.30;
  const bandY = H - bandH;
  const shade = ctx.createLinearGradient(0, bandY - H * 0.06, 0, H);
  shade.addColorStop(0, 'rgba(12,7,20,0)');
  shade.addColorStop(0.45, 'rgba(12,7,20,0.62)');
  shade.addColorStop(1, 'rgba(12,7,20,0.94)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, bandY - H * 0.06, W, H - bandY + H * 0.06);

  const pad = W * 0.055;
  const maxW = W - pad * 2;
  // Accent rule above the title, pink into amber into gold.
  const rule = ctx.createLinearGradient(pad, 0, pad + W * 0.34, 0);
  rule.addColorStop(0, '#ff2e88');
  rule.addColorStop(0.6, '#ff7a3c');
  rule.addColorStop(1, '#ffd166');
  ctx.fillStyle = rule;
  const ruleY = bandY + H * 0.055;
  ctx.fillRect(pad, ruleY, W * 0.34, Math.max(3, H * 0.006));

  const cleanTitle = (title || '').trim().toUpperCase();
  if (cleanTitle) {
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(H * 0.004)}px`;
    const size = fitLine(ctx, cleanTitle, maxW, H * 0.115, 'Anton, "Arial Narrow", sans-serif');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = titleColor || '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.18;
    ctx.shadowOffsetY = size * 0.04;
    ctx.fillText(cleanTitle, pad, bandY + H * 0.055 + size * 1.12);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
  const cleanTag = (tagline || '').trim();
  if (cleanTag) {
    const tagSize = fitLine(ctx, cleanTag, maxW, H * 0.052, 'Pacifico, cursive');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd166';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = tagSize * 0.2;
    ctx.fillText(cleanTag, pad, H - H * 0.045);
    ctx.shadowBlur = 0;
  }
}

/**
 * Paints the whole cover. `state` is { photos, layout, grade, title, tagline,
 * titleColor }; photos is an array indexed by panel (null entries allowed).
 */
export function paintCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  // White poster board underneath everything.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  const panels = panelsFor(state.layout || 'trio', W, H);
  panels.forEach((panel, i) => paintPhoto(ctx, panel, (state.photos || [])[i] || null));
  paintGrade(ctx, W, H, state.grade || 'sunset');
  paintCaption(ctx, W, H, state.title, state.tagline, state.titleColor);
  // Thin white poster frame.
  const frame = Math.max(2, Math.min(W, H) * 0.004);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = frame;
  ctx.strokeRect(frame, frame, W - frame * 2, H - frame * 2);
}
