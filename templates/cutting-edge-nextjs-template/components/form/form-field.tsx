"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef, type ReactNode } from "react";

type FormFieldProps = {
  label: string;
  iconClass?: string;
  useInputWrapper?: boolean;
  errors?: unknown[];
  children: ReactNode;
  showMoreLabel?: (count: number) => string;
  showLessLabel?: string;
};

function normalizeError(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message ?? "");
  }

  return String(error);
}

export default function FormField(props: FormFieldProps): ReactNode {
  const { label, iconClass, useInputWrapper = true, errors = [], children } = props;
  const visibleErrors = errors.map(normalizeError).filter((message) => message.length > 0);
  const errorContainerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!errorContainerRef.current) {
      return;
    }

    const rows = Array.from(errorContainerRef.current.querySelectorAll<HTMLElement>("[data-form-error-row]"));

    if (rows.length === 0) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        rows,
        { opacity: 0, height: 0 },
        { opacity: 1, height: "auto", duration: 0.2, ease: "power1.out", stagger: 0.02 },
      );
    }, errorContainerRef);

    return () => {
      ctx.revert();
    };
  }, [visibleErrors]);

  return (
    <div className="flex flex-col gap-1">
      <label className="flex w-full flex-col gap-1">
        <span className="label-text mb-1">{label}</span>
        {useInputWrapper ? (
          <div className="input input-bordered flex w-full max-w-none items-center gap-3">
            {iconClass ? <span className={`${iconClass} size-5 shrink-0 opacity-60`} aria-hidden="true" /> : null}
            {children}
          </div>
        ) : (
          children
        )}
      </label>

      <div ref={errorContainerRef} className="flex flex-col gap-1">
        {visibleErrors.map((message, index) => (
          <span
            key={`${message}-${index}`}
            data-form-error-row
            className="text-error flex items-start gap-2 overflow-hidden px-1 text-[0.6875rem]"
          >
            <span className="bg-error mt-1 size-2 shrink-0 rounded-full" />
            <span>{message}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
