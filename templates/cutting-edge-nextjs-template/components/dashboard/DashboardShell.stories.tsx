import type { Meta, StoryObj } from "@storybook/nextjs";
import DashboardShell from "./DashboardShell";

const meta = {
  title: "Dashboard/DashboardShell",
  component: DashboardShell,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DashboardShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-base-content/70">
          This is an example dashboard content area rendered inside DashboardShell.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Users</h2>
              <p>1,248 active users</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Revenue</h2>
              <p>$12,480 this month</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title">Tasks</h2>
              <p>18 pending tasks</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
};
