# Next.js Boilerplate Template

A locale-ready Next.js App Router starter with a protected CSR dashboard, auth + example-entity CRUD, and a multi-adapter backend architecture (REST/Firebase) selected by config.

## Features

- Next.js 16 App Router
- `next-intl` locale routing (`en`, `vi`)
- Route groups for clear app boundaries
- Configurable landing-page render mode (Static / ISR / SSR)
- CSR dashboard with auth + example-entity CRUD
- Multi-adapter provider architecture selected by `DATA_PROVIDER` (`rest` | `firebase`)
- REST + Firebase providers implemented for auth + example-entity
- Sonner toasts (added 2026-04-06), themed with DaisyUI and i18n-aware API error mapping
- SEO baseline (`generateMetadata`, `sitemap.xml`, `robots.txt`, favicon/icons)
- Production SEO architecture and rollout guide in `docs/seo/architecture.md`
- TanStack Query + TanStack Form + Zod conventions for auth/example-entity flows
- Storybook coverage for shared and feature components

## Current status

- REST adapters are implemented and tested.
- Firebase adapters are implemented for auth + example-entity.
- RBAC is implemented with roles `admin | manager | user`.
- Dashboard access is restricted to `admin` and `manager`; `user` is redirected to localized `/unauthorized`.
- Deactivated users (`isActive=false`) cannot establish login/session.
- Firestore rules and indexes are configured for role-based authorization and username uniqueness query.
- Local Firebase development and E2E are emulator-first.

## RBAC behavior

- Role source of truth: `users/{uid}` in Firestore profile docs.
- Session payload includes `role`.
- Dashboard route protection:
  - Unauthenticated -> localized `/login`
  - Authenticated with role `user` (or missing/invalid role) -> localized `/unauthorized`
  - Authenticated with role `admin|manager` -> allowed
- Example-entity CRUD is protected by Firestore rules (`admin|manager` + active profile).

## Deactivated account behavior

- Login/session checks evaluate profile `isActive`.
- When `isActive=false`, auth API returns `account_deactivated` and denies session.
- Session route clears auth cookie for invalid/deactivated sessions.

## Firebase Emulator workflow

Local Firebase usage should run through emulator for predictable testing.

### Emulator commands

```bash
pnpm emulator
pnpm emulator:seed
```

- `pnpm emulator` starts Firestore emulator using `firebase.json`.
- `pnpm emulator:seed` seeds role-based user profiles for local/E2E test flows.

### Emulator env toggle

- Default in `example.env`: `USE_FIREBASE_EMULATOR=true`
- Firestore client connects to emulator when:
  - `NODE_ENV !== production`
  - `USE_FIREBASE_EMULATOR !== false`

### Rules/index deployment flow

Local config files:
- `firestore.rules`
- `firestore.indexes.json`
- `firebase.json`

Deploy to production with Firebase CLI (example):

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Ensure production project ID in `.firebaserc`/CLI context before deploy.

## Unauthorized page

Localized unauthorized route:
- `/unauthorized`
- `/vi/unauthorized`

Uses i18n keys under `pages.unauthorized.*`.

## Username uniqueness

Username uniqueness is enforced in Firebase auth provider via Firestore query on `users.username` and backed by Firestore index configuration.

## Testing expectations for RBAC/auth changes

For auth/dashboard/RBAC changes, run at minimum:

```bash
pnpm lint
pnpm test
pnpm test:e2e:auth
pnpm test:e2e tests/e2e/example-entity/example-entity-crud.spec.ts
```

Role-based E2E coverage is included in `tests/e2e/auth/auth-role-based-access.spec.ts`.

## Adapter implementation status

- ✅ REST auth + example-entity adapters implemented
- ✅ Firebase auth + example-entity adapters implemented
- ✅ RBAC roles (`admin|manager|user`) implemented
- ✅ Dashboard role gate (`admin|manager` only) with localized unauthorized page
- ✅ Deactivated-account login/session rejection implemented
- ✅ Firestore rules + indexes + emulator baseline configured

## Route Structure

```txt
app/
  [locale]/
    (auth)/
      login/page.tsx
      register/page.tsx
      forgot-password/page.tsx
    (public)/
      page.tsx
      solutions/page.tsx
      pricing/page.tsx
      contact/page.tsx
    (dashboard)/
      dashboard/
        page.tsx
        example-entities/
          page.tsx
          new/page.tsx
          [id]/page.tsx
          [id]/edit/page.tsx
```

Route groups are organizational only. URL paths stay clean:
- `/`, `/vi`
- `/login`, `/vi/login`
- `/register`, `/vi/register`
- `/dashboard`, `/vi/dashboard`
- `/dashboard/example-entities/new`, `/vi/dashboard/example-entities/new`
- `/dashboard/example-entities/[id]/edit`, `/vi/dashboard/example-entities/[id]/edit`

