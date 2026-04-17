"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import AccountTitleBadge from "@/components/account/title-badge";
import { useToast } from "@/components/toast/toast-provider";

export default function PasswordForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
          acceptedPolicies,
        }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        showToast({
          title: "Password update failed",
          message: payload.error ?? "We could not change your password.",
          variant: "error",
        });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setAcceptedPolicies(false);

      showToast({
        title: "Password changed",
        message: payload.message ?? "Your new password is active.",
      });

      startTransition(() => {
        router.refresh();
      });
    } catch {
      showToast({
        title: "Network issue",
        message: "The server could not be reached. Please try again.",
        variant: "error",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_20px_60px_rgba(52,5,141,0.08)] dark:border-white/10 dark:bg-[#120d21] dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)] md:p-10">
        <div className="mb-10">
          <AccountTitleBadge icon="solar:shield-keyhole-linear" label="Security Center" />
          <p className="mt-4 text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[#948ea8] dark:text-[#a89dc4]">Account / Security / Change Password</p>
          <h1 className="mt-5 font-headline text-[3rem] font-extrabold leading-none tracking-[-0.06em] text-[#34058d] dark:text-[#f4eeff] md:text-[4.4rem]">
            Security &<br />Privacy Center
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-[#6f6a7d] dark:text-[#b6abcf]">
            Update your credentials to keep your botanical journey secure. Your current password is verified before any
            change is applied.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <label className="block">
            <span className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#938da7] dark:text-[#a89dc4]">
              Current Password
            </span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="h-14 w-full rounded-2xl border border-transparent bg-[#eceaf1] px-4 text-[0.98rem] text-[#322d40] outline-none transition-all duration-200 focus:border-[#cbbdf4] focus:bg-white dark:bg-[#1d1630] dark:text-[#f2edff] dark:focus:border-[#4b2ba3] dark:focus:bg-[#241b3a]"
              placeholder="Enter current password"
            />
          </label>

          <div>
            <label className="block">
              <span className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#938da7] dark:text-[#a89dc4]">
                New Password
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="h-14 w-full rounded-2xl border border-transparent bg-[#eceaf1] px-4 text-[0.98rem] text-[#322d40] outline-none transition-all duration-200 focus:border-[#cbbdf4] focus:bg-white dark:bg-[#1d1630] dark:text-[#f2edff] dark:focus:border-[#4b2ba3] dark:focus:bg-[#241b3a]"
                placeholder="Create a new password"
              />
            </label>
            <p className="mt-2 flex items-center gap-2 text-xs text-[#7a748a] dark:text-[#a89dc4]">
              <Icon icon="solar:info-circle-linear" width="14" height="14" />
              Minimum 12 characters and at least one symbol.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#938da7] dark:text-[#a89dc4]">
              Confirm New Password
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-14 w-full rounded-2xl border border-transparent bg-[#eceaf1] px-4 text-[0.98rem] text-[#322d40] outline-none transition-all duration-200 focus:border-[#cbbdf4] focus:bg-white dark:bg-[#1d1630] dark:text-[#f2edff] dark:focus:border-[#4b2ba3] dark:focus:bg-[#241b3a]"
              placeholder="Confirm the new password"
            />
          </label>

          <label className="flex items-start gap-3 text-sm leading-6 text-[#6f6a7d] dark:text-[#b6abcf]">
            <input
              type="checkbox"
              checked={acceptedPolicies}
              onChange={(event) => setAcceptedPolicies(event.target.checked)}
              className="mt-1 h-5 w-5 rounded border-[#c6c0d8] text-[#34058d]"
            />
            <span>
              I accept the <a href="/user/terms" className="font-bold text-[#34058d] dark:text-[#d7c4ff]">Terms & Conditions</a> and{" "}
              <a href="/user/privacy" className="font-bold text-[#34058d] dark:text-[#d7c4ff]">Privacy Policy</a>.
            </span>
          </label>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#34058d_0%,#4b2ba3_100%)] px-8 py-4 text-sm font-extrabold uppercase tracking-[0.2em] text-white shadow-[0_18px_40px_rgba(52,5,141,0.22)] transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </section>

      <aside className="space-y-6">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#fcdf46] p-6 text-[#5f4a00] dark:bg-[#332905] dark:text-[#ffe38a]">
          <Icon icon="solar:shield-check-linear" width="26" height="26" />
          <h3 className="mt-4 font-headline text-[1.45rem] font-extrabold tracking-[-0.04em]">Why update?</h3>
          <p className="mt-3 text-sm leading-7 text-[#755d02] dark:text-[#f6dc85]">
            Regularly updating your password helps protect your personal details, email identity, and future account
            actions.
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] bg-[linear-gradient(180deg,#45218d_0%,#27104d_100%)] p-6 text-white">
          <p className="text-[0.66rem] font-bold uppercase tracking-[0.22em] text-white/60">Member tip</p>
          <p className="mt-4 text-sm leading-7 text-white/84">
            Use a password you do not reuse elsewhere. Changing it here also protects every dashboard action tied to
            your account.
          </p>
        </div>
      </aside>
    </div>
  );
}
