
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import "@/components/css/main.css";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Shop", href: "#shop" },
  { label: "Our Story", href: "/our-story" },
  { label: "Benefits", href: "#benefits" },
  { label: "Contact", href: "#footer" },
];

export default function Navbar() {
  const [loggedIn] = useState(false);
  const [username] = useState("Jeff");
  {
    /*const [theme, setTheme] = useState<"light" | "dark">("light");*/
  }
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("zoya-theme") as "light" | "dark" | null;
    const preferred = saved ?? "light";
    root.classList.remove("light", "dark");
    root.classList.add(preferred);
    setTheme(preferred);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
    localStorage.setItem("zoya-theme", next);
    setTheme(next);
  };

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--ghost-border)] bg-[color:var(--nav-bg)]/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-9xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <a href="#home" className="group flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-[#f5d71d] p-1 shadow-[0_12px_30px_rgba(52,5,141,0.12)]">
              <Image
                src="/images/zoya/zoya-symbol-dark-2.webp"
                alt="ZOYA Botanicals logo"
                fill
                className="object-cover "
              />
            </div>
            <div>
              <p className="text-base font-extrabold tracking-[-0.03em] text-[var(--brand-primary)] transition-all duration-500 group-hover:text-[var(--brand-primary-soft)] font-zoya">
                ZOYA Botanicals
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-10 md:flex">
            {navLinks.map((link, index) => {
              const active = index === 0;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`group relative pb-2 text-sm font-semibold transition-all duration-500 ${
                    active
                      ? "text-[var(--brand-primary)]"
                      : "text-[var(--text-muted)] hover:text-[var(--brand-primary)]"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-[var(--brand-accent)] transition-all duration-500 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-6 md:gap-8">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="zoya-icon-btn"
            >
              <span className="material-symbols-outlined text-[20px]">
                {theme === "light" ? (
                  <Icon icon="uil:moon" width="20" height="20" />
                ) : (
                  <Icon icon="solar:sun-linear" width="20" height="20" />
                )}
              </span>
            </button>

            <div className="hidden items-center rounded-2xl bg-[var(--surface-soft)] px-3 py-2 shadow-[inset_0_0_0_1px_var(--ghost-border)] md:flex">
              <span className="material-symbols-outlined mr-2 text-[18px] text-[var(--text-muted)]">
                <Icon
                  icon="bitcoin-icons:search-outline"
                  width="20"
                  height="20"
                />
              </span>
              <input
                type="text"
                placeholder="Search rituals..."
                className="w-40 bg-transparent text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none"
              />
            </div>

            {loggedIn ? (
              <a
                href="/account"
                className="flex flex-col items-center rounded-2xl px-2 py-1 text-[var(--brand-primary)] transition-all duration-500 hover:scale-105"
              >
                <span className="material-symbols-outlined text-[22px]">
                  <Icon icon="solar:user-outline" width="20" height="20" />
                </span>
                <span className="text-[10px] font-semibold">{username}</span>
              </a>
            ) : (
              <a
                href="/auth/login"
                className="ripple-btn rounded-md zoya-outline-btn dark:border-[var(--brand-primary)]"
              >
                Login
              </a>
            )}

            <a href="/cart" className="zoya-cart-icon-btn">
              <span className="material-symbols-outlined text-[20px]">
                <Icon icon="mage:bag-a" width="28" height="28" />
              </span>
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
