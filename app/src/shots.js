// Fixed scenes for screenshots: ?shot=cover shows the cover alone, ?shot=editor
// shows the app with a sample photo loaded. Query parameters:
//   photo, photo2, photo3, photo4 — sample names (boulevard, pier, palms, cast)
//   caption — the title, tagline — the script line
//   layout — hero, duo, trio, quad; grade — sunset, neon, gold, noir
//   size — square, portrait, wide (sets the preview aspect for editor shots)
// window.__shotReady is set once the fonts and photos are in and painted.
export async function runShot(shot, query, state, api) {
  const slots = ['photo', 'photo2', 'photo3', 'photo4'];
  for (let i = 0; i < slots.length; i++) {
    const name = query.get(slots[i]);
    if (name) await api.loadSample(name, i);
  }
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('size')) state.size = query.get('size');
  if (query.get('caption') !== null) api.setTitle(query.get('caption'));
  if (query.get('tagline') !== null) api.setTagline(query.get('tagline'));

  const canvas = document.getElementById('preview');
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    // Draw the cover at the window's own pixel size: the screenshot is the
    // app's own drawing of the exported cover, at the gate's largest size.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  // Wait for the display fonts, then paint twice so the canvas is settled.
  try {
    await Promise.all([
      document.fonts.load('40px Anton'),
      document.fonts.load('40px Pacifico'),
    ]);
  } catch { /* fall back to system fonts */ }
  api.redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
