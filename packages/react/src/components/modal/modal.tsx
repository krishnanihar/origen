"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import { twMerge } from "tailwind-merge";

export interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </BaseDialog.Root>
  );
}

export interface ModalTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalTrigger({ children, className }: ModalTriggerProps) {
  return <BaseDialog.Trigger className={className}>{children}</BaseDialog.Trigger>;
}

export interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function ModalContent({
  children,
  className,
  title,
  description,
}: ModalContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop
        className={twMerge(
          "fixed inset-0 z-50 bg-black/80",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        )}
      />
      <BaseDialog.Popup
        className={twMerge(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
      >
        {title && (
          <BaseDialog.Title className="text-lg font-semibold text-foreground">
            {title}
          </BaseDialog.Title>
        )}
        {description && (
          <BaseDialog.Description className="mt-2 text-sm text-muted-foreground">
            {description}
          </BaseDialog.Description>
        )}
        <div className="mt-4">{children}</div>
        <BaseDialog.Close
          className={twMerge(
            "absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

function XIcon({ className }: { className?: string }) {
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

Modal.Trigger = ModalTrigger;
Modal.Content = ModalContent;

Modal.displayName = "Modal";
ModalTrigger.displayName = "ModalTrigger";
ModalContent.displayName = "ModalContent";
