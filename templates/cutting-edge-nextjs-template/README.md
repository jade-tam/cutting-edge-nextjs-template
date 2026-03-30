# Next.js Boilerplate Template

A clean, locale-ready Next.js App Router starter that keeps SEO scaffolding and includes practical CSR dashboard examples using TanStack Query + TanStack Form.

## Features

- Next.js 16 App Router
- `next-intl` locale routing (`en`, `vi`)
- Route groups for clear app boundaries
- Configurable landing-page render mode (Static / ISR / SSR)
- CSR dashboard examples with REST integration patterns
- SEO baseline (`generateMetadata`, `sitemap.xml`, `robots.txt`, favicon/icons)

## Route Structure

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
      dashboard/
        page.tsx
        users/page.tsx
        users/create/page.tsx
```

Route groups are organizational only. URL paths stay clean:
- `/`, `/vi`
- `/about`, `/vi/about`
- `/blog`, `/vi/blog`
- `/dashboard`, `/vi/dashboard`

## Getting Started

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `example.env` to `.env.local` and fill values:

```env
NEXT_PUBLIC_BASE_URL=https://example.com
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=
```

`NEXT_PUBLIC_BASE_URL` is used for metadata, canonical URLs, sitemap, and robots.

## Landing Render Mode Options

Use one of these in `app/[locale]/(marketing)/page.tsx`.

### Static (default)

```ts
// no segment export needed
```

### ISR

```ts
export const revalidate = 3600;
```

### SSR latest data

```ts
export const dynamic = "force-dynamic";
// and use fetch(..., { cache: "no-store" }) in server-component data calls
```

## CSR Dashboard Data/Form Pattern

- Query provider: `app/providers/tanstack-query-provider.tsx`
- API client: `lib/api/client.ts`
- Endpoint module: `lib/api/users.ts`
- Query hooks: `lib/hooks/queries/*`
- Mutation hooks: `lib/hooks/mutations/*`
- Form component: `app/components/forms/UserForm.tsx`

## API Integration Guide

See `docs/api-integration.md` for concrete REST payload examples and extension steps.

## SEO Placeholder Checklist (Before Production)

Replace all placeholders before go-live:

- `NEXT_PUBLIC_BASE_URL`
- `metadata.verification.google`
- metadata title/description in `messages/*.json`
- `public/logo.png` with your OG/social image
- JSON-LD values in `app/[locale]/layout.tsx`

## Project Structure Guideline

For folder ownership, code placement, env/logger conventions, and AI contributor rules, see:

- [docs/project-structure.md](docs/project-structure.md)
- [CLAUDE.md](CLAUDE.md)

## Storybook

This project is configured with Storybook using the `@storybook/nextjs` framework.

### Run Storybook locally

```bash
pnpm storybook
```

Open `http://localhost:6006`.

### Build static Storybook

```bash
pnpm build-storybook
```

### Included example stories

- `components/Button.stories.tsx`
- `components/dashboard/DashboardShell.stories.tsx`

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm start
pnpm storybook
pnpm build-storybook
```
