/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import "@/components/css/main.css";

export default function ZoyaForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#f9f9fc] text-[#1a1c1e] transition-colors duration-300 dark:bg-[#140a2f] dark:text-white">
      <Navbar />

      <main className="flex min-h-screen items-center justify-center px-6 pb-14 pt-28 md:px-8 md:pb-16 md:pt-32">
        <div className="mx-auto grid w-full max-w-[74rem] grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-14">
          {/* Visual side */}
          <div className="relative order-2 md:order-1">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] bg-[#f3f3f6] dark:bg-[#1b1431]">
              <Image
                src="/images/zoya/flower.png"
                alt="Botanical scene"
                fill
                priority
                className="object-cover grayscale opacity-40 mix-blend-multiply dark:opacity-30"
                sizes="(max-width: 768px) 100vw, 42vw"
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex h-48 w-48 items-center justify-center md:h-52 md:w-52">
                  <svg
                    className="h-full w-full text-[#6549bf] dark:text-[#cdbdff]"
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      className="animate-[spin_20s_linear_infinite]"
                    />
                    <path
                      d="M35 45 C 35 25, 65 25, 65 45 L 65 55 L 35 55 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <rect
                      x="30"
                      y="55"
                      width="40"
                      height="30"
                      rx="2"
                      fill="currentColor"
                      opacity="0.1"
                    />
                    <path
                      d="M50 65 L 50 75"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle cx="50" cy="65" r="3" fill="currentColor" />
                    <path
                      d="M20 80 Q 30 70 40 80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M80 20 Q 70 30 60 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-0 hidden rounded-[0.45rem] bg-[#fcdf46] px-7 py-7 shadow-[0_14px_32px_rgba(252,223,70,0.22)] md:block dark:text-[#524600]">
              <span className="font-[Manrope] text-[2rem] font-extrabold tracking-[-0.04em] text-[#6d5e00]">
                403
              </span>
            </div>
          </div>

          {/* Content side */}
          <div className="order-1 flex flex-col items-start gap-8 md:order-2">
            <div className="space-y-4">
              <span className="text-[0.78rem] font-extrabold uppercase tracking-[0.32em] text-[#34058d] dark:text-[#cdbdff]">
                Access Restricted
              </span>

              <h1 className="font-[Manrope] text-[4rem] font-black leading-[0.9] tracking-[-0.08em] text-[#1f1f8f] dark:text-white sm:text-[4.5rem] md:text-[5.2rem]">
                Private
                <br />
                <span className="font-light italic text-[#34058d] dark:text-[#cdbdff]">
                  Sanctuary
                </span>
              </h1>
            </div>

            <div className="space-y-6">
              <p className="max-w-[28rem] text-[1.18rem] leading-[1.75] text-[#494553] dark:text-[#c9c4d7]">
                This digital greenhouse is reserved for our most refined botanical
                compositions. Access is currently limited to{" "}
                <span className="font-semibold text-[#1f1f8f] underline decoration-[#fcdf46] decoration-4 underline-offset-2 dark:text-white">
                  authorized curators
                </span>{" "}
                and founding members.
              </p>

              <div className="w-full max-w-[28rem] rounded-[1rem] bg-[#f3f3f6] p-6 dark:bg-[#1b1431]">
                <div className="mb-3 flex items-center gap-3">
                  <Icon
                    icon="material-symbols:verified-user-outline-rounded"
                    className="text-[1rem] text-[#34058d] dark:text-[#cdbdff]"
                  />
                  <span className="text-[0.8rem] font-extrabold uppercase tracking-[0.12em] text-[#1f1f8f] dark:text-white">
                    Curation Status: Locked
                  </span>
                </div>

                <p className="text-[1rem] italic text-[#494553] dark:text-[#c9c4d7]">
                  "True wellness requires patience and privacy."
                </p>
              </div>
            </div>

            <div className="flex w-full max-w-[32rem] flex-col gap-4 sm:flex-row">
              <Link
                href="/auth/signup"
                className="inline-flex min-h-[3.9rem] flex-1 items-center justify-center rounded-[0.45rem] bg-[#34058d] px-8 py-4 text-center text-[1.05rem] font-extrabold tracking-[-0.02em] text-white shadow-[0_18px_34px_rgba(52,5,141,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4b2ba3] active:scale-[0.985]"
              >
                Get Access
              </Link>

              <Link
                href="/"
                className="inline-flex min-h-[3.9rem] flex-1 items-center justify-center rounded-[0.45rem] border border-[#cac4d5]/50 bg-transparent px-8 py-4 text-center text-[1.05rem] font-extrabold tracking-[-0.02em] text-[#1f1f8f] transition-all duration-300 hover:bg-white active:scale-[0.985] dark:border-white/10 dark:text-white dark:hover:bg-[#1b1431]"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}