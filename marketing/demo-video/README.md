# Octolio Demo Video — "Review, Tools & Friends" launch trailer

A 30-second vertical (9:16) launch trailer built with [Remotion](https://www.remotion.dev/), showcasing the three new features shipped to `app.octolio.me`.

| | |
|---|---|
| Format | MP4 (H.264) |
| Resolution | 1080×1920 (vertical, 9:16) |
| Duration | 30 seconds @ 30 fps (900 frames) |
| Audio | None — subtitled |

Perfect for TikTok, Instagram Reels, YouTube Shorts, and the marketing site hero.

## Scene breakdown

| Scene | Time | Frames | What you see |
|---|---|---|---|
| Intro | 0.0 – 3.0s | 0–90 | Logo zoom-in, "🚀 BIG UPDATE" pill, "Three new features. One launch." |
| Review | 3.0 – 10.0s | 90–300 | Mock phone of the `/review` page cycling through 3 cards with progress bar + Leitner box level. Subtitle: "New · Review — Never forget what you got wrong" |
| Tools | 10.0 – 18.0s | 300–540 | Calculator carousel: Compound → Mortgage → FIRE, with sliders pulsing and result number counting up. Subtitle: "New · Tools — 6 calculators to use what you learn" |
| Friends | 18.0 – 26.0s | 540–780 | Search bar types "s1nbros", "+ Add" button morphs to "✓ Sent", then friend-list view appears with a glowing "s1nbros just overtook you!" notification card. Subtitle: "New · Friends — Race friends. Get notified." |
| Outro | 26.0 – 30.0s | 780–900 | Logo bob, "Try it now", `app.octolio.me` pill |

## Run it

```bash
cd marketing/demo-video
npm install

# Live preview in the browser (recommended workflow)
npm run studio

# Render to MP4 (writes out/octolio-update.mp4)
npm run render

# Single still frame (poster) — defaults to frame 30 of the intro
npm run still
```

Output appears at `marketing/demo-video/out/octolio-update.mp4`.

Render time on an M-series Mac: ~30 seconds for the full 30s clip.

## How it's built

```
marketing/demo-video/
├── package.json          npm scripts + remotion deps
├── remotion.config.ts    H.264 / yuv420p config (broad device support)
├── tsconfig.json
├── public/
│   └── logo.png          copied from the app's public/ for brand consistency
└── src/
    ├── index.ts          registers the Root
    ├── Root.tsx          declares the OctolioUpdate composition
    ├── DemoVideo.tsx     5-scene Series timeline + canvas dimensions
    ├── theme.ts          color palette mirroring frontend/src/index.css dark mode
    ├── components/
    │   ├── Background.tsx  animated gradient + drifting orbs
    │   ├── PhoneFrame.tsx  stylized iPhone bezel
    │   └── Subtitle.tsx    eyebrow pill + bold caption with spring entry
    └── scenes/
        ├── Intro.tsx
        ├── ReviewScene.tsx
        ├── ToolsScene.tsx
        ├── FriendsScene.tsx
        └── Outro.tsx
```

The phone-frame mocks use the **exact** color tokens from `frontend/src/index.css` (mirrored in `src/theme.ts`), so the trailer matches the real product look.

## Editing tips

- **Change a scene's duration:** edit `D.{intro,review,tools,friends,outro}` in `src/DemoVideo.tsx`. The `DURATION_FRAMES` total auto-updates.
- **Swap a subtitle:** edit the `text` / `eyebrow` props on the `<Subtitle>` at the bottom of each scene file.
- **Different aspect ratio:** change `WIDTH` / `HEIGHT` in `DemoVideo.tsx` (e.g. `1920×1080` for landscape YouTube).
- **Add background music:** add `<Audio src={staticFile('bgm.mp3')} />` inside the `OctolioUpdate` component in `DemoVideo.tsx`.

## Rendering a different format

```bash
# Square 1:1 — set WIDTH=HEIGHT=1080 in DemoVideo.tsx first
npm run render

# GIF (great for embedding in PRs / Slack)
npx remotion render OctolioUpdate out/octolio-update.gif --codec=gif

# WebM (smaller for web)
npx remotion render OctolioUpdate out/octolio-update.webm --codec=vp9
```

## License

Same as the parent repo.
