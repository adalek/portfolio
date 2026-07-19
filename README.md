# Xuwen Dong Portfolio

Recruitment-focused portfolio site built with Astro and Markdown content collections.

## Local Development

```bash
pnpm install
pnpm run dev
```

## Build

```bash
pnpm run build
pnpm run preview
```

## Content Editing

Projects live in `src/content/projects/*.md`.

Blog posts live in `src/content/blog/*.md`.

Each project Markdown file contains structured frontmatter for title, year, category, role, tools, cover image, links, and media. The homepage and Work archive are generated automatically from this data.

## Vercel

Recommended settings:

- Framework Preset: Astro
- Install Command: `pnpm install`
- Build Command: `pnpm run build`
- Output Directory: `dist`

