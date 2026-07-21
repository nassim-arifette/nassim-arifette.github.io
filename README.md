# Nassim Arifette — Portfolio

Static research portfolio built with Next.js, Contentlayer, Tailwind CSS, and MDX. It is deployed to the root GitHub Pages site at `nassim-arifette.github.io`.

## Requirements

- Node.js 20 (`.nvmrc` is included)
- npm 10

Use the committed `package-lock.json`; this repository intentionally uses one package manager.

## Local development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run content:build` | Generate typed Contentlayer data |
| `npm run generate:feed` | Generate RSS and JSON feeds |
| `npm run generate:og` | Generate social preview images |
| `npm run build` | Generate content/assets and export the static site to `out/` |

Set `NEXT_PUBLIC_SITE_URL` when testing canonical URLs against a non-production host. It defaults to `https://nassim-arifette.github.io`.

## Repository structure

```text
app/                    Next.js App Router pages and metadata
components/
  blog/                 Blog listing and reading UI
  cards/                Project and post summaries
  filters/              Search/filter controls
  mdx/                  MDX rendering, code, TOC, and images
  series/               Series navigation and progress
  tags/                 Tag links
  ui/                   Shared primitives that are actually reused
content/
  posts/<series>/       Blog posts and optional _series.mdx manifests
  projects/             Project case studies
lib/                    Content indexes, SEO, search, tags, and relations
public/                 CV, project reports, media, feeds, and OG images
scripts/                Feed and OG generation
```

Generated directories such as `.contentlayer/`, `.next/`, `out/`, and `.vitest/` are ignored.

## Content

Posts belong in `content/posts/**/*.mdx`:

```mdx
---
title: "Post title"
date: "2025-01-01"
description: "Short summary"
tags: ["tag-a", "tag-b"]
published: true
---
```

Projects belong in `content/projects/*.mdx`:

```mdx
---
title: "Project title"
date: "2025-01-01"
description: "Short summary"
tags: ["domain", "method"]
featured: false
links: { github: "https://github.com/...", pdf: "/project-report.pdf" }
---
```

Place public reports at `public/<descriptive-kebab-case-name>.pdf` and reference them with root-relative URLs. Avoid placeholder links: omit unavailable fields until the real destination exists.

Series manifests use `content/posts/<series>/_series.mdx`. Posts in that folder are included automatically unless the manifest defines an explicit `parts` order.

## Build pipeline

`npm run build` performs these steps in order:

1. Generate Contentlayer documents.
2. Generate RSS/JSON feeds and per-document OG images.
3. Run the Next.js production build and static export.

The order matters: generated public assets must exist before Next.js copies `public/` into `out/`.

## Deployment

`.github/workflows/deploy.yml` installs with `npm ci`, builds the static export, and deploys `out/` to GitHub Pages on pushes to `main`.

`.github/workflows/test.yml` runs the unit tests for pushes and pull requests.

## Notes

- Images are unoptimized because GitHub Pages has no Next.js image server.
- Nested routes use trailing slashes for static-host compatibility.
- There is no project license. Add one before allowing reuse beyond normal viewing and contribution.
