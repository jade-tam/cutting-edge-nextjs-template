import type { JSX } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, within } from "storybook/test";
import { NextIntlClientProvider } from "next-intl";

import RegisterForm from "@/features/auth/components/register-form";
import messages from "@/messages/en.json";

function StoryLayout(): JSX.Element {
  return (
    <div className="w-[28rem] max-w-full">
      <RegisterForm />
    </div>
  );
}

const meta = {
  title: "Features/Auth/RegisterForm",
  component: StoryLayout,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/register",
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
} satisfies Meta<typeof StoryLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ValidationErrorVisible: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Create account" }));

    await expect(canvas.getByText("Full name must be at least 2 characters")).toBeInTheDocument();
    await expect(canvas.getByText("Username must be at least 3 characters")).toBeInTheDocument();
    await expect(canvas.getByText("Please enter a valid email address")).toBeInTheDocument();
    await expect(canvas.getByText("Password must be at least 12 characters")).toBeInTheDocument();
  },
};

export const LoadingSubmitState: Story = {
  play: async ({ canvasElement }) => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => new Promise(() => undefined)) as typeof fetch;

    try {
      const canvas = within(canvasElement);
      await userEvent.type(canvas.getByLabelText("Full name"), "John Doe");
      await userEvent.type(canvas.getByLabelText("Username"), "JohnDoe123");
      await userEvent.type(canvas.getByLabelText("Email"), "john@example.com");
      await userEvent.type(canvas.getByLabelText("Password"), "MyP@ssw0rd!2024");
      await userEvent.click(canvas.getByRole("button", { name: "Create account" }));

      await expect(canvas.getByRole("button", { name: "Creating account..." })).toBeDisabled();
    } finally {
      globalThis.fetch = originalFetch;
    }
  },
};
