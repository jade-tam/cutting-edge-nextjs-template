"use client";

import { useMemo, useState } from "react";

import FormField from "@/components/form/form-field";

type StrengthLabels = {
  weak: string;
  fair: string;
  good: string;
  strong: string;
};

type PasswordFieldProps = {
  label: string;
  value: string;
  errors?: unknown[];
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder: string;
  showStrength?: boolean;
  showLabel: string;
  hideLabel: string;
  showMoreErrorsLabel: (count: number) => string;
  showLessErrorsLabel: string;
  strengthLabels: StrengthLabels;
};

function getStrength(value: string): { statusClass: string; text: keyof StrengthLabels } {
  let score = 0;

  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (score <= 2) return { statusClass: "status-error", text: "weak" };
  if (score <= 3) return { statusClass: "status-warning", text: "fair" };
  if (score <= 4) return { statusClass: "status-info", text: "good" };

  return { statusClass: "status-success", text: "strong" };
}

export default function PasswordField({
  label,
  value,
  errors = [],
  onChange,
  onBlur,
  placeholder,
  showStrength = false,
  showLabel,
  hideLabel,
  showMoreErrorsLabel,
  showLessErrorsLabel,
  strengthLabels,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const strength = useMemo(() => getStrength(value), [value]);

  return (
    <div className="flex flex-col gap-1">
      <FormField
        label={label}
        iconClass="icon-[fluent--key-24-regular]"
        errors={errors}
        showMoreLabel={showMoreErrorsLabel}
        showLessLabel={showLessErrorsLabel}
      >
        <input
          aria-label={label}
          className="flex-1 min-w-0"
          type={visible ? "text" : "password"}
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="btn btn-ghost btn-square btn-xs"
          aria-label={visible ? hideLabel : showLabel}
          onClick={() => setVisible((prev) => !prev)}
        >
          <span
            className={
              visible
                ? "icon-[fluent--eye-off-24-regular] size-4"
                : "icon-[fluent--eye-24-regular] size-4"
            }
            aria-hidden="true"
          />
        </button>
      </FormField>

      {showStrength && value.length > 0 ? (
        <span className="text-base-content/60 flex items-center gap-2 px-1 text-[0.6875rem]">
          <span className={`status inline-block ${strength.statusClass}`} />
          {strengthLabels[strength.text]}
        </span>
      ) : null}
    </div>
  );
}
