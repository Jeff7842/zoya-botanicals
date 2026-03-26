"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import CleanVerifyUrl from "./CleanVerifyUrl";

type StatusKey =
  | "success"
  | "expired"
  | "invalid"
  | "timeout"
  | "error"
  | "failed";

  const VERIFY_STATUS_CODES = {
  success: "K9X2M4Q7L8NP",
  expired: "T4B8W1C6R2YM",
  invalid: "N7D3P5H9Q1ZX",
  timeout: "F2J8L4S6V0KD",
  error: "R6M1X9A3T7QC",
  failed: "Y5P2E8U4B1HN",
} as const;


type StatusConfig = {
  title: string;
  text: string;
  actionLabel: string;
  actionHref: string;
  icon: string;
  iconWrapClass: string;
  iconClass: string;
};

export default function VerifiedUserView({ status }: { status: StatusKey }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const statusMap: Record<StatusKey, StatusConfig> = {
    success: {
      title: "Account verified",
      text: "Your email has been verified successfully. You can now log in.",
      actionLabel: "Go to login",
      actionHref: "/auth/login",
      icon: "material-symbols:verified-user-rounded",
      iconWrapClass:
        "bg-[#dcefdc] text-[#235c38] shadow-[0_18px_40px_rgba(35,92,56,0.18)] dark:bg-[#193524] dark:text-[#8fd6a8]",
      iconClass: "text-current",
    },
    expired: {
      title: "Verification link expired",
      text: "This verification link has expired. Request a new one to continue securing your account.",
      actionLabel: "Request new link",
      actionHref: "/auth/login",
      icon: "material-symbols:schedule-rounded",
      iconWrapClass:
        "bg-[#fff2cc] text-[#7a5b00] shadow-[0_18px_40px_rgba(252,223,70,0.18)] dark:bg-[#3a2f0b] dark:text-[#ffe24c]",
      iconClass: "text-current",
    },
    invalid: {
      title: "Invalid verification link",
      text: "This verification link is not valid. Use the latest email or request a fresh verification link.",
      actionLabel: "Back to login",
      actionHref: "/auth/login",
      icon: "material-symbols:link-off-rounded",
      iconWrapClass:
        "bg-[#ffe0db] text-[#a12614] shadow-[0_18px_40px_rgba(186,26,26,0.12)] dark:bg-[#3b1717] dark:text-[#ffb4ab]",
      iconClass: "text-current",
    },
    timeout: {
      title: "Verification timed out",
      text: "The verification process took too long. Start again and complete it before the session expires.",
      actionLabel: "Try again",
      actionHref: "/auth/login",
      icon: "material-symbols:timer-off-rounded",
      iconWrapClass:
        "bg-[#ffe8cc] text-[#8a5200] shadow-[0_18px_40px_rgba(255,167,38,0.16)] dark:bg-[#3b2410] dark:text-[#ffcf99]",
      iconClass: "text-current",
    },
    error: {
      title: "Verification failed",
      text: "Something went wrong while verifying your account. Please try again in a moment.",
      actionLabel: "Try again",
      actionHref: "/contact",
      icon: "material-symbols:error-rounded",
      iconWrapClass:
        "bg-[#ffdad6] text-[#ba1a1a] shadow-[0_18px_40px_rgba(186,26,26,0.12)] dark:bg-[#3b1717] dark:text-[#ffb4ab]",
      iconClass: "text-current",
    },
    failed: {
      title: "Verification failed",
      text: "Something went wrong while verifying your account. Please try again in a moment.",
      actionLabel: "Try again",
      actionHref: "/auth/signup",
      icon: "material-symbols:error-rounded",
      iconWrapClass:
        "bg-[#ffdad6] text-[#ba1a1a] shadow-[0_18px_40px_rgba(186,26,26,0.12)] dark:bg-[#3b1717] dark:text-[#ffb4ab]",
      iconClass: "text-current",
    },
  };

  const content = statusMap[status] ?? statusMap.failed;

  return (
    <>
    <CleanVerifyUrl />
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--page-bg)] text-[var(--text-main)] transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(231,222,255,0.55)_0%,transparent_32%),radial-gradient(circle_at_bottom_left,rgba(252,223,70,0.09)_0%,transparent_24%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(164,130,255,0.14)_0%,transparent_32%),radial-gradient(circle_at_bottom_left,rgba(252,223,70,0.05)_0%,transparent_24%)]" />
      </div>

      <div className="pointer-events-none absolute -right-[3.75rem] top-[7rem] h-[15.4rem] w-[15.4rem] rounded-full bg-[#d8d0ec] opacity-80 dark:bg-[#2a2145]" />
      <div className="pointer-events-none absolute bottom-[12.4rem] left-[2.4rem] h-[7.7rem] w-[7.7rem] rounded-full bg-[#e3dfd1] opacity-95 dark:bg-[#2a2732]" />

      <header className="relative z-10 flex w-full items-center px-[1.65rem] pb-0 pt-[1.7rem]">
        <div className="flex items-center gap-[0.75rem]">
          <div className="relative h-full w-8">
            <Image
              src={
                isDark
                  ? "/images/zoya/zoya-symbol-yellow-2.webp"
                  : "/images/zoya/zoya-symbol-dark-2.webp"
              }
              alt="ZOYA Botanicals"
              width={1000}
              height={1000}
              priority
            />
          </div>

          <span className="font-headline text-[1rem] font-zoya uppercase tracking-[-0.04em] text-[var(--brand-primary)]">
            ZOYA <br />{" "}
            <span className="text-[0.8rem] -mt-5 tracking-normal">
              BOTANICALS
            </span>
          </span>
        </div>
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-6 pb-[4.75rem] pt-[2.8rem]">
        <div className="relative w-full max-w-[45.25rem]">
          <div className="rounded-[2.1rem] border border-white/45 bg-[var(--surface-card)] px-[4.4rem] pb-[4.15rem] pt-[4.3rem] text-center shadow-[0_34px_74px_-18px_rgba(52,5,141,0.10)] transition-colors duration-500 dark:border-white/8 dark:shadow-[0_30px_70px_-18px_rgba(0,0,0,0.42)]">
            <div className="mx-auto mb-[2.55rem] flex h-[5.4rem] w-[5.4rem] items-center justify-center rounded-[1rem] transition-colors duration-500 sm:h-[5.2rem] sm:w-[5.2rem]">
              <div
                className={`flex h-full w-full items-center justify-center rounded-[1rem] ${content.iconWrapClass}`}
              >
                <Icon
                  icon={content.icon}
                  width="40"
                  height="40"
                  className={content.iconClass}
                />
              </div>
            </div>

            <h1 className="mx-auto max-w-[34rem] font-headline text-[3.5rem] font-extrabold leading-[0.96] tracking-[-0.06em] text-[var(--brand-primary)] sm:text-[3.25rem]">
              {content.title}
            </h1>

            <p className="mx-auto mt-[1.7rem] max-w-[31rem] text-[1.02rem] leading-[1.9] text-[var(--text-muted)] sm:text-[0.98rem]">
              {content.text}
            </p>

            <Link
              href={content.actionHref}
              className="group mt-[2.55rem] inline-flex h-[4.2rem] w-full items-center justify-center rounded-[0.65rem] bg-[linear-gradient(135deg,#4b2ba3_0%,#522fae_100%)] px-8 text-[1rem] font-extrabold text-white shadow-[0_16px_34px_rgba(52,5,141,0.18)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(52,5,141,0.26)] active:scale-[0.995] dark:bg-[linear-gradient(135deg,#a482ff_0%,#8c68ff_100%)] dark:text-[#140c27]"
            >
              <span>{content.actionLabel}</span>
              <Icon
                icon="material-symbols:arrow-forward-rounded"
                width="24"
                height="24"
                className="ml-3 transition-transform duration-500 group-hover:translate-x-1"
              />
            </Link>

            <div className="mt-[3.35rem] border-t border-[rgba(122,117,132,0.10)] pt-[2.2rem] dark:border-white/8">
              <div className="flex flex-wrap items-center justify-center gap-[1rem]">
                <div className="inline-flex h-[2.45rem] items-center gap-2 rounded-[0.85rem] bg-[var(--surface-soft)] px-[1.15rem] text-[0.68rem] font-semibold uppercase tracking-[0.23em] text-[var(--text-muted)]">
                  <Icon
                    icon="material-symbols:spa-outline-rounded"
                    width="16"
                    height="16"
                    className="text-[var(--brand-primary)]"
                  />
                  <span>Pure Extracts</span>
                </div>

                <div className="inline-flex h-[2.45rem] items-center gap-2 rounded-[0.85rem] bg-[var(--surface-soft)] px-[1.15rem] text-[0.68rem] font-semibold uppercase tracking-[0.23em] text-[var(--text-muted)]">
                  <Icon
                    icon="material-symbols:science-outline-rounded"
                    width="16"
                    height="16"
                    className="text-[var(--brand-primary)]"
                  />
                  <span>Lab Proven</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 flex w-full flex-col items-center justify-between gap-6 px-[1.7rem] pb-[2rem] pt-0 text-[11px] font-normal uppercase tracking-[0.18em] text-[#93a0b7] md:flex-row">
        <div className="flex flex-wrap items-center gap-[2.2rem]">
          <Link
            href="/privacy-policy"
            className="transition-colors duration-300 hover:text-[var(--brand-primary)]"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms-of-service"
            className="transition-colors duration-300 hover:text-[var(--brand-primary)]"
          >
            Terms of Service
          </Link>
          <Link
            href="/help-center"
            className="transition-colors duration-300 hover:text-[var(--brand-primary)]"
          >
            Help Center
          </Link>
        </div>

        <p className="text-center font-medium tracking-[0.06em] md:text-right">
          © 2026 ZOYA BOTANICALS. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </main>
    </>
  );
}