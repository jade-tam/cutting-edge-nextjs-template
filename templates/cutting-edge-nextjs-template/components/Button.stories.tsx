import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "accent", "ghost", "outline"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
    isLoading: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Accent: Story = {
  args: {
    variant: "accent",
    children: "Accent",
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    children: "Submitting",
  },
};

export const LargeOutline: Story = {
  args: {
    variant: "outline",
    size: "lg",
    children: "Large Outline",
  },
};
