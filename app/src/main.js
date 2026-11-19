// Neon Shore Cover Studio — wires the page. Pick photos, choose a layout and a
// grade, write a caption, drag each photo into place, export a PNG.
// Photos are read on this machine with object URLs and never sent anywhere.
// A `?shot=` query sets up a fixed scene for a screenshot (shots.js).
import { paintCover, panelsFor, LAYOUTS, GRADES, TITLE_COLORS } from './cover.js';
import { runShot } from './shots.js';

export const EXPORT_SIZES = {
  square: { label: '1080 × 1080', w: 1080, h: 1080 },
  portrait: { label: '1080 × 1350', w: 1080, h: 1350 },
  wide: { label: '1920 × 1080', w: 1920, h: 1080 },
};

const canvas = document.getElementById('preview');
const titleInput = document.getElementById('title');
const taglineInput = document.getElementById('tagline');
const statusEl = document.getElementById('status');
const zoomInput = document.getElementById('zoom');
const zoomValue = document.getElementById('zoomValue');
const selectedLabel = document.getElementById('selectedLabel');

const state = {
  photos: [null, null, null, null],
  layout: 'trio',
  grade: 'sunset',
  title: titleInput.value,
  tagline: taglineInput.value,
  titleColor: TITLE_COLORS[0],
  size: 'square',
  selected: 0,
};

/** Preview size: the export size scaled so its long side is 720 px. */
function previewSize() {
  const size = EXPORT_SIZES[state.size];
  const scale = 720 / Math.max(size.w, size.h);
  return { w: Math.round(size.w * scale), h: Math.round(size.h * scale) };
}

function drawPreview() {
  if (document.body.classList.contains('shot-cover')) {
    // Cover scene: the canvas already sits at the window's pixel size.
    paintCover(canvas, state);
    drawTray();
    return;
  }
  const { w, h } = previewSize();
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  paintCover(canvas, state);
  drawTray();
}

/** The four photo slots under "Photos", plus the selected-photo readout. */
function drawTray() {
  const tray = document.getElementById('tray');
  tray.replaceChildren();
  state.photos.forEach((photo, i) => {
    const slot = document.createElement('button');
    slot.type = 'button';
    slot.className = 'slot' + (i === state.selected ? ' active' : '');
    slot.setAttribute('aria-label', `Photo slot ${i + 1}`);
    if (photo && photo.url) slot.style.backgroundImage = `url("${photo.url}")`;
    const label = document.createElement('span');
    label.textContent = photo ? `Panel ${i + 1}` : `Empty ${i + 1}`;
    slot.appendChild(label);
    slot.addEventListener('click', () => pickPanel(i));
    tray.appendChild(slot);
  });
  const selected = state.photos[state.selected];
  selectedLabel.textContent = selected
    ? `Panel ${state.selected + 1} — drag the photo in the preview to move it.`
    : `Panel ${state.selected + 1} is empty — add a photo to fill it.`;
  zoomInput.value = String(selected ? selected.zoom : 1);
  zoomValue.textContent = `${(selected ? selected.zoom : 1).toFixed(1)}×`;
}

function pickPanel(i) {
  state.selected = i;
  drawPreview();
}

/** Reads one image file into a photo slot (object URL, stays on this machine). */
function readPhotoFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url, cx: 0.5, cy: 0.5, zoom: 1 });
    img.onerror = () => reject(new Error(`could not read ${file.name}`));
    img.src = url;
  });
}

async function addPhotoFiles(files) {
  for (const file of files) {
    let slot = state.photos.findIndex((p) => !p);
    if (slot === -1) slot = state.selected;
    try {
      state.photos[slot] = await readPhotoFile(file);
      state.selected = slot;
    } catch (err) {
      statusEl.textContent = String(err.message || err);
    }
  }
  drawPreview();
}

export async function loadSample(name, slot) {
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = `samples/${name}.jpg`;
  });
  state.photos[slot] = { img, url: `samples/${name}.jpg`, cx: 0.5, cy: 0.5, zoom: 1 };
}

/** One segmented button group: a single active value, one callback. */
function buildSegment(containerId, entries, current, onPick) {
  const box = document.getElementById(containerId);
  box.replaceChildren();
  for (const [value, label] of entries) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-pressed', String(value === current));
    button.addEventListener('click', () => {
      onPick(value);
      box.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
    });
    box.appendChild(button);
  }
}

buildSegment('layoutButtons',
  Object.entries(LAYOUTS).map(([k, v]) => [k, v.label]),
  state.layout, (v) => { state.layout = v; drawPreview(); });
buildSegment('gradeButtons',
  Object.entries(GRADES).map(([k, v]) => [k, v.label]),
  state.grade, (v) => { state.grade = v; drawPreview(); });
buildSegment('sizeButtons',
  Object.entries(EXPORT_SIZES).map(([k, v]) => [k, v.label]),
  state.size, (v) => { state.size = v; drawPreview(); });

