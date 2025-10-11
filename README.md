# Personal Site — nassim-arifette.github.io

Clean, fast personal website built with Next.js (App Router), Contentlayer, Tailwind CSS, and MDX. The site is statically exported and deployed to GitHub Pages via GitHub Actions.

## Overview
- Static export with `next export` (output in `out/`)
- MDX content for blog posts and projects via Contentlayer
- Dark/light theme with `next-themes`
- Pretty code blocks using `rehype-pretty-code` + Shiki
- SEO helpers, sitemap and robots routes
- GitHub Pages deployment workflow included

## Tech Stack
- `next@13` (App Router) • `react@18`
- `contentlayer` + `next-contentlayer` for MDX content
- `tailwindcss@3` (+ `@tailwindcss/typography`, `tailwindcss-animate`)
- `rehype-pretty-code`, `remark-gfm`, `rehype-sanitize`

## Requirements
- Node.js 20+
- A package manager: `pnpm` (recommended) or `npm`

## Getting Started
1) Install dependencies
   - pnpm: `pnpm install`
   - npm: `npm install`

2) Run the dev server
   - pnpm: `pnpm dev`
   - npm: `npm run dev`
   
   Then open http://localhost:3000

3) Optional: set local env (recommended for correct absolute URLs)
   - Create `.env.local` with:
     - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

## Build & Export
- Production build: `pnpm build` (or `npm run build`)
- Static export: `pnpm export` (or `npm run export`)
- The exported site is written to `out/` and can be served on any static host (including GitHub Pages).

Notes for static hosting:
- `next.config.mjs` sets `output: 'export'`, `images.unoptimized: true`, and `trailingSlash: true` for GitHub Pages compatibility.
- If deploying to a project page (e.g., `username.github.io/repo`), set `NEXT_PUBLIC_BASE_PATH=/repo` during build. The workflow config does this automatically.

## Content
Content lives in `content/` and is typed by Contentlayer:
- Blog posts: `content/posts/**/*.mdx`
- Projects: `content/projects/**/*.mdx`

Frontmatter for posts:
```mdx
---
title: "Post title"
date: "2025-01-01"
description: "Short summary"
tags: ["tag-a", "tag-b"]
published: true
---

Your MDX content...
```

Frontmatter for projects:
```mdx
---
title: "Project title"
date: "2025-01-01"
description: "Short blurb"
tags: ["tech", "domain"]
featured: false
links: { github: "https://github.com/...", website: "https://...", demo: "...", paper: "...", pdf: "..." }
---

Your MDX content...
```

Available fields and computed URLs are defined in `contentlayer.config.ts`.

## MDX & Components
- MDX is rendered with `next-contentlayer`. Custom elements/styles live in `components/mdx/`.
- GitHub-flavored Markdown is enabled via `remark-gfm`.
- Code blocks use `rehype-pretty-code` + Shiki; theme is forced to dark for readability. See `app/globals.css` for styles.

Use Markdown as usual; you can also include JSX components defined in `components/mdx/mdx-components.tsx`.

## Theming
- Dark mode is class-based via `next-themes`.
- Toggle lives in `components/theme-toggle.tsx`. Design tokens are defined as CSS variables in `app/globals.css` and mapped in `tailwind.config.ts`.

## SEO
- Canonicals and absolute URLs are derived from `NEXT_PUBLIC_SITE_URL` (helpers in `lib/seo.ts`).
- `app/sitemap.ts` and `app/robots.ts` are generated from content + static routes.
- Set `NEXT_PUBLIC_SITE_URL` in CI for accurate links; the GitHub Action does this.

## CV Page
- Place a PDF at `public/cv.pdf` to enable download and the embedded viewer at `/cv`.

## Deployment (GitHub Pages)
This repo includes `.github/workflows/deploy.yml` to build and deploy on pushes to `main`:
- Installs Node 20 and dependencies
- Configures `NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_SITE_URL` depending on whether the repo is `username.github.io` or a project repo
- Runs `next build` and `next export`
- Uploads the `out/` directory to GitHub Pages

First-time setup:
1) Ensure GitHub Pages is set to "Deploy from a GitHub Actions workflow" in repository settings.
2) Push to `main`. The site will publish automatically.

## Commands
- `pnpm dev` / `npm run dev` — Run development server
- `pnpm build` / `npm run build` — Production build
- `pnpm export` / `npm run export` — Static export to `out/`
- `pnpm start` / `npm start` — Start Next.js server (not used for static hosting)

## Testing
- `pnpm test` / `npm test` — Run unit tests once (Vitest)
- `pnpm test:watch` / `npm run test:watch` — Watch mode

Note: if dependencies aren’t installed yet, run `pnpm install` (or `npm install`).

Continuous Integration:
- GitHub Actions (`.github/workflows/test.yml`) runs `pnpm test` on pushes and pull requests targeting `main`.

## Project Structure
- `app/` — App Router pages, layout, sitemap/robots
- `components/` — UI, MDX components, layout chrome
- `content/` — MDX sources for posts and projects
- `lib/` — Utilities (date formatting, SEO helpers, MDX preview)
- `public/` — Static assets (e.g., `cv.pdf`)
- `.github/workflows/deploy.yml` — GitHub Pages deployment workflow
- `next.config.mjs` — Static export, base path, and MDX integration

## Environment Variables
- `NEXT_PUBLIC_SITE_URL` — Absolute site URL (e.g., `https://username.github.io` or `https://username.github.io/repo`). Used for SEO and sitemaps.
- `NEXT_PUBLIC_BASE_PATH` — Base path when deploying to a project page (e.g., `/repo`). Empty for `username.github.io`.

Locally, you can omit these. In CI, the workflow sets both automatically based on repository name.

## Notes & Limitations
- Images are unoptimized (`images.unoptimized: true`) because GitHub Pages cannot run the Next.js image optimizer.
- `trailingSlash: true` avoids 404s on nested static routes in GitHub Pages.

## License
No explicit license file is provided. If you intend to reuse substantial parts of this site, please ask the author or add a suitable LICENSE file.
