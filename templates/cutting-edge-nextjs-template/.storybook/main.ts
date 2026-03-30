import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  docs: {},
  staticDirs: ["../public"],
};

export default config;
