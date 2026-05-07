"use client";

import "cally";

import { createElement, useEffect, useId, useRef, useState, type CSSProperties } from "react";

import FormField from "@/components/form/form-field";

type DatePickerFieldProps = {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  onBlur?: () => void;
  errors?: unknown[];
  placeholder?: string;
  iconClass?: string;
  disabled?: boolean;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
};

function formatDateForDisplay(value: string | null): string | null {
  if (!value) return null;

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

export default function DatePickerField({
  label,
  value,
  onChange,
  onBlur,
  errors = [],
  placeholder,
  iconClass = "icon-[fluent--calendar-date-24-regular]",
  disabled = false,
  previousMonthLabel = "Previous",
  nextMonthLabel = "Next",
}: DatePickerFieldProps) {
  const id = useId().replaceAll(":", "");
  const triggerId = `date-picker-trigger-${id}`;
  const popoverId = `date-picker-popover-${id}`;
  const anchorName = `--date-picker-anchor-${id}`;

  const anchorStyle = { anchorName } as unknown as CSSProperties;
  const popoverStyle = { positionAnchor: anchorName } as unknown as CSSProperties;

  const calendarRef = useRef<(HTMLElement & { value?: string }) | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [calendarElement, setCalendarElement] = useState<HTMLElement | null>(null);
  const displayValue = formatDateForDisplay(value);
  const displayPlaceholder = placeholder ? formatDateForDisplay(placeholder) ?? placeholder : label;

  useEffect(() => {
    if (!calendarElement) {
      calendarRef.current = null;
      return;
    }

    const nextHandler = (event: Event) => {
      const target = event.currentTarget as { value?: string };
      const next = target.value && target.value.length > 0 ? target.value : null;
      onChange(next);
      onBlur?.();
      popoverRef.current?.hidePopover?.();
    };

    calendarElement.addEventListener("change", nextHandler);
    calendarRef.current = calendarElement as HTMLElement & { value?: string };

    return () => {
      calendarElement.removeEventListener("change", nextHandler);
    };
  }, [calendarElement, onBlur, onChange]);

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.value = value ?? "";
    }
  }, [value]);

  useEffect(
    () => () => {
      setCalendarElement(null);
    },
    [],
  );

  return (
    <FormField label={label} useInputWrapper={false} errors={errors}>
      <div className="w-full">
        <button
          type="button"
          id={triggerId}
          popoverTarget={popoverId}
          className="input input-bordered flex w-full items-center justify-between text-left"
          style={anchorStyle}
          disabled={disabled}
        >
          <span className={displayValue ? "" : "text-base-content/60"}>
            {displayValue ?? displayPlaceholder}
          </span>
          <span className={`${iconClass} size-4 opacity-70`} aria-hidden="true" />
        </button>

        <div
          ref={popoverRef}
          popover="auto"
          id={popoverId}
          className="dropdown rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
          style={popoverStyle}
        >
          {createElement(
            "calendar-date",
            {
              class: "cally",
              value: value ?? "",
              ref: setCalendarElement,
            },
            <svg
              aria-label={previousMonthLabel}
              className="size-4 fill-current"
              slot="previous"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>,
            <svg
              aria-label={nextMonthLabel}
              className="size-4 fill-current"
              slot="next"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>,
            createElement("calendar-month"),
          )}
        </div>
      </div>
    </FormField>
  );
}
