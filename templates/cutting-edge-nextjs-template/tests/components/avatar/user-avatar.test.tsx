import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import UserAvatar from "@/components/avatar/UserAvatar";

afterEach(() => {
  cleanup();
});

describe("UserAvatar", () => {
  it("renders image when src is provided", () => {
    render(
      <UserAvatar
        src="https://cdn.example.com/avatar.png"
        fallbackText="Jane Doe"
        alt="User avatar"
        size="md"
      />,
    );

    const image = screen.getByRole("img", { name: "User avatar" });
    expect(image).toHaveAttribute("src", expect.stringContaining("/_next/image?url="));
    expect(decodeURIComponent(image.getAttribute("src") ?? "")).toContain(
      "https://cdn.example.com/avatar.png",
    );
  });

  it("renders uppercase fallback initial when src is missing", () => {
    render(<UserAvatar src={null} fallbackText="jane" alt="User avatar" size="md" />);

    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("always applies border class on avatar surface", () => {
    const { container } = render(
      <UserAvatar src={null} fallbackText="Jane" alt="User avatar" size="md" />,
    );

    expect(container.querySelector(".border")).toBeTruthy();
  });

  it("applies online indicator class only when showOnlineStatus is true", () => {
    const { rerender, container } = render(
      <UserAvatar src={null} fallbackText="Jane" alt="User avatar" size="md" />,
    );

    expect(container.querySelector(".avatar-online")).toBeNull();

    rerender(
      <UserAvatar
        src={null}
        fallbackText="Jane"
        alt="User avatar"
        size="md"
        showOnlineStatus
      />,
    );

    expect(container.querySelector(".avatar-online")).toBeTruthy();
  });

  it("maps size variants to expected width classes", () => {
    const { rerender, container } = render(
      <UserAvatar src={null} fallbackText="Jane" alt="User avatar" size="sm" />,
    );

    expect(container.querySelector(".w-8")).toBeTruthy();

    rerender(<UserAvatar src={null} fallbackText="Jane" alt="User avatar" size="md" />);
    expect(container.querySelector(".w-20")).toBeTruthy();

    rerender(<UserAvatar src={null} fallbackText="Jane" alt="User avatar" size="lg" />);
    expect(container.querySelector(".w-20")).toBeTruthy();
  });
});
