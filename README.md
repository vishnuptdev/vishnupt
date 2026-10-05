# The Control Room — cinematic portfolio of Vishnu Payyannur Thotten

A single-page, scroll-driven 3D film: one continuous WebGL corridor runs behind every
chapter, the camera hands forward scene to scene and never resets. Seven chapters —
cold open, the brief, stack, commits, side quests, roots, ping — each with its own
motion machine (split-flap board, filmstrip dolly, slab covers, terminal ticker,
pixel-resolve portrait). Scroll is the camera; the cursor is a light source.

## Run

```bash
npm install
npm run dev        # Vite dev server (port printed in terminal)
npm run build      # typecheck (tsc -b) + production build → dist/
npm run preview    # serve the production build locally
npm run lint       # eslint
npm run format     # prettier
```

## Docker

```bash
docker build -t control-room .
docker run -d -p 8085:80 control-room
```

Two-stage image: Node 22 builds `dist/`, nginx:alpine serves it.

## Stack

Vite 7 · React 18 · TypeScript (strict) · Tailwind CSS v4 · Framer Motion ·
GSAP + ScrollTrigger · anime.js v4 · hand-written GLSL raymarcher (no three.js).
Instrument Serif + JetBrains Mono, self-hosted via Fontsource.

## Structure

```
src/components/   one motion machine per chapter + global rigs (HUD, scroll, cursor)
src/gl/world.ts   the corridor: raymarched monoliths, fog, ribbon, wet floor
src/content/      typed resume facts — single source for every string on the page
content/          profile.md, the human-readable source of truth for src/content
public/           favicon, robots, sitemap, 404
```

## Content policy

Every fact, date, bullet and link on the page comes from `content/profile.md`
(the owner's resume). Nothing is invented: values that are not known yet render as
visible `[TODO: …]` markers instead of placeholder numbers.

## Accessibility

Real anchors and buttons per chapter, keyboard and screen-reader paths intact,
skip link, AA contrast, and a full `prefers-reduced-motion` path that lands every
chapter on its settled composition.

## License

MIT © 2026 Vishnu Payyannur Thotten — see [LICENSE](LICENSE).