CRUD routing conventions:
- Create: `/new`
- Edit: `/[id]/edit`
- Delete: confirmed action from list/detail (no `/delete` page)

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
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
DATA_PROVIDER=rest
AUTH_COOKIE_NAME=dashboard_session
REST_API_BASE_URL=http://localhost:3001/api
USE_FIREBASE_EMULATOR=true
```

`NEXT_PUBLIC_BASE_URL` is used for metadata, canonical URLs, sitemap, and robots.

## SEO setup

See `docs/seo/architecture.md` for canonical domain policy, public-only indexing scope, required metadata assets, and pre-launch validation checklist.

### Provider switch

Set `DATA_PROVIDER` to choose active adapter:
- `rest`: use REST adapters for auth + example-entity
- `firebase`: use Firebase adapters for auth + example-entity

Current status:
- REST adapters are implemented and tested.
- Firebase adapters are implemented for auth + example-entity.

### Firebase env values

When `DATA_PROVIDER=firebase`, all 4 Firebase values are required by env schema:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

You can copy them from Firebase Console → Project settings → Your apps → Web app config.
If these are missing, env validation will fail at startup.

### Backend-unavailable UX

If backend services are unavailable, API routes return stable error codes and the UI shows localized toast messages (EN/VI) instead of generic framework errors.

## Landing Render Mode Options

Use one of these in `app/[locale]/(public)/page.tsx`.

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

## Multi-Adapter Architecture

The app is designed to keep feature code backend-agnostic:

- Domain contracts:
  - `lib/auth/contracts.ts`
  - `lib/example-entity/contracts.ts`
- Provider factories:
  - `lib/auth/factory.ts`
  - `lib/example-entity/factory.ts`
- Adapters:
  - REST: `lib/auth/adapters/rest.ts`, `lib/example-entity/adapters/rest.ts`
  - Firebase: `lib/auth/adapters/firebase.ts`, `lib/example-entity/adapters/firebase.ts`

Factory behavior:
- `DATA_PROVIDER=rest` → REST adapters
- `DATA_PROVIDER=firebase` → Firebase adapters

### How to add a new provider adapter

For each domain (auth, example-entity):
1. Implement provider methods in `lib/<domain>/adapters/<provider>.ts`
2. Normalize responses to contract types in `lib/<domain>/types.ts`
3. Throw domain errors from `lib/<domain>/errors.ts`
4. Extend factory selection in `lib/<domain>/factory.ts`
5. Add/validate required env keys in `lib/env/schema.ts` and `lib/env/server.ts`
6. Keep UI/hooks unchanged (they consume domain APIs, not provider internals)

## CSR Dashboard Data/Form Pattern

- Query provider + toaster: `providers/tanstack-query-provider.tsx`
- Auth feature: `features/auth/**`
- Example-entity feature: `features/example-entity/**`
- Domain adapters/factories: `lib/auth/**`, `lib/example-entity/**`
- Env validation: `lib/env/**`
- i18n messages: `messages/*.json`

## API Error + Toast i18n

- API routes return stable error codes.
- Client maps error codes to i18n keys.
- Toast message mapping lives in `lib/toast/messages.ts`.
- Localized copies live in `messages/en.json` and `messages/vi.json` under:
  - `toast.*`
  - `apiErrors.*`

This keeps backend responses stable while UI remains fully localized.

## E2E Testing (Playwright)

This project uses:
- **Vitest** for unit/integration tests (`tests/**/*.test.ts`, `tests/**/*.test.tsx`)
- **Playwright** for browser E2E tests (`tests/e2e/**/*.spec.ts`)

### Install browser binaries (first time)

```bash
pnpm test:e2e:install
```

### Run E2E tests

```bash
pnpm test:e2e
pnpm test:e2e:auth
pnpm test:e2e:ui
pnpm test:e2e:headed
pnpm test:e2e:debug
pnpm test:e2e:report
```

### Auth smoke coverage included

- Page render smoke: login/register/forgot-password
- Redirect smoke: unauthenticated `/dashboard` and `/vi/dashboard` redirect to login
- Basic auth form validation smoke

### Firebase integration auth E2E

A real API-integration spec is included at:
- `tests/e2e/auth/auth-flow-integration.spec.ts`

It validates:
- Register API returns expected session response shape
- Created account can login via UI and reach dashboard
- Wrong-password login returns `invalid_credentials`

**This test runs by default with `pnpm test:e2e:auth` and will fail until Firebase is properly configured.**

#### Why it fails initially

The integration test requires a working Firebase project with Email/Password authentication enabled. If you see:

```
Register failed with status 400: {"error":"register_failed"}
```

This means Firebase auth is not yet configured. Follow these steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`fir-cent-project` or your project ID)
3. Navigate to **Authentication → Sign-in method**
4. Enable **Email/Password** provider
5. Verify your `.env.local` has correct Firebase config values:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` (for local emulator use)
6. Re-run: `pnpm test:e2e:auth`

Once configured correctly, the integration test will pass and validate that real Firebase auth registration and login work end-to-end.

#### Test cleanup notes

- Current test uses unique emails per run (`e2e-auth-${Date.now()}@example.com`) for safe re-execution
- True cleanup (deleting created Firebase users) requires either:
  - A server-side test-only admin endpoint using Firebase Admin SDK, or
  - Firebase Emulator reset strategy
- This is standard practice for Firebase E2E testing

## API Integration Guide

Provider integration and architecture details are documented in:
- `docs/superpowers/specs/2026-04-05-dashboard-auth-content-design.md`
- `docs/superpowers/plans/2026-04-05-dashboard-auth-example-entity.md`
- `CLAUDE.md`
- `docs/project-structure.md`

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
- `features/auth/components/*.stories.tsx`
- `features/example-entity/components/*.stories.tsx`

Story discovery includes:
- `components/**/*.stories.*`
- `features/**/*.stories.*`

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm start
pnpm test
pnpm test:e2e
pnpm test:e2e:auth
pnpm storybook
pnpm build-storybook
```
