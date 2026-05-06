import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FormField from "@/components/form/form-field";

describe("FormField", () => {
  it("renders label above input and icon inside input wrapper", () => {
    render(
      <FormField
        label="Email"
        iconClass="icon-[fluent--mail-24-regular]"
        errors={[]}
        showMoreLabel={(count) => `+${count} more`}
        showLessLabel="Show less"
      >
        <input className="grow" placeholder="john@example.com" />
      </FormField>,
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(document.querySelector(".icon-\\[fluent--mail-24-regular\\]")).not.toBeNull();
  });

  it("renders each error message on its own line with a red bullet", () => {
    const { container } = render(
      <FormField
        label="Password"
        iconClass="icon-[fluent--key-24-regular]"
        errors={["too short", "missing uppercase", "missing symbol"]}
      >
        <input className="grow" placeholder="MyP@ssw0rd!2024" />
      </FormField>,
    );

    expect(screen.getByText("too short")).toBeInTheDocument();
    expect(screen.getByText("missing uppercase")).toBeInTheDocument();
    expect(screen.getByText("missing symbol")).toBeInTheDocument();
    expect(container.querySelectorAll(".bg-error.rounded-full")).toHaveLength(3);
  });

  it("renders validation errors and updates when errors change", () => {
    const { rerender } = render(
      <FormField label="Email" errors={[{ message: "Invalid email" }]}>
        <input className="grow" placeholder="john@example.com" />
      </FormField>,
    );

    expect(screen.getByText("Invalid email")).toBeInTheDocument();

    rerender(
      <FormField label="Email" errors={[]}>
        <input className="grow" placeholder="john@example.com" />
      </FormField>,
    );

    expect(screen.queryByText("Invalid email")).not.toBeInTheDocument();
  });
});