buildSegment('titleColors',
  TITLE_COLORS.map((c) => [c, '']),
  state.titleColor, (v) => { state.titleColor = v; drawPreview(); });
document.querySelectorAll('#titleColors button').forEach((button, i) => {
  button.style.background = TITLE_COLORS[i];
  button.setAttribute('aria-label', `Title colour ${TITLE_COLORS[i]}`);
});

document.getElementById('photoFiles').addEventListener('change', (e) => {
  addPhotoFiles([...e.target.files]);
  e.target.value = '';
});
document.getElementById('samplePhotos').addEventListener('click', async () => {
  if (!state.photos[0]) await loadSample('boulevard', 0);
  if (!state.photos[1]) await loadSample('pier', 1);
  drawPreview();
  statusEl.textContent = 'Sample photos loaded — replace any panel with your own photo.';
});
titleInput.addEventListener('input', () => { state.title = titleInput.value; drawPreview(); });
taglineInput.addEventListener('input', () => { state.tagline = taglineInput.value; drawPreview(); });

zoomInput.addEventListener('input', () => {
  const photo = state.photos[state.selected];
  if (!photo) return;
  photo.zoom = Number(zoomInput.value);
  zoomValue.textContent = `${photo.zoom.toFixed(1)}×`;
  drawPreview();
});
document.getElementById('flipPhoto').addEventListener('click', () => {
  const photo = state.photos[state.selected];
  if (!photo) return;
  const mirror = document.createElement('canvas');
  mirror.width = photo.img.naturalWidth || photo.img.width;
  mirror.height = photo.img.naturalHeight || photo.img.height;
  const mctx = mirror.getContext('2d');
  mctx.translate(mirror.width, 0);
  mctx.scale(-1, 1);
  mctx.drawImage(photo.img, 0, 0);
  photo.img = mirror;
  photo.cx = 1 - photo.cx;
  drawPreview();
});
document.getElementById('centerPhoto').addEventListener('click', () => {
  const photo = state.photos[state.selected];
  if (!photo) return;
  photo.cx = 0.5;
  photo.cy = 0.5;
  photo.zoom = 1;
  drawPreview();
});
document.getElementById('clearPhoto').addEventListener('click', () => {
  state.photos[state.selected] = null;
  drawPreview();
});

/** The panel under a point on the preview canvas (in canvas pixels). */
function panelAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const px = (clientX - rect.left) * (canvas.width / rect.width);
  const py = (clientY - rect.top) * (canvas.height / rect.height);
  const panels = panelsFor(state.layout, canvas.width, canvas.height);
  const index = panels.findIndex((p) => px >= p.x && px < p.x + p.w && py >= p.y && py < p.y + p.h);
  return { index, px, py, panels };
}

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const hit = panelAt(e.clientX, e.clientY);
  if (hit.index === -1) return;
  pickPanel(hit.index);
  drag = { panel: hit.panels[hit.index], lastX: hit.px, lastY: hit.py };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const photo = state.photos[state.selected];
  if (!photo) return;
  const hit = panelAt(e.clientX, e.clientY);
  const panel = drag.panel;
  const iw = photo.img.naturalWidth || photo.img.width;
  const ih = photo.img.naturalHeight || photo.img.height;
  const base = Math.max(panel.w / iw, panel.h / ih) * photo.zoom;
  photo.cx -= (hit.px - drag.lastX) / (iw * base);
  photo.cy -= (hit.py - drag.lastY) / (ih * base);
  photo.cx = Math.min(1, Math.max(0, photo.cx));
  photo.cy = Math.min(1, Math.max(0, photo.cy));
  drag.lastX = hit.px;
  drag.lastY = hit.py;
  drawPreview();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const photo = state.photos[state.selected];
  if (!photo) return;
  photo.zoom = Math.min(2.5, Math.max(1, photo.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
  drawPreview();
}, { passive: false });

document.getElementById('exportPng').addEventListener('click', () => {
  const size = EXPORT_SIZES[state.size];
  const out = document.createElement('canvas');
  out.width = size.w;
  out.height = size.h;
  paintCover(out, state);
  out.toBlob((blob) => {
    if (!blob) {
      statusEl.textContent = 'Export failed in this browser.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-shore-cover-${size.w}x${size.h}.png`;
    a.click();
    // Let the download start, then release the object URL.
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusEl.textContent = `Saved neon-shore-cover-${size.w}x${size.h}.png`;
  }, 'image/png');
});

// Fixed scenes for screenshots: ?shot=cover draws the cover alone at the
// window size; ?shot=editor shows the full app with a sample photo loaded.
// window.__shotReady is set once painted.
const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), state, {
    loadSample,
    redraw: drawPreview,
    setTitle: (t) => { state.title = t; titleInput.value = t; },
    setTagline: (t) => { state.tagline = t; taglineInput.value = t; },
  });
} else {
  document.fonts.ready.then(drawPreview);
  drawPreview();
}
