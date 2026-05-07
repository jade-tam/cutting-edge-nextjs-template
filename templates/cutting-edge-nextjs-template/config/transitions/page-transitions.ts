export type TransitionMode = "default" | "subtle" | "none";

type ViewTransitionPreset = {
  enter: "slide-up" | "subtle-up" | "none";
  exit: "slide-down" | "subtle-down" | "none";
  update: "slide-up" | "subtle-up" | "none";
  default: "auto" | "none";
};

export const DEFAULT_TRANSITION_MODE: TransitionMode = "default";

export const PAGE_TRANSITION_MODES: Record<
  TransitionMode,
  ViewTransitionPreset
> = {
  default: {
    enter: "slide-up",
    exit: "slide-down",
    update: "slide-up",
    default: "none",
  },
  subtle: {
    enter: "subtle-up",
    exit: "subtle-down",
    update: "subtle-up",
    default: "none",
  },
  none: {
    enter: "none",
    exit: "none",
    update: "none",
    default: "none",
  },
};
