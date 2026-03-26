"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import "@/components/css/main.css";
import "@/components/css/signup.css"
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";

const supportCards = [
  {
    number: "01",
    title: "Security First",
    text: "Our botanical ecosystem is protected by high-end encryption to ensure your wellness journey remains private.",
  },
  {
    number: "02",
    title: "Curated Experience",
    text: "Once verified, you'll gain access to our personalized supplement recommendation engine and botanical laboratory.",
  },
  {
    number: "03",
    title: "Help Center",
    text: "Didn't get the email? Contact our curator team at support@zoyabotanicals.com for immediate assistance.",
  },
];

export default function VerifyPendingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--page-bg)] text-[var(--text-main)] transition-colors duration-500 font-body">
      <Navbar />

      <main className="verify-pending-mesh relative min-h-screen px-4 pb-16 pt-28 md:px-8 md:pb-24 md:pt-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-12 md:gap-14">
          <div className="zoya-reveal zoya-reveal-left relative flex items-center justify-center md:col-span-5 md:min-h-[29rem]">
            <div className="absolute inset-0 rounded-[4rem] bg-[rgba(75,43,163,0.05)] rotate-6 scale-[1.04] dark:bg-[rgba(205,189,255,0.07)]" />

            <div className="relative rounded-[2.75rem] border border-white/40 bg-[var(--surface-card)] p-10 shadow-[0_32px_64px_-16px_rgba(52,5,141,0.08)] dark:border-white/10 dark:shadow-[0_28px_60px_-18px_rgba(0,0,0,0.45)] md:p-12">
              <svg
                className="h-32 w-32 text-[var(--brand-primary)] md:h-48 md:w-48"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <path
                  className="verify-bloom-path"
                  d="M50,90 C50,90 50,60 50,40 M50,40 C30,40 10,20 10,10 M50,40 C70,40 90,20 90,10 M50,40 C50,20 30,5 50,5 C70,5 50,20 50,40 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="50"
                  cy="40"
                  r="3"
                  fill="currentColor"
                  className="animate-pulse"
                />
                <path
                  className="verify-bloom-path"
                  d="M35,60 Q50,50 65,60"
                  fill="none"
                  stroke="#fcdf46"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="absolute -bottom-4 right-2 rounded-full bg-[var(--brand-accent)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#6d5e00] shadow-[0_18px_40px_rgba(252,223,70,0.24)] md:-right-2">
              Pending
            </div>
          </div>

          <div className="zoya-reveal zoya-reveal-right md:col-span-7">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="font-headline text-5xl font-extrabold leading-[0.9] tracking-[-0.05em] text-[var(--brand-primary)] sm:text-6xl lg:-ml-1 lg:text-[5.2rem]">
                  Nurturing
                  <br />
                  <span className="text-(--brand-primary-light) font-zoya tracking-wide ">
                    your
                  </span> access.
                </h1>

                <p className="max-w-xl text-[1.12rem] font-medium leading-8 text-[var(--text-muted)] md:text-[1.3rem] md:leading-9">
                  Check your email to verify your account. We&apos;ve sent a botanical key to your inbox.
                </p>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl bg-[var(--surface-soft)] p-6 shadow-[0_16px_38px_rgba(52,5,141,0.04)] ring-1 ring-[var(--ghost-border)]">
                  <div className="mb-3 flex items-center gap-3 text-[var(--brand-primary)]">
                    <Icon icon="material-symbols:schedule" className="text-[1.35rem]" />
                    <span className="text-sm font-extrabold uppercase tracking-[0.14em]">
                      Time Sensitive
                    </span>
                  </div>

                  <p className="text-sm font-medium leading-7 text-[var(--text-muted)] md:text-[1rem]">
                    The link will expire in{" "}
                    <span className="font-extrabold text-[var(--brand-primary)]">
                      15 minutes
                    </span>
                    . If you don&apos;t see it, check your spam or nursery folders.
                  </p>
                </div>

                <p className="max-w-2xl text-sm italic leading-7 text-[var(--text-muted)] md:text-[1.05rem]">
                  It&apos;s okay to continue exploring the home page while you wait, or return to the login screen.
                </p>

                <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                  <Link
                    href="/"
                    className="ripple-btn zoya-primary-btn verify-pending-primary-btn flex-1 text-center"
                  >
                    Return Home
                  </Link>

                  <Link
                    href="/auth/login"
                    className="ripple-btn zoya-secondary-btn verify-pending-secondary-btn flex-1 text-center"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto mt-20 grid max-w-7xl gap-10 md:mt-24 md:grid-cols-3 md:gap-8">
          {supportCards.map((item, index) => (
            <article
              key={item.number}
              className="zoya-reveal space-y-3"
              style={{ animationDelay: `${index * 140}ms` }}
            >
              <span className="text-4xl font-black tracking-[-0.04em] text-[var(--brand-primary-light)] opacity-50">
                {item.number}
              </span>

              <h3 className="font-headline text-[1.45rem] font-extrabold tracking-[-0.03em] text-[var(--brand-primary)]">
                {item.title}
              </h3>

              <p className="max-w-md text-[0.98rem] leading-8 text-[var(--text-muted)]">
                {item.text}
              </p>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}