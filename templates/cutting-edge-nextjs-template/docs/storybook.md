# Storybook Configuration

This document describes the Storybook setup for this Next.js project.

## Overview

Storybook is configured using `@storybook/nextjs` framework (v10.3.3) with full support for:
- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- DaisyUI components
- Path aliases (`@/*`)

## Configuration Files

### `.storybook/main.ts`
Main Storybook configuration defining:
- Story file locations: `components/**/*.stories.@(js|jsx|mjs|ts|tsx)`
- Framework: `@storybook/nextjs`
- Static assets: `public/` directory

### `.storybook/preview.ts`
Preview configuration that:
- Imports global styles (`app/globals.css`)
- Configures control matchers for color and date properties

## Writing Stories

Stories follow the Component Story Format (CSF) 3.0:

```typescript
import type { Meta, StoryObj } from "@storybook/nextjs";
import { YourComponent } from "./YourComponent";

const meta = {
  title: "Category/YourComponent",
  component: YourComponent,
  parameters: {
    layout: "centered", // or "fullscreen", "padded"
  },
  tags: ["autodocs"],
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // component props
  },
};
```

## Running Storybook

Development mode:
```bash
pnpm storybook
```

Build static version:
```bash
pnpm build-storybook
```

## Notes

- Storybook 10 includes essential addons (controls, actions, viewport, etc.) in core
- No need to install separate addon packages
- Tailwind CSS and DaisyUI styles are automatically available in stories
- Next.js features like Image optimization and routing are supported
