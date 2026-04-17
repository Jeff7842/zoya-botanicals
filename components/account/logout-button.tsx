"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Icon } from "@iconify/react";
import { useToast } from "@/components/toast/toast-provider";

export default function AccountLogoutButton() {
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    try {
      setPending(true);
      showToast({
        title: "Logging out",
        message: "Logging out from your account.",
        variant: "info",
      });

      await signOut({
        redirect: false,
      });

      window.location.href = "/";
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
    >
      <Icon icon="solar:logout-2-outline" width="18" height="18" />
      <span>{pending ? "Logging out..." : "Log out"}</span>
    </button>
  );
}
