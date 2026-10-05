# The Control Room — cinematic portfolio of Vishnu Payyannur Thotten

A single-page, scroll-driven 3D film: one continuous WebGL corridor runs behind every
chapter, the camera hands forward scene to scene and never resets. Seven chapters —
cold open, the brief, stack, commits, side quests, roots, ping — each with its own
motion machine (terminal ticker, filmstrip dolly, slab covers, flight paths,
ember finale). Scroll is the camera; the cursor is a light source.

## Run

```bash
npm install
npm run dev        # Vite dev server (port printed in terminal)
npm run build      # typecheck (tsc -b) + production build → dist/
npm run preview    # serve the production build locally
npm run lint       # eslint
npm run format     # prettier
npm run resume     # regenerate public/resume.pdf from src/content (facts, same order)
```

## Docker

```bash
docker build -t control-room .
docker run -d -p 8085:80 control-room
```

Two-stage image: Node 22 builds `dist/`, nginx:alpine serves it.

## Deploying

### Vercel

1. Push this repo to GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
   Framework preset **Vite**; build command `npm run build`, output directory `dist` —
   Vercel auto-detects all three.
3. Deploy. The site is live at `https://<project-name>.vercel.app` (the free Vercel
   subdomain — no domain needed to start).

### Custom domain

1. Project → **Settings → Domains** → add your domain (e.g. `yourname.dev`).
2. At your registrar, add the DNS records Vercel shows in that dialog —
   typically an **A** record on the apex and **CNAME** `cname.vercel-dns.com` on `www`.
3. Vercel issues the TLS certificate automatically once DNS resolves — usually minutes.

### CI/CD (GitHub Actions)

`.github/workflows/deploy.yml` runs the build on every push and PR, and deploys to the
Vercel **production** environment on every push to `main`. One-time setup — add three
repo secrets under **Settings → Secrets and variables → Actions**:

| Secret | Where to get it |
| --- | --- |
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens → create |
| `VERCEL_ORG_ID` | run `npx vercel link` once locally, then read `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | same file |

After that: `git push` to main → deployed automatically, nothing manual.

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
tools/            make-resume.mts — typesets public/resume.pdf from src/content
public/           favicon, robots, sitemap, 404, resume.pdf
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
