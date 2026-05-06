# How to add a new table

Use this checklist whenever adding a new dashboard table so implementation stays consistent, reusable, and provider-agnostic.

## 1) Define scope and route behavior

- [ ] Confirm the table belongs to a dashboard CRUD flow.
- [ ] Confirm route conventions are respected:
  - [ ] Create: `/new`
  - [ ] Edit: `/[id]/edit`
  - [ ] Delete: confirmed action in list/detail UI (no `/delete` page)
- [ ] Identify required roles and authorization behavior for read/create/update/delete.

## 2) Place code in the correct folders

- [ ] Route/page entry code lives in `app/`.
- [ ] Feature-specific table logic/UI lives in `features/<feature>/`.
- [ ] Shared UI primitives live in `components/`.
- [ ] Shared technical utilities stay in `lib/`.

## 3) Reuse existing table primitives first

- [ ] Reuse shared table components from:
  - [ ] `features/example-entity/components/table/`
  - [ ] `components/ui/table/*`
- [ ] Extend existing reusable table controls before creating new primitives.
- [ ] Keep repeated toolbar and row-action UI DRY.

## 4) Keep data and provider boundaries clean

- [ ] Use TanStack Query hooks for server-state fetch/mutation.
- [ ] Keep table UI provider-agnostic (no provider SDK imports in `features/*` or `app/*`).
- [ ] Use contracts/factories under `lib/*/contracts.ts` and `lib/*/factory.ts`.
- [ ] Keep stable API error codes (`{ error: <code> }`) for UI mapping.

## 5) Define typed table structure

- [ ] Add typed row model and column definitions (`ColumnDef<T>`).
- [ ] Centralize column definitions instead of inlining them across files.
- [ ] Add sorting/filter metadata where applicable.
- [ ] Ensure row actions receive typed domain data and avoid implicit `any`.

## 6) Implement UX and i18n requirements

- [ ] Localize all user-facing copy with `next-intl`.
- [ ] Add/verify translation keys in both `messages/en.json` and `messages/vi.json`.
- [ ] Implement explicit states:
  - [ ] Loading
  - [ ] Empty
  - [ ] Error
- [ ] Keep destructive actions behind clear confirmation UI.
- [ ] Map API error codes to `lib/toast/messages.ts`.

## 7) Implement create/update forms used by table flow

- [ ] Use TanStack Form + Zod for create/update forms.
- [ ] Reuse shared form primitives for labels, inputs, and errors.
- [ ] Keep placeholders as examples (not instructional text).
- [ ] Avoid ad-hoc `useState` form orchestration.

## 8) Add or update tests

- [ ] Add/adjust Vitest coverage for table logic/state/column behaviors.
- [ ] Add/adjust Playwright coverage for critical CRUD path changes.
- [ ] Prefer role/label selectors in E2E tests.
- [ ] For auth/dashboard access impacts, run required RBAC-related test scopes.

## 9) Run required verification

- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] Relevant `pnpm test:e2e` scope for changed behavior

## 10) Keep docs synchronized

- [ ] Update `README.md` if architecture/status expectations changed.
- [ ] Update `CLAUDE.md` when adding/changing implementation rules.
- [ ] Update relevant docs under `docs/` in the same change.
