# create-cutting-edge-nextjs-app

Scaffold a production-ready Next.js template with strong defaults aligned to official docs and current best practices.  
Built for teams who want to ship faster with less setup debate, cleaner architecture, and reliable foundations from day one.

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

- **Strong defaults, fewer decisions**  
  Start with a curated stack and conventions that reduce setup churn.

- **Aligned with official docs**  
  Configuration and patterns follow current framework/library guidance, not outdated boilerplate.

- **Built for real product workflows**  
  Includes public/marketing pages, auth flows, and a CSR dashboard architecture.

- **AI contributor ready**  
  Ships with explicit project structure and contributor rules in the generated template for consistent AI-assisted changes.

## Tech stack

### Core app stack

| Category | Library |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + DaisyUI |
| i18n | next-intl |
| Server state | @tanstack/react-query |
| Forms | @tanstack/react-form + @tanstack/zod-form-adapter |
| Validation | Zod |
| Animation | GSAP |
| Notifications | Sonner |
| Backend default | Firebase |

### Quality and developer tooling

| Category | Library |
|---|---|
| Component development | Storybook 10 (`@storybook/nextjs`) |
| Unit/Integration testing | Vitest + Testing Library |
| E2E testing | Playwright |
| Linting | ESLint 9 + `eslint-config-next` |
| Type checking | TypeScript (`tsc --noEmit`) |
| Local backend workflow | Firebase Emulator Suite |

### UI asset/tooling integrations

| Category | Library |
|---|---|
| Icon system | Iconify (`@iconify/tailwind4`, Fluent + Simple Icons) |
| Analytics | @vercel/analytics |

## Backend architecture

The generated app uses an adapter-oriented backend design with **Firebase configured as the production-ready default**.  
It is structured to be extensible, so teams can add REST API adapters later without rewriting feature-level UI flows.
