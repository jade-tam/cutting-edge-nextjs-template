# create-cutting-edge-nextjs-app

Stop wasting time debating which libraries to use, wrestling with outdated boilerplate, or untangling configurations that made sense six months ago. This CLI scaffolds a modern Next.js project with a carefully chosen, human-configured tech stack — so you start with a solid foundation instead of technical debt.

## Quick start

```bash
pnpm create cutting-edge-nextjs-app@latest
# or
npx create-cutting-edge-nextjs-app@latest
# or
yarn create cutting-edge-nextjs-app
# or
bunx create-cutting-edge-nextjs-app@latest
```

> Requires Node.js 20+

## Why this template?

### 🎯 Handpicked libraries
Not just popular ones, but the *right* ones. Each was chosen after evaluating the ecosystem and reading the latest docs.

### ⚙️ Human-configured
Every integration is set up correctly from the start, following current best practices rather than what an AI trained on last year's code thinks is correct.

### 🚀 Covers real-world needs
Marketing pages with SEO, content routes, and CSR dashboard patterns. Not a toy "Hello World" but an architecture you'd actually build a product on.

### 🤖 AI-ready from day one
Ships with explicit project structure rules (`CLAUDE.md`, `docs/project-structure.md`) so AI assistants can place code consistently and follow your conventions without constant correction.

## Tech stack

| Category | Library |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS 4 + DaisyUI |
| Server State | TanStack Query |
| Forms | TanStack Form |
| Validation | Zod |
| i18n | next-intl |
| Component Dev | Storybook 10 |
| Icons | Iconify (Fluent + Simple Icons) |

## What's included

- Next.js 16 App Router with React 19 and TypeScript strict mode
- Tailwind CSS 4 + DaisyUI preconfigured with PostCSS
- `next-intl` locale routing (`en`, `vi`) with route groups for clean URLs
- SEO baseline: `generateMetadata`, `sitemap.xml`, `robots.txt`, favicon
- CSR dashboard examples using TanStack Query + TanStack Form + Zod
- Storybook configured with `@storybook/nextjs` framework
- React Compiler enabled in `next.config.ts`
- Project structure documentation and AI contributor contract (`CLAUDE.md`)
- Env/logger conventions (`lib/env/*`, `lib/logger/*`) for safer changes

## Architecture

The template uses Next.js App Router with route groups for clear boundaries:

- **(marketing)** — landing page, public content with SEO
- **(content)** — about, blog pages
- **(dashboard)** — CSR management UI with TanStack Query patterns

Route groups are organizational only. URLs stay clean: `/`, `/about`, `/blog`, `/dashboard`.

## Generated app structure

```txt
app/
  [locale]/
    (marketing)/
      page.tsx
    (content)/
      about/page.tsx
      blog/page.tsx
      blog/[slug]/page.tsx
    (dashboard)/
      dashboard/page.tsx
components/
i18n/
messages/
providers/
docs/
  project-structure.md
CLAUDE.md
```

## Scripts in generated app

```bash
pnpm dev                # Start dev server
pnpm build              # Production build
pnpm start              # Serve production build
pnpm lint               # Run ESLint
pnpm storybook          # Start Storybook on :6006
pnpm build-storybook    # Build static Storybook
```

## For template maintainers

```bash
pnpm dev        # Watch CLI source
pnpm build      # Build CLI to dist/
pnpm typecheck  # Type-check
```