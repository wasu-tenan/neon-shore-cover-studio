# NOTES — gta6-cover-art-01 "Make GTA 6 Cover Art" (RECORDED rebuild, ROUND 2)

Build session: Fri 2026-11-20 ~05:32–05:44 WIB (Asia/Jakarta), started AFTER
recording 01a1f5ef-6e66-7697-891b-67c035304120 began. Competition opened
Thu 2026-11-19 17:30 WIB; deadline Sat 2026-11-21 17:30 WIB (2026-11-21T10:30:00Z).
Entry: "Neon Shore Cover Studio". Account @wasu-tenan, GitHub wasu-tenan.
Work dir: `~/workspace/goals/make-fun-bounty-submissions/work/gta6-cover-art-01-recorded2/`
Code commit: `24c5c7a206118e320070efd5c2ac9504d4fcc682` (single root commit, 25 files).
Branch main, NOT pushed anywhere. NOTES.md / SUBMIT_READY.md are a second commit
on top; submit the HEAD commit on main (see SUBMIT_READY.md).

This is a fresh re-derivation, written in this recorded session, of the entry
first built (unrecorded) in `../gta6-cover-art-01/` and re-derived in round 1
(`../gta6-cover-art-01-recorded/`, commit 67493ea). Round 1's recording could
not be sealed (session logs changed under it), so round 2 re-authors the same
entry under a fresh recording. Every source file was written fresh in THIS
session, in my own words and structure, from the reference as spec only — no
file was copied, moved or pasted from the reference dir or anywhere else. The
kit starter files already in the work dir (vendor/makefun-app.ts, serve.ts, the
two sample photos) were brought in before the recording started, per the kit
flow. The fonts were downloaded fresh from Google Fonts in this session, the
sample crops were re-made with PIL in this session, and the screenshots were
taken fresh by running the app in this session.

## What was built

Offline static web app (app/index.html, ES modules, no network requests, no
library) that turns photos + caption into GTA 6-style multi-panel poster art:

- 4 layouts: Hero (1 panel), Duo (2), Trio (big + 2 stacked), Quad (2×2)
- 4 colour grades: Sunset, Neon Night, Golden Hour, Noir (soft-light wash + vignette)
- Up to 4 photos, one per panel: add via file picker, click a panel to select it,
  drag in the preview to reposition, scroll to zoom, flip / centre / remove
- Caption: title in Anton (condensed display type) + script tagline in Pacifico,
  4 title colours, auto-fit sizing
- Export PNG at 1080×1080, 1080×1350, 1920×1080 (same paintCover code path as preview)
- Sample photos: kit's boulevard.jpg + pier.jpg (free to use), plus two derived
  crops made with PIL in this session from those same files (palms.jpg: left
  38% strip of boulevard, palms + sunset + red car; cast.jpg: right 48% of pier,
  rod + hands + turquoise sea) so the Trio layout shows three distinct framings.
  Both crops were visually inspected before use.
- Fonts vendored under app/fonts/ with their OFL texts: Anton-Regular.woff2,
  Pacifico-Regular.woff2 (SIL Open Font License), downloaded fresh from
  fonts.gstatic.com in this session. No Rockstar logo, wordmark, artwork,
  character or font anywhere; titles are invented ("Neon Shore",
  "Pier Pressure", "Boulevard Queen").

Files: main.ts (copies app/ + screenshots/ to /output, writes dossier.json with
the kit's buildDossier), serve.ts (kit starter, unchanged), shots.json,
vendor/makefun-app.ts (kit copy, byte for byte — sha256 verified identical to
the kit starter's copy), LICENSE (MIT, SPDX line, copyright wasu-tenan),
README.md (kit readme_template fetched fresh from the requirements API, with
repo wasu-tenan/neon-shore-cover-studio, run command `node serve.ts`,
referral code 2mmz0hmg), .makefun/owner.json with the AGENT wallet
HUKLK39fU8yRN7ZcKzZctTv61dVrHDeKBgGuZWixzT5M (never Bos's H9Zi wallet).

One genuine revision after the first full write: the export handler in
app/src/main.js now revokes its object URL 5 s after the download starts
(edited in a later turn, then re-verified with a real export click).

## Verification (all evidence local, 2026-11-20 ~05:40–05:43 WIB)

- `node --check` passes for app/src/cover.js, main.js, shots.js (ES modules).
- Screenshots taken with headless Chromium (Playwright cache build
  chromium_headless_shell-1148, via playwright-core in /tmp/shot-tool) serving
  app/ via serve.ts, using the app's own `?shot=` scenes; all 4 visually inspected:
  1-cover.jpg (1280×720, Trio/Sunset, "Neon Shore"), 2-editor.jpg (1280×720,
  editor with photos loaded), 3-cover-square.jpg (1080×1080, Hero/Neon,
  "Pier Pressure"), 4-cover-portrait.jpg (1024×1280, Duo/Gold, "Boulevard Queen").
  JPEG quality 82; sizes 102–142 KiB; zero console/page errors on every shot.
  The leftover starter screenshot 3-cover.jpg was deleted, not used.
- Export path tested with a real click, twice (before and after the revision
  edit): Export PNG at 1920×1080 → downloaded neon-shore-cover-1920x1080.png,
  2,879,703 bytes, valid PNG header, 0 errors, status "Saved neon-shore-cover-1920x1080.png".
- `main.ts` run twice (MAKEFUN_OUTPUT_DIR=/tmp/out1 and /tmp/out2): outputs
  BYTE-IDENTICAL (diff -r silent).
- Gate limits on /tmp/out1: app/ 13 files / 284,341 bytes (cap 993 / 48 MiB);
  index.html 2,839 bytes (cap 1 MiB); 4 screenshots, all ≤256 KiB, long side
  ≤1280, short side ≥480; dossier.json 688,523 bytes (cap 1.5 MiB); output total
  23 entries / 1,466,042 bytes (cap 1000 / 64 MiB). No external references in
  app/ sources (no http(s) URLs in .html/.js/.css).
- Kit check: `node cli/makefun.mjs check --kit . --repo <workdir>` on the commit
  → 4 passed, 0 failed, 16 skipped, 5 checked at submission; exit 0. It notes
  this kit copy is level 26 while the site is at level 27 — re-download the kit
  before submitting.

## Recording

Recording id: 01a1f5ef-6e66-7697-891b-67c035304120, started by the parent session
before this session began; this session built entirely under it. Do NOT stop
or seal it from here — the parent seals it after this session finishes.
This session's agent id: c0523403-d0a7-4fb3-abc5-8b5b3a333c8a (for the
usage-rows SELECT at seal time).

## Judging notes (for the parent agent)

- Judge reads the dossier's judge view: contact sheet (cover first, landscape
  shows largest — hence 1-cover.jpg is 1280×720 landscape) + source outline.
  Screenshot 1 is the strongest cover; 2 shows the editor; 3–4 show the other
  export sizes.
- Possible improvement if time allows before the deadline: add a 5th sample
  photo (a night/neon street) for the Quad layout, and a "shuffle" preset button.
  Not done now — would change the snapshot after this commit.
