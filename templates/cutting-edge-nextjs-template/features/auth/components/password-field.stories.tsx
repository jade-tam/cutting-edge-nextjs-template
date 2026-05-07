import { useState, type JSX } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs";
import { userEvent, within } from "storybook/test";

import PasswordField from "@/features/auth/components/password-field";

function PasswordFieldStoryRenderer({
  initialValue = "",
  showStrength = false,
  errors = [],
}: {
  initialValue?: string;
  showStrength?: boolean;
  errors?: string[];
}): JSX.Element {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="w-[26rem] max-w-full">
      <PasswordField
        label="Password"
        value={value}
        errors={errors}
        onChange={setValue}
        onBlur={() => undefined}
        placeholder="MyP@ssw0rd!2024"
        showStrength={showStrength}
        showLabel="Show password"
        hideLabel="Hide password"
        showMoreErrorsLabel={(count) => `+${count} more`}
        showLessErrorsLabel="Show less"
        strengthLabels={{
          weak: "Weak",
          fair: "Fair",
          good: "Good",
          strong: "Strong",
        }}
      />
    </div>
  );
}

const meta = {
  title: "Features/Auth/PasswordField",
  component: PasswordFieldStoryRenderer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PasswordFieldStoryRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hidden: Story = {
  args: {
    initialValue: "MyP@ssw0rd!2024",
    showStrength: false,
    errors: [],
  },
};

export const Visible: Story = {
  args: {
    initialValue: "MyP@ssw0rd!2024",
    showStrength: false,
    errors: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show password" }));
  },
};

export const WithStrengthWeak: Story = {
  args: {
    initialValue: "abc",
    showStrength: true,
    errors: [],
  },
};

export const WithStrengthStrong: Story = {
  args: {
    initialValue: "MyP@ssw0rd!2024",
    showStrength: true,
    errors: [],
  },
};
