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
Marketing/public pages with SEO plus CSR dashboard patterns. Not a toy "Hello World" but an architecture you'd actually build a product on.

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
- Production-ready SEO setup: centralized SEO config, metadata helpers, `sitemap.xml`, `robots.txt`, social images
- React View Transitions-based page transition shell with configurable transition presets
- Modern marketing/public experience: redesigned navbar and refreshed public pages (home, pricing, solutions, contact)
- Pure CSR dashboard architecture with role-aware navigation and client bootstrap boundaries
- Admin user management module with table UX, role/status mutations, and bulk actions
- Profile settings and avatar management flows (upload, optimize, delete)
- Rich example entity CRUD module with improved data table UX patterns
- Storybook configured with `@storybook/nextjs` framework
- React Compiler enabled in `next.config.ts`
- Project structure documentation and AI contributor contract (`CLAUDE.md`)
- Env/logger conventions (`lib/env/*`, `lib/logger/*`) for safer changes
- Extensive unit/integration/e2e coverage across auth, SEO, transitions, dashboard, entities, and user management

## Architecture

The template uses Next.js App Router with route groups for clear boundaries:

- **(marketing)** — branded landing and campaign-oriented presentation pages
- **(public)** — public business pages (pricing, solutions, contact)
- **(auth)** — authentication and access-control pages
- **(dashboard)** — pure CSR management UI with role-aware shell, transitions, and TanStack Query patterns

Route groups are organizational only. URLs stay clean: `/`, `/pricing`, `/solutions`, `/contact`, `/dashboard`.

## Generated app structure

```txt
app/
  [locale]/
    (marketing)/
      page.tsx
    (public)/
      pricing/page.tsx
      solutions/page.tsx
      contact/page.tsx
    (auth)/
      login/page.tsx
      register/page.tsx
      forgot-password/page.tsx
    (dashboard)/
      dashboard/page.tsx
      dashboard/users/page.tsx
      dashboard/profile/page.tsx
      dashboard/settings/page.tsx
components/
features/
lib/
config/
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
