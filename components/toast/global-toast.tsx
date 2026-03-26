"use client";

import { Icon } from "@iconify/react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type GlobalToast = {
  show: boolean;
  title: string;
  message: string;
  variant?: ToastVariant;
};

type Props = {
  toast: GlobalToast;
  onClose?: () => void;
};

const variantStyles: Record<
  ToastVariant,
  {
    icon: string;
    iconWrap: string;
    titleColor: string;
  }
> = {
  success: {
    icon: "solar:check-circle-bold",
    iconWrap:
      "bg-[var(--brand-accent)] text-[#5b4b00] shadow-[0_12px_30px_rgba(252,223,70,0.24)]",
    titleColor: "text-[var(--brand-primary)]",
  },
  error: {
    icon: "solar:close-circle-bold",
    iconWrap:
      "bg-red-100 text-red-700 shadow-[0_12px_30px_rgba(239,68,68,0.18)] dark:bg-red-500/15 dark:text-red-300",
    titleColor: "text-red-700 dark:text-red-300",
  },
  warning: {
    icon: "solar:danger-bold",
    iconWrap:
      "bg-amber-100 text-amber-700 shadow-[0_12px_30px_rgba(245,158,11,0.18)] dark:bg-amber-500/15 dark:text-amber-300",
    titleColor: "text-amber-700 dark:text-amber-300",
  },
  info: {
    icon: "solar:info-circle-bold",
    iconWrap:
      "bg-blue-100 text-blue-700 shadow-[0_12px_30px_rgba(59,130,246,0.18)] dark:bg-blue-500/15 dark:text-blue-300",
    titleColor: "text-blue-700 dark:text-blue-300",
  },
};

export default function ContactToast({ toast, onClose }: Props) {
  const variant = toast.variant ?? "success";
  const styles = variantStyles[variant];

  return (
    <div
      className={`fixed right-4 top-24 z-[999] w-[calc(100%-2rem)] max-w-sm rounded-[1.4rem] bg-[var(--surface-card)] p-4 shadow-[0_20px_60px_rgba(52,5,141,0.16)] ring-1 ring-[var(--ghost-border)] transition-all duration-500 ${
        toast.show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-3 opacity-0"
      }`}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${styles.iconWrap}`}
        >
          <Icon icon={styles.icon} width="20" height="20" />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-extrabold tracking-[-0.02em] ${styles.titleColor}`}
          >
            {toast.title}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            {toast.message}
          </p>
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification"
            className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors duration-300 hover:bg-[var(--surface-soft)] hover:text-[var(--brand-primary)]"
          >
            <Icon icon="ic:round-close" width="18" height="18" />
          </button>
        ) : null}
      </div>
    </div>
  );
}