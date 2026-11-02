# Demo film

The 3-minute submission film: motion graphics (Remotion) + real footage of the app. Screenplay and decisions: `docs/DEMO_VIDEO_SCREENPLAY.md`.

Separate from the app: own `package.json`, never imported by `src/`, outside the app's tsconfig and lint scope. Brand assets are read from the repo originals (`design/brand/mascots/`, `public/brand/`), not copied.

## Watch and edit
```bash
cd design/film
npm install
npm run dev          # http://127.0.0.1:5174  viewer with scrubber, scene jumps, sound (?t=95 opens at 1:35)
npm run typecheck
npx remotion render src/remotion.tsx Film public/out/innermirror-roughcut.mp4   # 1080p30 MP4
```

## Rebuild the generated parts (all git-ignored)
| Step | Command | Cost |
|---|---|---|
| Synthetic chat screenshots | `node shots/render.mjs` | $0 |
| Dry-run take (all `/api/*` mocked) | app on :3124 with `META_API_KEY=`, then `node record/take.mjs --mock dry` | $0 |
| Live take | app on :3125 with `APP_SPEND_CAP_USD=0.15`, then `APP_URL=http://localhost:3125 node record/take.mjs --live live1` | ≈ $0.06 |
| Take → 30 fps MP4 + cue times | `node record/encode.mjs live1` | $0 |
| Placeholder sound | `node record/sfx.mjs` | $0 |

`record/take.mjs` drives the real app in headless Chrome (1280 × 720) and records a CDP screencast plus marks and tap positions; `src/Footage.tsx` cuts the film from those marks. A new take needs no code change if the flow is the same.

## Layout
- `src/story.ts`: scene timing and the conversation, with Muse's real readings from the live take.
- `src/scenes/`: Opening (S1, S4, S5), Storm (S2 + S3), Demo (S6, real footage), River (S7), Closing (S8 donut footage → network, S9).
- `src/Footage.tsx`: segments of the take, speed-ups (labelled), zooms, tap rings and tap sounds.
- `src/Sound.tsx`: every sound cue; files come from `record/sfx.mjs` (synthesized, no licences).

**On-screen labels:** ILLUSTRATION = motion; REAL APP = the live take. Remotion is free for individuals and companies of up to 3 people (remotion.dev/license).
