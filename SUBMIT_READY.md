# SUBMIT READY — gta6-cover-art-01 (status: package complete under recording, submission needs repo + seal)

## Package — ready

- Work dir: `~/workspace/goals/make-fun-bounty-submissions/work/gta6-cover-art-01-recorded2/`
- Code commit: `24c5c7a206118e320070efd5c2ac9504d4fcc682` (root commit, 25 files, branch main, not pushed)
- Docs commit: NOTES.md + SUBMIT_READY.md on top of the code commit — submit the HEAD commit on main (its SHA is in the parent agent's report for this session)
- Recording id: `01a1f5ef-6e66-7697-891b-67c035304120` (started before this build session; parent seals it)
- This session's agent id: `c0523403-d0a7-4fb3-abc5-8b5b3a333c8a`
- Title: **Neon Shore Cover Studio**
- Deadline: **Sat 2026-11-21 17:30 WIB** (2026-11-21T10:30:00Z)
- Verified: main.ts run twice → byte-identical outputs; all gate limits pass;
  kit `check` on the commit → 4 passed, 0 failed; 4 screenshots visually
  inspected; real export click at 1920×1080 produced a valid PNG
  (2,879,703 bytes). Details in NOTES.md.

## What still blocks submission (in order)

### 1. Recording — seal it (parent's step, not this session's)
- The recording is still running. Seal it from the parent session after this
  build session ends: `kill "$(cat ~/.makefun/record-gta6-cover-art-01.pid)"`,
  then wait until `~/.makefun/record-gta6-cover-art-01.log` says
  `recording 01a1f5ef-6e66-7697-891b-67c035304120 sealed at <time>`.
- Do NOT fake a recording id. Do NOT submit without the sealed id — the form
  requires `recording_ids` and this competition takes no transcript upload.
- Login is already complete (Bos approved connect code TPSP-LFFD himself
  ~00:43 WIB; API key in `~/.makefun/credentials`, CLI profile @wasu-tenan).

### 2. GitHub repo — does not exist yet
- Create a NEW public repo **wasu-tenan/neon-shore-cover-studio** (must be created
  after the opening 2026-11-19 17:30 WIB — creating it now satisfies this), push
  the HEAD commit on main.
- Set GitHub About before submitting (template in the requirements):
  `gh repo edit wasu-tenan/neon-shore-cover-studio --description 'Neon Shore Cover Studio turns your photos and a caption into a multi-panel GTA-style poster cover — Hero, Duo, Trio and Quad layouts, four Vice City colour grades, drag-to-position photos, and PNG export in 1080 × 1080, 1080 × 1350 or 1920 × 1080. Fully offline: a static web app, photos never leave your machine. Built by an AI agent for make.fun'"'"'s "Make GTA 6 Cover Art" bounty, $250 in USDC.' --homepage 'https://make.fun/bounty/gta6-cover-art-01' --add-topic 'makefun,ai-agents,bounties,games'`
  (README.md already carries the three make.fun badges with owner/repo filled in.)
- Re-download the kit first (this copy is level 26, site is at level 27):
  from the kit's parent dir: `curl -sSL "https://make.fun/c/gta6-cover-art-01/kit" | tar xz`

### 3. Pre-submit check, then submit (from inside the unpacked kit)
- `node cli/makefun.mjs check --kit . --repo <workdir>` (already run here on the
  code commit: 4 passed, 0 failed — re-run after any new commit).
- Submit (escrowed prizes → signed entry; keypair = agent wallet file
  `~/.makefun/keypairs/https_make.fun.json`, mode 600, never share its contents):
  `node cli/makefun.mjs submit --competition gta6-cover-art-01 --recording 01a1f5ef-6e66-7697-891b-67c035304120 --repo-url https://github.com/wasu-tenan/neon-shore-cover-studio --commit <HEAD sha from the parent report> --title "Neon Shore Cover Studio" --keypair ~/.makefun/keypairs/https_make.fun.json --repo <workdir>`
- Then follow it: `node cli/makefun.mjs status --submission <id>`.
- No login/submit was attempted from this build session.
