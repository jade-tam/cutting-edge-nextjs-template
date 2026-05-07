import { describe, expect, it } from "vitest";

import {
  DEFAULT_TRANSITION_MODE,
  PAGE_TRANSITION_MODES,
  type TransitionMode,
} from "@/config/transitions/page-transitions";

describe("page transition config", () => {
  it("uses default mode", () => {
    expect(DEFAULT_TRANSITION_MODE).toBe("default");
  });

  it("contains required modes", () => {
    const modes = Object.keys(PAGE_TRANSITION_MODES) as TransitionMode[];
    expect(modes).toEqual(expect.arrayContaining(["default", "subtle", "none"]));
  });

  it("maps default mode to slide transition presets", () => {
    expect(PAGE_TRANSITION_MODES.default).toEqual({
      enter: "slide-up",
      exit: "slide-down",
      update: "slide-up",
      default: "none",
    });
  });

  it("maps subtle mode to softer transition presets", () => {
    expect(PAGE_TRANSITION_MODES.subtle).toEqual({
      enter: "subtle-up",
      exit: "subtle-down",
      update: "subtle-up",
      default: "none",
    });
  });

  it("maps none mode to no-op transition presets", () => {
    expect(PAGE_TRANSITION_MODES.none).toEqual({
      enter: "none",
      exit: "none",
      update: "none",
      default: "none",
    });
  });
});
