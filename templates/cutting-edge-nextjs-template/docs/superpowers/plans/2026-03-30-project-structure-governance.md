# Project Structure Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a Next.js-aligned, AI-friendly structure governance system so contributors consistently place code in the right folders, follow env/logger conventions, and avoid structural drift.

**Architecture:** Keep the current top-level structure with App Router at `app/`, define clear folder ownership and dependency boundaries in docs, and enforce critical rules with lightweight linting. Add a root `CLAUDE.md` as the canonical AI agent contract, a detailed guideline document in `docs/`, and a README pointer for discoverability.

**Tech Stack:** Next.js 16.1.6 (App Router), TypeScript, ESLint 9, Markdown docs

---

## File Structure (planned changes)

- Create: `CLAUDE.md` — canonical AI agent workflow + placement rules + env/logger conventions + DoD checklist
- Create: `docs/project-structure.md` — full project structure guideline and decision matrix for humans/agents
- Modify: `README.md` — add “Project Structure Guideline” section linking to docs
- Modify: `eslint.config.mjs` — add guardrail rules (no direct `process.env` outside `lib/env`, no console except logger)
- Create: `lib/env/.gitkeep` — reserved folder for env module convention
- Create: `lib/logger/.gitkeep` — reserved folder for logger module convention

---

### Task 1: Create root CLAUDE.md governance contract

**Files:**
- Create: `CLAUDE.md`
- Test: `README.md` (reference consistency check)

- [ ] **Step 1: Write the initial CLAUDE.md content**

```md
# AI Contributor Contract

## Purpose
This repository uses a fixed structure to keep code placement predictable for both humans and AI agents.

## Structure ownership
- `app/`: routes, layouts, page entry points, route handlers only
- `features/`: feature/domain logic (business behavior)
- `components/`: shared UI components only
- `lib/`: shared technical utilities/integrations
- `config/`: global cross-lib configuration values
- `i18n/`: framework i18n wiring
- `messages/`: locale message content

## Placement decision tree
1. Is it a route/layout/page/metadata file? -> `app/`
2. Is it business logic for one feature? -> `features/<feature>/`
3. Is it reusable presentational UI? -> `components/`
4. Is it reusable technical helper? -> `lib/`
5. Is it global configuration? -> `config/`
6. Is it locale framework wiring? -> `i18n/`

## Env workflow (required)
When adding an env variable:
1. Add key to `example.env`
2. Add schema entry in `lib/env/schema.ts`
3. Export validated value from `lib/env/server.ts` or `lib/env/client.ts`
4. Use env through `lib/env/*`, not direct `process.env`

## Logger workflow (required)
- Use `lib/logger/*` for application logging
- Do not use direct `console.*` in feature or app logic

## Import boundaries
- `app` may import `features`, `components`, `lib`, `config`, `providers`, `i18n`
- `features` may import `components`, `lib`, `config`
- `components` may import `lib`, `config`
- `lib` may import `config`
- forbidden: `features -> app`, `lib -> features`

## Definition of done
- correct folder placement confirmed
- env changes updated in schema + `example.env`
- no direct `process.env` outside `lib/env/*`
- no direct `console.*` for app logs
- lint/build pass
- docs updated if structure changed
```

- [ ] **Step 2: Save CLAUDE.md**

Run: `git add CLAUDE.md`
Expected: `CLAUDE.md` appears in staged files

- [ ] **Step 3: Verify consistency with current repository shape**

Run: `ls -la && ls -la app components i18n messages`
Expected: listed directories match governance sections; adjust CLAUDE.md wording if mismatch

- [ ] **Step 4: Commit Task 1**

```bash
git add CLAUDE.md
git commit -m "docs: add AI contributor governance contract"
```

---

### Task 2: Add detailed project structure guideline document

**Files:**
- Create: `docs/project-structure.md`
- Test: `CLAUDE.md` (alignment check)

- [ ] **Step 1: Write guideline skeleton with concrete sections**

```md
# Project Structure Guideline

## Baseline philosophy (Next.js aligned)
- App Router conventions first
- Route groups for organization
- Shared technical code outside `app/`

## Folder map and ownership
(brief table for app/features/components/lib/config/i18n/messages)

## lib boilerplate
- `lib/api/`
- `lib/validation/`
- `lib/utils/`
- `lib/constants/`
- `lib/server/`
- `lib/client/`
- `lib/logger/` (required)
- `lib/env/` (required)

## i18n split rule
- `config/i18n.ts`: pure config values
- `i18n/`: framework/runtime integration

## Env convention (Next.js way)
- server-only vs `NEXT_PUBLIC_*`
- validated exports through `lib/env/*`

## Where to put new code (examples)
- new dashboard feature
- reusable date formatter
- new API base URL env

## Do / Don’t
- do centralize config in `config/`
- don’t import `app/` from `features/`
```

- [ ] **Step 2: Add placement matrix and examples**

```md
| If you are adding... | Put it in... | Example |
|---|---|---|
| Route page | `app/[locale]/.../page.tsx` | `app/[locale]/(dashboard)/dashboard/page.tsx` |
| Feature logic | `features/<name>/` | `features/users/use-create-user.ts` |
| Shared API helper | `lib/api/` | `lib/api/client.ts` |
| Global locale defaults | `config/i18n.ts` | `defaultLocale`, `locales` |
| Locale runtime wiring | `i18n/` | request config, routing integration |
```

- [ ] **Step 3: Commit Task 2**

```bash
git add docs/project-structure.md
git commit -m "docs: add project structure guideline"
```

---

### Task 3: Update README with structure guideline entrypoint

**Files:**
- Modify: `README.md`
- Test: `README.md` rendering (manual markdown check)

- [ ] **Step 1: Add concise guideline pointer section**

```md
## Project Structure Guideline

For folder ownership, code placement, env/logger conventions, and AI contributor rules, see:

- `docs/project-structure.md`
- `CLAUDE.md`
```

- [ ] **Step 2: Verify section placement does not duplicate existing content**

Run: `pnpm lint`
Expected: command completes without new lint issues caused by docs changes

- [ ] **Step 3: Commit Task 3**

```bash
git add README.md
git commit -m "docs: add structure guideline references"
```

---

### Task 4: Add minimal lint guardrails for env/logger policy

**Files:**
- Modify: `eslint.config.mjs`
- Test: project lint run

- [ ] **Step 1: Add `no-restricted-properties` rule for `process.env` outside env module**

```js
{
  files: ["**/*.{ts,tsx,js,jsx}"],
  ignores: ["lib/env/**"],
  rules: {
    "no-restricted-properties": [
      "error",
      {
        object: "process",
        property: "env",
        message: "Use validated exports from lib/env instead of direct process.env",
      },
    ],
  },
}
```

- [ ] **Step 2: Add restricted console rule outside logger module**

```js
{
  files: ["**/*.{ts,tsx,js,jsx}"],
  ignores: ["lib/logger/**"],
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
  },
}
```

- [ ] **Step 3: Run lint to validate guardrails**

Run: `pnpm lint`
Expected: PASS, or only actionable violations from existing code with clear file paths

- [ ] **Step 4: If violations appear, fix only policy-related violations**

```ts
// before
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL

