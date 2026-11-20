// Neon Shore Cover Studio — cover renderer.
// Draws a GTA-poster-style multi-panel cover onto any 2d canvas context.
// Pure drawing: no network, no DOM, no Rockstar art, fonts or logos.
export const LAYOUTS = {
  grid: {
    label: 'Vice Grid',
    captionBand: 0.3,
    panels(ctxW, ctxH, band) {
      const g = Math.round(ctxW * 0.014);
      const top = ctxH * (1 - band);
      const half = (top - g * 3) / 2;
      const w2 = (ctxW - g * 3) / 2;
      return [
        { x: g, y: g, w: w2, h: half },
        { x: g * 2 + w2, y: g, w: w2, h: half },
        { x: g, y: g * 2 + half, w: w2, h: half },
        { x: g * 2 + w2, y: g * 2 + half, w: w2, h: half },
      ];
    },
  },
  strip: {
    label: 'Sunset Strip',
    captionBand: 0.3,
    panels(ctxW, ctxH, band) {
      const g = Math.round(ctxW * 0.014);
      const top = ctxH * (1 - band);
      const heroH = (top - g * 3) * 0.62;
      const lowH = (top - g * 3) * 0.38;
      const w2 = (ctxW - g * 3) / 2;
      return [
        { x: g, y: g, w: ctxW - g * 2, h: heroH },
        { x: g, y: g * 2 + heroH, w: w2, h: lowH },
        { x: g * 2 + w2, y: g * 2 + heroH, w: w2, h: lowH },
      ];
    },
  },
  trio: {
    label: 'Neon Trio',
    captionBand: 0.3,
    panels(ctxW, ctxH, band) {
      const g = Math.round(ctxW * 0.014);
      const top = ctxH * (1 - band);
      const w3 = (ctxW - g * 4) / 3;
      const h = top - g * 2;
      return [
        { x: g, y: g, w: w3, h },
        { x: g * 2 + w3, y: g, w: w3, h },
        { x: g * 3 + w3 * 2, y: g, w: w3, h },
      ];
    },
  },
};

export const GRADES = {
  sunset: {
    label: 'Sunset',
    tint: ['#ff9a3c', '#ff2e63', '#7b2ff7'],
    sky: '#ff7e2e',
    band: '#12081f',
    accent: '#ffb347',
  },
  neon: {
    label: 'Neon',
    tint: ['#ff2e88', '#22d3ee', '#7c3aed'],
    sky: '#e0218a',
    band: '#0a0618',
    accent: '#22d3ee',
  },
  vice: {
    label: 'Vice',
    tint: ['#2dd4bf', '#a855f7', '#f472b6'],
    sky: '#14b8a6',
    band: '#08131a',
    accent: '#f472b6',
  },
};

export const SIZES = {
  square: { label: '1080 × 1080 · Square', w: 1080, h: 1080 },
  portrait: { label: '1080 × 1350 · Portrait', w: 1080, h: 1350 },
  wide: { label: '1920 × 1080 · Wide', w: 1920, h: 1080 },
};

export function defaultState() {
  return {
    layout: 'grid',
    grade: 'sunset',
    size: 'square',
    title: 'Sunset Heist',
    subtitle: 'Neon Shore',
    photos: [null, null, null, null],
    pan: [
      { x: 0, y: 0, zoom: 1 },
      { x: 0, y: 0, zoom: 1 },
      { x: 0, y: 0, zoom: 1 },
      { x: 0, y: 0, zoom: 1 },
    ],
  };
}

function fitPhoto(img, rect, pan) {
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * pan.zoom;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  return {
    dx: rect.x + (rect.w - dw) / 2 + pan.x * rect.w,
    dy: rect.y + (rect.h - dh) / 2 + pan.y * rect.h,
    dw,
    dh,
  };
}

