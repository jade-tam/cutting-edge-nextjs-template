# Project Structure Guideline

## Baseline philosophy (Next.js aligned)
- Follow Next.js App Router conventions first (`app/` is for routing concerns).
- Keep route files thin and move reusable or business logic out of `app/`.
- Prefer explicit folder ownership so humans and AI agents make the same placement decisions.
- Optimize for predictable imports and low coupling between layers.

## Current structure vs target conventions
- Existing root folders in this repo: `app/`, `components/`, `i18n/`, `messages/`, `providers/`.
- Target conventions introduced as needed: `features/`, `lib/`, `config/`.
- Do not create target folders preemptively; add them when a change requires their ownership.

## Folder map and ownership
| Folder | Owns | Should not own |
|---|---|---|
| `app/` | routes, layouts, pages, metadata, route handlers | shared utilities, feature business logic |
| `features/` | feature/domain logic and feature-local UI | cross-feature framework wiring |
| `components/` | shared UI components reused across features | route definitions, feature-specific business logic |
| `lib/` | shared technical utilities and integrations | route files, feature orchestration |
| `config/` | cross-cutting static configuration | runtime framework glue code |
| `i18n/` | i18n runtime/framework integration | locale message content |
| `messages/` | translation message files | runtime i18n wiring |
| `providers/` | global provider composition | feature business logic |

## `lib/` boilerplate (conventions)
When introducing or expanding `lib/`, avoid over-scaffolding:
- Create only the subfolders needed for the change.
- Common examples: `lib/api/`, `lib/validation/`, `lib/utils/`, `lib/constants/`, `lib/server/`, `lib/client/`.
- Add `lib/logger/` when the change introduces application logging concerns.
- Add `lib/env/` when the change introduces validated environment variable access.

### Required logger rule
- Application logging goes through `lib/logger/*`.
- Avoid direct console logging outside `lib/logger/*`.

### Required env rule
- Access env through `lib/env/server.ts` or `lib/env/client.ts` exports.
- Avoid direct `process.env` access outside `lib/env/*`.

## i18n split rule
- Put pure locale configuration in `config/i18n.ts` (for example `defaultLocale`, `locales`).
- Put runtime integration and request/config wiring in `i18n/`.
- Keep translation content in `messages/`.

## Env convention (Next.js)
- Server-only variables: keep unprefixed and consume only from server context.
- Client-exposed variables: prefix with `NEXT_PUBLIC_`.
- For every new env key:
  1. Add to `example.env`.
  2. Add validation/schema in `lib/env/schema.ts`.
  3. Export validated value from `lib/env/server.ts` or `lib/env/client.ts`.
  4. Consume via `lib/env/*` exports.

## Import boundaries
Aligned with `CLAUDE.md`:

Allowed:
- `app` -> `features`, `components`, `lib`, `config`, `providers`, `i18n`, `messages`
- `features` -> `components`, `lib`, `config`, `messages`
- `components` -> `lib`, `config`, `messages`
- `lib` -> `config`
- `providers` -> `lib`, `config`, `i18n`, `messages`, `components`

Forbidden:
- `features` -> `app`
- `lib` -> `features`
- `components` -> `features`
- `providers` -> `features`, `app`

## Code placement examples
- New dashboard route entrypoint: `app/[locale]/(dashboard)/dashboard/page.tsx`
- Dashboard service/business logic: `features/dashboard/services/get-dashboard-metrics.ts`
- Reusable button used by multiple features: `components/ui/button.tsx`
- Reusable date formatter: `lib/utils/format-date.ts`
- Shared API client wrapper: `lib/api/client.ts`
- Global locale defaults: `config/i18n.ts`
- Request i18n integration: `i18n/request.ts`
- New public API base URL env parsing: `lib/env/client.ts`

## Placement matrix
| If you are adding... | Put it in... | Concrete example |
|---|---|---|
| Route page | `app/[locale]/.../page.tsx` | `app/[locale]/(marketing)/pricing/page.tsx` |
| Route handler | `app/api/.../route.ts` | `app/api/health/route.ts` |
| Feature use case logic | `features/<feature>/` | `features/users/use-create-user.ts` |
| Feature-only presentational component | `features/<feature>/components/` | `features/users/components/create-user-form.tsx` |
| Shared presentational component | `components/` | `components/ui/card.tsx` |
| Shared API helper | `lib/api/` | `lib/api/client.ts` |
| Validation schema | `lib/validation/` | `lib/validation/user-schema.ts` |
| Global i18n defaults | `config/i18n.ts` | `locales`, `defaultLocale` exports |
| i18n runtime wiring | `i18n/` | `i18n/request.ts` |
| Translation messages | `messages/` | `messages/en/common.json` |
| App logging | `lib/logger/` | `lib/logger/app-logger.ts` |
| Env schema and exports | `lib/env/` | `lib/env/schema.ts`, `lib/env/server.ts` |

## Do / Don’t rules
### Do
- Do keep route modules focused on route concerns.
- Do colocate feature-specific logic under `features/<feature>/`.
- Do centralize cross-cutting config in `config/`.
- Do reuse technical helpers via `lib/`.
- Do use `lib/env/*` and `lib/logger/*` conventions for env/logging.

### Don’t
- Don’t import `app/` from `features/`, `components/`, or `lib/`.
- Don’t put reusable technical helpers inside `app/`.
- Don’t duplicate shared UI inside multiple features when it belongs in `components/`.
- Don’t read `process.env` directly outside `lib/env/*`.
- Don’t use direct `console.*` for application logging outside `lib/logger/*`.
