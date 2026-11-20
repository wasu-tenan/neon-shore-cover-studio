// Neon Shore Cover Studio — page wiring: uploads, panel picking, drag to
// position a photo, layout / grade / size controls, PNG export, and the
// ?shot= scenes the screenshots are taken from.
import { LAYOUTS, GRADES, SIZES, defaultState, drawCover, panelAt } from './cover.js';

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');
const state = defaultState();
let selected = 0;
let dragging = null;

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function sizeOf() {
  return SIZES[state.size] ?? SIZES.square;
}

function redraw() {
  const { w, h } = sizeOf();
  canvas.width = w;
  canvas.height = h;
  drawCover(canvas.getContext('2d'), w, h, state);
  document.querySelectorAll('[data-panel]').forEach((el) => {
    el.classList.toggle('active', Number(el.dataset.panel) === selected);
  });
  document.getElementById('zoom').value = String(state.pan[selected].zoom);
  document.getElementById('zoomval').textContent = `${Math.round(state.pan[selected].zoom * 100)}%`;
}

function say(msg) {
  statusEl.textContent = msg;
}

function setPhotos(img, fillAll) {
  const layout = LAYOUTS[state.layout];
  const count = layout.panels(100, 100, layout.captionBand).length;
  if (fillAll) {
    for (let i = 0; i < count; i += 1) state.photos[i] = img;
  } else {
    state.photos[selected] = img;
  }
  redraw();
}

async function loadSample(name) {
  try {
    const img = await loadImage(`./samples/${name}.jpg`);
    setPhotos(img, true);
    say(`Loaded sample ${name} into every panel.`);
  } catch {
    say('Could not load that sample photo.');
  }
}

function buildButtons(container, entries, key, onPick) {
  const box = document.getElementById(container);
  Object.entries(entries).forEach(([value, def]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = def.label;
    b.dataset.value = value;
    b.addEventListener('click', () => {
      state[key] = value;
      box.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === b));
      onPick();
      redraw();
    });
    box.appendChild(b);
  });
  box.querySelector(`[data-value="${state[key]}"]`)?.classList.add('active');
}

function buildPanelSlots() {
  const box = document.getElementById('panels');
  for (let i = 0; i < 4; i += 1) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip panel-slot';
    b.dataset.panel = String(i);
    b.textContent = `Panel ${i + 1}`;
    b.addEventListener('click', () => {
      selected = i;
      redraw();
    });
    box.appendChild(b);
  }
}

function bindUploads() {
  document.getElementById('upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const img = await loadImage(URL.createObjectURL(file));
      setPhotos(img, false);
      say(`Photo placed in panel ${selected + 1}. Drag it to position.`);
    } catch {
      say('That file could not be read as an image.');
    }
    e.target.value = '';
  });
  document.getElementById('sample-pier').addEventListener('click', () => loadSample('pier'));
  document.getElementById('sample-boulevard').addEventListener('click', () => loadSample('boulevard'));
}

function bindText() {
  const title = document.getElementById('title');
  const subtitle = document.getElementById('subtitle');
  title.addEventListener('input', () => {
    state.title = title.value;
    redraw();
  });
  subtitle.addEventListener('input', () => {
    state.subtitle = subtitle.value;
    redraw();
  });
}

function bindCanvasDrag() {
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const hit = panelAt(state, canvas.width, canvas.height, px, py);
    if (hit < 0) return;
    selected = hit;
    dragging = { x: e.clientX, y: e.clientY, pan: { ...state.pan[hit] } };
    canvas.setPointerCapture(e.pointerId);
    redraw();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const panels = LAYOUTS[state.layout].panels(canvas.width, canvas.height, LAYOUTS[state.layout].captionBand);
    const r = panels[selected];
    state.pan[selected].x = dragging.pan.x + (e.clientX - dragging.x) / rect.width * (canvas.width / r.w);
    state.pan[selected].y = dragging.pan.y + (e.clientY - dragging.y) / rect.height * (canvas.height / r.h);
    redraw();
  });
  canvas.addEventListener('pointerup', () => {
    dragging = null;
  });
  document.getElementById('zoom').addEventListener('input', (e) => {
    state.pan[selected].zoom = Number(e.target.value);
    redraw();
  });
}

function bindExport() {
  document.getElementById('export').addEventListener('click', () => {
    const { w, h } = sizeOf();
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    drawCover(off.getContext('2d'), w, h, state);
    off.toBlob((blob) => {
      if (!blob) {
        say('Export failed — try again.');
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `neon-shore-cover-${w}x${h}.png`;
      a.click();
      say(`Exported neon-shore-cover-${w}x${h}.png`);
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    }, 'image/png');
  });
}

// Screenshot scenes: ?shot=cover draws one exported cover full-screen,
// ?shot=editor shows the studio with a sample photo loaded.
async function runShot(params) {
  const shot = params.get('shot');
  const photo = params.get('photo') || 'pier';
  const caption = params.get('caption') || 'Sunset Heist';
  const layout = params.get('layout');
  const grade = params.get('grade');
  const size = params.get('size');
  if (LAYOUTS[layout]) state.layout = layout;
  if (GRADES[grade]) state.grade = grade;
  if (SIZES[size]) state.size = size;
  state.title = caption;
  state.subtitle = params.get('subtitle') || 'Neon Shore';
  const img = await loadImage(`./samples/${photo}.jpg`);
  setPhotos(img, true);
  document.body.classList.add(`shot-${shot}`);
  document.title = shot === 'cover' ? `Cover — ${caption}` : 'Neon Shore Cover Studio';
  redraw();
  document.body.dataset.shotReady = '1';
}

buildPanelSlots();
buildButtons('layouts', LAYOUTS, 'layout', () => {
  const count = LAYOUTS[state.layout].panels(100, 100, LAYOUTS[state.layout].captionBand).length;
  if (selected >= count) selected = 0;
  document.querySelectorAll('.panel-slot').forEach((el, i) => {
    el.style.display = i < count ? '' : 'none';
  });
});
buildButtons('grades', GRADES, 'grade', () => {});
buildButtons('sizes', SIZES, 'size', () => {});
bindUploads();
bindText();
bindCanvasDrag();
bindExport();

const params = new URLSearchParams(location.search);
if (params.get('shot')) {
  runShot(params).catch(() => {
    document.body.dataset.shotReady = '1';
    redraw();
  });
} else {
  loadSample('pier');
}