function paintPlaceholder(ctx, rect, grade, index) {
  const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  grad.addColorStop(0, grade.tint[index % grade.tint.length]);
  grad.addColorStop(1, grade.band);
  ctx.fillStyle = grad;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, rect.w * 0.02);
  for (let i = -2; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(rect.x + i * rect.w * 0.25, rect.y + rect.h);
    ctx.lineTo(rect.x + i * rect.w * 0.25 + rect.h, rect.y);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `700 ${Math.round(rect.h * 0.07)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ADD PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
}

function paintGrade(ctx, rect, grade) {
  const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  grad.addColorStop(0, grade.tint[0]);
  grad.addColorStop(0.55, grade.tint[1]);
  grad.addColorStop(1, grade.tint[2]);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.34;
  ctx.fillStyle = grad;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = grade.sky;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h * 0.45);
  ctx.restore();
  const vig = ctx.createRadialGradient(
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w, rect.h) * 0.35,
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.75,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}

function paintCaption(ctx, W, H, band, state, grade) {
  const bandY = H * (1 - band);
  const bandH = H * band;
  const bg = ctx.createLinearGradient(0, bandY, 0, H);
  bg.addColorStop(0, grade.band);
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, bandY, W, bandH);
  ctx.fillStyle = grade.accent;
  ctx.fillRect(0, bandY, W, Math.max(3, H * 0.004));
  const pad = W * 0.045;
  let titleSize = Math.min(W * 0.115, bandH * 0.52);
  const title = (state.title || 'Untitled').toUpperCase();
  ctx.font = `${Math.round(titleSize)}px Anton, 'Arial Black', sans-serif`;
  const maxTitleW = W - pad * 2;
  if (ctx.measureText(title).width > maxTitleW) {
    titleSize = Math.floor((titleSize * maxTitleW) / ctx.measureText(title).width);
    ctx.font = `${Math.round(titleSize)}px Anton, 'Arial Black', sans-serif`;
  }
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const ty = bandY + bandH * 0.58;
  ctx.save();
  ctx.lineWidth = Math.max(2, titleSize * 0.09);
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineJoin = 'round';
  ctx.strokeText(title, pad, ty);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(title, pad, ty);
  ctx.restore();
  const subSize = Math.min(W * 0.052, bandH * 0.24);
  ctx.font = `${Math.round(subSize)}px Pacifico, cursive`;
  ctx.fillStyle = grade.accent;
  ctx.fillText(state.subtitle || '', pad, bandY + bandH * 0.88);
  ctx.textAlign = 'right';
  ctx.font = `700 ${Math.round(W * 0.02)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('NEON SHORE', W - pad, bandY + bandH * 0.24);
  ctx.font = `${Math.round(W * 0.016)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText('COVER STUDIO', W - pad, bandY + bandH * 0.4);
}

// Draws the full cover for `state` onto ctx at pixel size W x H.
export function drawCover(ctx, W, H, state) {
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.grid;
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const band = layout.captionBand;
  ctx.save();
  ctx.fillStyle = '#0b0714';
  ctx.fillRect(0, 0, W, H);
  const panels = layout.panels(W, H, band);
  const line = Math.max(2, Math.round(W * 0.006));
  panels.forEach((rect, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    const img = state.photos[i];
    if (img) {
      const d = fitPhoto(img, rect, state.pan[i] ?? { x: 0, y: 0, zoom: 1 });
      ctx.drawImage(img, d.dx, d.dy, d.dw, d.dh);
    } else {
      paintPlaceholder(ctx, rect, grade, i);
    }
    paintGrade(ctx, rect, grade);
    ctx.restore();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = line;
    ctx.strokeRect(rect.x + line / 2, rect.y + line / 2, rect.w - line, rect.h - line);
  });
  paintCaption(ctx, W, H, band, state, grade);
  ctx.restore();
}

export function panelAt(state, W, H, px, py) {
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.grid;
  const panels = layout.panels(W, H, layout.captionBand);
  for (let i = 0; i < panels.length; i += 1) {
    const r = panels[i];
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
  }
  return -1;
}
