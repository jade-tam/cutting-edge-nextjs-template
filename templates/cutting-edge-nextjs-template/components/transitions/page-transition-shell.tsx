"use client";

import { ViewTransition, type ReactNode } from "react";

import {
  DEFAULT_TRANSITION_MODE,
  PAGE_TRANSITION_MODES,
  type TransitionMode,
} from "@/config/transitions/page-transitions";

type PageTransitionShellProps = {
  children: ReactNode;
  mode?: TransitionMode;
  transitionKey?: string;
};

export function PageTransitionShell({
  children,
  mode = DEFAULT_TRANSITION_MODE,
  transitionKey,
}: PageTransitionShellProps) {
  const preset = PAGE_TRANSITION_MODES[mode];

  return (
    <ViewTransition
      key={transitionKey}
      enter={preset.enter}
      exit={preset.exit}
      update={preset.update}
      default={preset.default}
    >
      <div data-page-transition-container className="size-full">
        {children}
      </div>
    </ViewTransition>
  );
}
