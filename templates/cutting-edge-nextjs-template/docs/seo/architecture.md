# SEO Architecture

## Scope
This project indexes only public marketing/content pages. Dashboard and internal utility routes are excluded from indexing and sitemap.

## Core files
- `config/seo.ts`: canonical URL, locale alternates, social image paths, absolute URL builders
- `lib/seo/schema.ts`: JSON-LD builders (`WebSite`, `Organization`, `WebPage`)
- `app/[locale]/layout.tsx`: locale-aware metadata + JSON-LD wiring
- `app/[locale]/(dashboard)/dashboard/layout.tsx`: dashboard noindex/nofollow
- `app/robots.ts`: crawl policy
- `app/sitemap.ts`: public-only localized sitemap
- `app/manifest.ts`: PWA manifest

## Canonical domain policy
Use one apex canonical domain from `NEXT_PUBLIC_BASE_URL`. All metadata URLs, sitemap URLs, and social image URLs are absolute and derived from this value.

## Environment keys
- `NEXT_PUBLIC_BASE_URL` (required)
- `GOOGLE_SITE_VERIFICATION` (required)
- `BING_SITE_VERIFICATION` (optional)

These are validated in `lib/env/schema.ts` and consumed via `lib/env/server.ts`.

## Public-only indexing policy
Indexed routes:
- `/`
- `/pricing`
- `/solutions`
- `/contact`
- localized variants under `/vi/...`

Excluded from indexing/sitemap:
- `/dashboard/**`
- `/api/**`
- authenticated/internal workflows

## Required metadata assets (replace before production launch)
- `/og-default-1200x630.png`
- `/twitter-default-1200x630.png`
- `/apple-touch-icon.png`
- `/icon-192.png`
- `/icon-512.png`

## New page SEO contract
- Public pages must define route-appropriate metadata.
- Public pages must be evaluated for sitemap inclusion.
- Internal/auth pages must stay non-indexable.
- Localized pages must preserve canonical + hreflang consistency.
- Share-intended pages must reference real OG images.

## Pre-launch checklist
1. Set canonical apex URL env values.
2. Replace verification tokens.
3. Replace placeholder social/PWA assets.
4. Validate robots + sitemap output.
5. Validate canonical/hreflang/OG/Twitter metadata on key public pages.
6. Submit sitemap in Search Console and monitor indexing/canonical reports.