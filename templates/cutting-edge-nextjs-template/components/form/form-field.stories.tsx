import type { Meta, StoryObj } from "@storybook/nextjs";
import { userEvent, within } from "storybook/test";

import FormField from "@/components/form/form-field";

const meta = {
  title: "Components/Form/FormField",
  component: FormField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "Email",
    iconClass: "icon-[fluent--mail-24-regular]",
    showMoreLabel: (count: number) => `+${count} more`,
    showLessLabel: "Show less",
    children: <input className="grow" placeholder="john@example.com" />,
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    errors: [],
  },
};

export const SingleError: Story = {
  args: {
    errors: ["validation.email.invalid"],
  },
};

export const MultipleErrorsCollapsed: Story = {
  args: {
    label: "Password",
    iconClass: "icon-[fluent--key-24-regular]",
    children: <input className="grow" placeholder="MyP@ssw0rd!2024" />,
    errors: [
      "validation.password.tooShort",
      "validation.password.missingUppercase",
      "validation.password.missingSymbol",
    ],
  },
};

export const MultipleErrorsExpanded: Story = {
  args: {
    label: "Password",
    iconClass: "icon-[fluent--key-24-regular]",
    children: <input className="grow" placeholder="MyP@ssw0rd!2024" />,
    errors: [
      "validation.password.tooShort",
      "validation.password.missingUppercase",
      "validation.password.missingSymbol",
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "+2 more" }));
  },
};
