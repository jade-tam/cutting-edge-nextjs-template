import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { NextIntlClientProvider } from "next-intl";

import messages from "@/messages/en.json";

import DashboardSidebar from "./DashboardSidebar";

type DashboardSidebarProps = ComponentProps<typeof DashboardSidebar>;

const navItems: DashboardSidebarProps["navItems"] = [
  {
    href: "/dashboard",
    label: "Overview",
    iconClass: "icon-[fluent--home-24-filled] text-xl",
  },
  {
    href: "/dashboard/operations",
    label: "Operations",
    iconClass: "icon-[fluent--people-team-24-regular] text-xl",
    requiredRole: ["admin", "manager"],
    subItems: [
      {
        href: "/dashboard/operations/team",
        label: "Team workspace",
        iconClass: "icon-[fluent--person-24-regular] text-xl",
        requiredRole: ["admin", "manager"],
      },
      {
        href: "/dashboard/operations/billing",
        label: "Billing center",
        iconClass: "icon-[fluent--payment-24-regular] text-xl",
        requiredRole: ["admin"],
      },
    ],
  },
  {
    href: "/dashboard/admin",
    label: "Admin tools",
    iconClass: "icon-[fluent--settings-24-regular] text-xl",
    requiredRole: ["admin"],
  },
];

const meta = {
  title: "Components/Dashboard/Shell/DashboardSidebar",
  component: DashboardSidebar,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/dashboard/operations/team",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages}>
        <div className="h-screen w-[22rem] bg-base-100 p-2">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
} satisfies Meta<typeof DashboardSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AdminRole: Story = {
  args: {
    navItems,
    onClose: () => undefined,
    onLogoutClick: () => undefined,
  },
};

export const ManagerRole: Story = {
  args: {
    navItems,
    onClose: () => undefined,
    onLogoutClick: () => undefined,
  },
};
