import type { Meta, StoryObj } from "@storybook/nextjs";
import { NextIntlClientProvider } from "next-intl";

import messages from "@/messages/en.json";

import DashboardTopbar from "./DashboardTopbar";

const meta = {
  title: "Components/Dashboard/Shell/DashboardTopbar",
  component: DashboardTopbar,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/dashboard",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages}>
        <div className="min-h-screen bg-base-100">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof DashboardTopbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OverviewPath: Story = {
  args: {
    onMenuClick: () => undefined,
  },
};

export const ExampleEntitiesPath: Story = {
  args: {
    onMenuClick: () => undefined,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/dashboard/example-entities",
      },
    },
  },
};
