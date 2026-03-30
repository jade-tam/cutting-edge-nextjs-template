# AI Contributor Contract

## Purpose
Keep code placement predictable for humans and AI contributors, aligned with this repository’s Next.js App Router structure.

## Structure ownership
Existing root folders: `app/`, `components/`, `i18n/`, `messages/`, `providers/`.
Target conventions: `features/`, `lib/`, `config/`.

Use these ownership rules:
- `app/`: routes, layouts, page entry points, route handlers, metadata files
- `components/`: cross-feature shared/reusable UI components only
- `features/`: feature/domain business logic and feature-local UI under `features/<feature>/components/` (target convention as features are introduced)
- `lib/`: shared technical utilities/integrations (target convention)
- `config/`: cross-cutting configuration values (target convention)
- `i18n/`: framework/runtime i18n wiring
- `messages/`: locale message content
- `providers/`: global provider composition

## Placement decision tree
1. Route/layout/page/metadata/route handler? -> `app/`
2. Business logic for a specific domain feature? -> `features/<feature>/`
3. UI used only by one feature? -> `features/<feature>/components/`
4. UI reused across features? -> `components/`
5. Reusable technical helper/integration? -> `lib/`
6. Global config value? -> `config/`
7. i18n runtime wiring? -> `i18n/`
8. Locale strings? -> `messages/`

## Env workflow (required)
When adding an environment variable:
1. Add key to `example.env`
2. If `lib/` does not exist yet, create `lib/env/*` as part of the same change
3. Add validation/schema in `lib/env/schema.ts`
4. Export from `lib/env/server.ts` or `lib/env/client.ts`
5. Consume via `lib/env/*` exports, never direct `process.env` in app/feature/component code

## Logger workflow (required)
- If `lib/` does not exist yet, create `lib/logger/*` as part of the same change
- Implement and use application logging through `lib/logger/*`
- Do not add direct `console.*` calls for application logging outside logger modules

## Import boundaries
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

## Definition of done
- Code is placed in the correct folder by ownership rules
- Env changes include `example.env` + `lib/env/*` updates
- No direct `process.env` access outside `lib/env/*`
- No direct `console.*` for application logging outside `lib/logger/*`
- Lint/build checks pass for touched scope
- Docs are updated when structure conventions change
