"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/toast/toast-provider";
import { notifyAuthStateChanged } from "@/lib/auth/client-auth";

type AccountDeleteSectionProps = {
  displayName: string;
};

export default function AccountDeleteSection({ displayName }: AccountDeleteSectionProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState<"closed" | "confirm" | "verify">("closed");
  const [confirmationValue, setConfirmationValue] = useState("");
  const [pending, setPending] = useState(false);
  const canDelete = useMemo(() => confirmationValue.trim() === "DELETE", [confirmationValue]);

  async function handleDeleteAccount() {
    try {
      setPending(true);

      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Cache-Control": "no-store",
        },
        body: JSON.stringify({
          confirmation: confirmationValue.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "We could not delete your account right now.");
      }

      notifyAuthStateChanged();
      showToast({
        title: "Account deleted",
        message: payload?.message ?? "Your account has been permanently deleted.",
      });

      router.replace("/");
      router.refresh();
      window.location.href = "/";
    } catch (error) {
      showToast({
        title: "Delete failed",
        message: error instanceof Error ? error.message : "We could not delete your account right now.",
        variant: "error",
      });
    } finally {
      setPending(false);
    }
  }

  function closeModal() {
    if (pending) {
      return;
    }

    setStep("closed");
    setConfirmationValue("");
  }

  return (
    <>
      <section className="rounded-[2rem] border border-red-200/80 bg-[linear-gradient(135deg,#fff4f3_0%,#fff8f7_100%)] p-6 shadow-[0_24px_60px_rgba(132,23,23,0.08)] dark:border-red-500/20 dark:bg-[linear-gradient(135deg,#2b1016_0%,#170a10_100%)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.32)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full bg-red-100 px-3 py-1 text-[0.66rem] font-black uppercase tracking-[0.22em] text-red-700 dark:bg-red-500/10 dark:text-red-200">
              Danger zone
            </p>
            <h2 className="mt-5 text-[1.75rem] font-extrabold tracking-[-0.04em] text-[#7f1d1d] dark:text-[#ffd5d5]">
              Delete Account
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#8a3b3b] dark:text-[#f0b3b3]">
              This permanently deletes {displayName}&apos;s account, clears the active session, and removes access to the
              account dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setStep("confirm")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_18px_40px_rgba(220,38,38,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700"
          >
            <Icon icon="solar:trash-bin-trash-bold" width="18" height="18" />
            <span>Delete Account</span>
          </button>
        </div>
      </section>

      {step !== "closed" ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close delete account dialog"
            className="absolute inset-0 bg-[#14072f]/65 backdrop-blur-[8px]"
            onClick={closeModal}
          />

          <div className="relative z-[141] w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--surface-card)] shadow-[0_30px_90px_rgba(24,7,55,0.24)]">
            {step === "confirm" ? (
              <div className="p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.4rem] bg-red-50 text-red-600 shadow-[0_10px_30px_rgba(220,38,38,0.12)] dark:bg-red-500/10 dark:text-red-300">
                    <Icon icon="solar:danger-triangle-bold" width="24" height="24" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[1.15rem] font-extrabold tracking-[-0.02em] text-[var(--text-primary)]">
                      Delete this account?
                    </h3>
                    <p className="mt-2 text-[0.96rem] leading-7 text-[var(--text-muted)]">
                      This action is permanent. Once you continue, you&apos;ll need one more confirmation before the
                      account is deleted for real.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center justify-center rounded-2xl border border-[var(--ghost-border)] px-4 py-3 text-[0.95rem] font-semibold text-[var(--text-main)] transition-all duration-200 hover:bg-white/5"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("verify")}
                    className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-[0.95rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.4rem] bg-red-50 text-red-600 shadow-[0_10px_30px_rgba(220,38,38,0.12)] dark:bg-red-500/10 dark:text-red-300">
                    <Icon icon="solar:shield-cross-bold" width="24" height="24" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[1.15rem] font-extrabold tracking-[-0.02em] text-[var(--text-primary)]">
                      Final confirmation
                    </h3>
                    <p className="mt-2 text-[0.96rem] leading-7 text-[var(--text-muted)]">
                      Type <span className="font-black text-red-600 dark:text-red-300">DELETE</span> in capital letters,
                      then press Delete Account.
                    </p>
                  </div>
                </div>

                <label className="mt-6 block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Confirmation word
                  </span>
                  <input
                    value={confirmationValue}
                    onChange={(event) => setConfirmationValue(event.target.value)}
                    placeholder="DELETE"
                    className="h-14 w-full rounded-[1rem] border border-red-200 bg-white px-4 text-base font-semibold text-[#3b1010] outline-none transition-colors focus:border-red-500 dark:border-red-500/20 dark:bg-[#1b1116] dark:text-[#ffe5e5]"
                  />
                </label>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={pending}
                    className="inline-flex items-center justify-center rounded-2xl border border-[var(--ghost-border)] px-4 py-3 text-[0.95rem] font-semibold text-[var(--text-main)] transition-all duration-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={!canDelete || pending}
                    className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-[0.95rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
