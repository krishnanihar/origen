"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui-components/react/select";
import { twMerge } from "tailwind-merge";

export interface SelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled,
  className,
}: SelectProps) {
  const handleValueChange = React.useCallback(
    (newValue: string | null) => {
      onValueChange?.(newValue);
    },
    [onValueChange]
  );

  return (
    <BaseSelect.Root
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <BaseSelect.Trigger
        className={twMerge(
          "flex h-10 w-full items-center justify-between rounded-md border border-input",
          "bg-background px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <BaseSelect.Value>
          {(state) => state.value ?? placeholder}
        </BaseSelect.Value>
        <BaseSelect.Icon>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner>
          <BaseSelect.Popup
            className={twMerge(
              "z-50 min-w-[8rem] overflow-hidden rounded-md border border-border",
              "bg-card text-card-foreground shadow-md",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            )}
          >
            {options.map((option) => (
              <BaseSelect.Item
                key={option.value}
                value={option.value}
                className={twMerge(
                  "relative flex cursor-pointer select-none items-center",
                  "rounded-sm px-2 py-1.5 text-sm outline-none",
                  "data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                )}
              >
                <BaseSelect.ItemIndicator className="mr-2">
                  <CheckIcon className="h-4 w-4" />
                </BaseSelect.ItemIndicator>
                <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

Select.displayName = "Select";
