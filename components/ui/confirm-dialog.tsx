"use client";

import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  disabled = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !disabled) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl"
      >
        <p id="confirm-dialog-title" className="text-sm font-semibold text-foreground">
          {title}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="px-4 py-1.5 text-xs font-medium rounded border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              destructive
                ? "border-transparent text-white"
                : "border-primary bg-primary text-primary-foreground"
            )}
            style={destructive ? { background: "var(--status-critical)" } : undefined}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