// after
import { clientEnv } from "@/lib/env/client"
const apiBase = clientEnv.NEXT_PUBLIC_API_BASE_URL
```

- [ ] **Step 5: Commit Task 4**

```bash
git add eslint.config.mjs
git commit -m "chore: enforce env and logging placement guardrails"
```

---

### Task 5: Reserve required module directories for env and logger

**Files:**
- Create: `lib/env/.gitkeep`
- Create: `lib/logger/.gitkeep`
- Test: directory presence check

- [ ] **Step 1: Create directories and placeholders**

Run: `mkdir -p lib/env lib/logger && touch lib/env/.gitkeep lib/logger/.gitkeep`
Expected: both folders exist and are tracked

- [ ] **Step 2: Verify presence**

Run: `ls -la lib/env lib/logger`
Expected: each directory contains `.gitkeep`

- [ ] **Step 3: Commit Task 5**

```bash
git add lib/env/.gitkeep lib/logger/.gitkeep
git commit -m "chore: reserve env and logger module folders"
```

---

### Task 6: Final verification and integration check

**Files:**
- Verify: `CLAUDE.md`, `docs/project-structure.md`, `README.md`, `eslint.config.mjs`
- Test: lint/build

- [ ] **Step 1: Run final lint and build checks**

Run: `pnpm lint && pnpm build`
Expected: both commands pass

- [ ] **Step 2: Run quick policy grep checks**

Run: `rg "process\.env" --glob "**/*.{ts,tsx}"`
Expected: matches only in `lib/env/*` (or documented exceptions)

- [ ] **Step 3: Validate docs cross-link integrity**

Run: `rg "project-structure\.md|CLAUDE\.md" README.md docs/project-structure.md`
Expected: links and references are present and accurate

- [ ] **Step 4: Commit final integration adjustments (if any)**

```bash
git add CLAUDE.md docs/project-structure.md README.md eslint.config.mjs lib/env/.gitkeep lib/logger/.gitkeep
git commit -m "docs: finalize project structure governance and enforcement"
```

---

## Self-Review

### 1) Spec coverage
Covered requirements:
- Next.js-aligned baseline structure guidance
- clear `lib` purpose and fixed boilerplate
- required `logger` and `env` conventions
- Next.js env best-practice alignment (`NEXT_PUBLIC_*`, server-only safety)
- AI onboarding/governance via `CLAUDE.md`
- doc guideline + README discoverability

Potential follow-up (not required for this scope):
- add stricter architectural import boundary plugin if desired in a later phase

### 2) Placeholder scan
- No TODO/TBD placeholders
- each task contains concrete files, commands, and expected outcomes

### 3) Type/definition consistency
- consistent naming used throughout: `lib/env/*`, `lib/logger/*`, `docs/project-structure.md`, `CLAUDE.md`

