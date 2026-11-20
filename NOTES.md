# Neon Shore Cover Studio — build notes (round 5, recorded session)

## What it is
Offline web app that turns a photo + caption into GTA-style poster cover art.
- 3 layouts: Vice Grid (2×2), Sunset Strip (hero + 2), Neon Trio (3 vertical)
- 3 colour grades: Sunset, Neon, Vice (overlay + soft-light + vignette on canvas)
- Per-panel photo upload (kit samples pier/boulevard built in), drag to position,
  zoom slider per selected panel
- Caption: Anton display title (auto-shrinks to fit) + Pacifico script line
- Export PNG at 1080×1080, 1080×1350, 1920×1080

## Files written fresh in this session
- `app/index.html`, `app/style.css`
- `app/src/cover.js` — renderer (layouts, grades, drawCover, panelAt)
- `app/src/main.js` — UI wiring, uploads, drag-pan, export, `?shot=` scenes
- `main.ts` — entry program (copies app/ + screenshots/, writes dossier.json)
- `shots.json`, `README.md` (from live readme_template), `.makefun/owner.json`
- Fonts downloaded fresh this session: `app/fonts/anton.woff2`,
  `app/fonts/pacifico.woff2` + OFL licence texts (SIL OFL 1.1)
- Screenshots: 4 fresh renders from this app via headless Chromium

## Fix made during this build
Long titles overflowed the caption band ("BOULEVARD QUEEN" cut off in the
editor shot). `paintCaption` in `app/src/cover.js` now measures the title and
scales the font down to fit the band width. Re-shot once after the fix.

## Verification (2026-11-20 ~03:41 WIB)
- `MAKEFUN_OUTPUT_DIR=/tmp/out1 node main.ts` and `/tmp/out2`: `diff -r`
  identical — deterministic.
- dossier.json 858,828 bytes (< 1.5 MiB cap).
- app/: 10 files, 199,176 bytes (< 993 files / 48 MiB).
- Screenshots: 4 JPEGs, 112–199 KiB each (< 256 KiB); sizes 1080×1080,
  1280×800, 1080×1080, 1280×720 (long side ≤ 1280, short side ≥ 480).
- No `http(s)://` references in app source; all fonts/images local under app/.
- Screenshots visually checked: cover (grid/sunset), editor (strip/neon),
  cover (trio/vice). Title fits after the fix.

## Not done here (parent's job)
- No login, no submit, no GitHub repo created, no push.
- Recording NOT stopped by this session.
