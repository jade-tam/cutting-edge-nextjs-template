import type { JSX } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, within } from "storybook/test";
import { NextIntlClientProvider } from "next-intl";

import ForgotPasswordForm from "@/features/auth/components/forgot-password-form";
import messages from "@/messages/en.json";

function StoryLayout(): JSX.Element {
  return (
    <div className="w-[28rem] max-w-full">
      <ForgotPasswordForm />
    </div>
  );
}

const meta = {
  title: "Features/Auth/ForgotPasswordForm",
  component: StoryLayout,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/forgot-password",
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
    await userEvent.click(canvas.getByRole("button", { name: "Send reset link" }));

    await expect(canvas.getByText("Please enter a valid email address")).toBeInTheDocument();
  },
};

export const LoadingSubmitState: Story = {
  play: async ({ canvasElement }) => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => new Promise(() => undefined)) as typeof fetch;

    try {
      const canvas = within(canvasElement);
      await userEvent.type(canvas.getByLabelText("Email"), "john@example.com");
      await userEvent.click(canvas.getByRole("button", { name: "Send reset link" }));

      await expect(canvas.getByRole("button", { name: "Submitting..." })).toBeDisabled();
    } finally {
      globalThis.fetch = originalFetch;
    }
  },
};
