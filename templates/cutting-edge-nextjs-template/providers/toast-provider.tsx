"use client";

import { Toaster } from "sonner";

const successIcon = (
  <span
    aria-hidden="true"
    className="icon-[fluent--checkmark-circle-24-filled]"
  />
);
const errorIcon = (
  <span aria-hidden="true" className="icon-[fluent--error-circle-24-filled]" />
);
const infoIcon = (
  <span aria-hidden="true" className="icon-[fluent--info-24-filled]" />
);
const warningIcon = (
  <span aria-hidden="true" className="icon-[fluent--warning-24-filled]" />
);
const closeIcon = (
  <span aria-hidden="true" className="icon-[fluent--dismiss-24-filled]" />
);
const loadingIcon = (
  <span
    aria-hidden="true"
    className="icon-[fluent--arrow-clockwise-24-filled] animate-spin"
  />
);

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      icons={{
        success: successIcon,
        info: infoIcon,
        warning: warningIcon,
        error: errorIcon,
        close: closeIcon,
        loading: loadingIcon,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "alert shadow-lg border rounded-box px-4 py-3 flex items-center gap-3",
          icon: "text-2xl flex items-center",
          title: "font-medium",
          description: "text-sm opacity-80",
          success: "alert-success",
          error: "alert-error",
          warning: "alert-warning",
          info: "alert-info",
        },
      }}
    />
  );
}
