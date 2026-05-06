import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { NextIntlClientProvider } from "next-intl";

import messages from "@/messages/en.json";

import DashboardShell from "./DashboardShell";

type DashboardShellProps = ComponentProps<typeof DashboardShell>;

const navItems: DashboardShellProps["navItems"] = [
  {
    href: "/dashboard",
    label: "Overview",
    iconClass: "icon-[fluent--home-24-filled] text-xl",
  },
  {
    href: "/dashboard/example-entities",
    label: "Example entities",
    iconClass: "icon-[fluent--database-24-regular] text-xl",
    requiredRole: ["admin", "manager"],
  },
  {
    href: "/dashboard/admin",
    label: "Admin tools",
    iconClass: "icon-[fluent--settings-24-regular] text-xl",
    requiredRole: ["admin"],
  },
];

const meta = {
  title: "Components/Dashboard/Shell/DashboardShell",
  component: DashboardShell,
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
        <Story />
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof DashboardShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const OverviewContent = (
  <div className="space-y-4 py-4">
    <h1 className="text-3xl font-bold">Dashboard overview</h1>
    <p className="text-base-content/70">
      Review activity and monitor your team from the shell layout.
    </p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Active users</h2>
          <p>1,248</p>
        </div>
      </div>
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Conversion rate</h2>
          <p>3.2%</p>
        </div>
      </div>
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Pending tasks</h2>
          <p>18</p>
        </div>
      </div>
    </div>
  </div>
);

export const AdminView: Story = {
  args: {
    navItems,
    children: OverviewContent,
  },
};

export const ManagerView: Story = {
  args: {
    navItems,
    children: OverviewContent,
  },
};
