"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "@/components/css/main.css";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Our Story", href: "/our-story" },
  { label: "Benefits", href: "/benefits" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
const [username, setUsername] = useState("");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
  if (!mounted) return;
  setTheme(resolvedTheme === "light" ? "dark" : "light");
};

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
  let active = true;

  const loadUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!active) return;

      if (data.authenticated && data.user) {
        setLoggedIn(true);
        setUsername(data.user.username ?? data.user.first_name ?? "Account");
      } else {
        setLoggedIn(false);
        setUsername("");
      }
    } catch {
      if (!active) return;
      setLoggedIn(false);
      setUsername("");
    }
  };

  loadUser();

  return () => {
    active = false;
  };
}, []);

const handleLogout = async () => {
  try {
    setIsLoggingOut(true);

    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setLogoutModalOpen(false);
    setMobileMenuOpen(false);
    window.location.href = "/";
  } finally {
    setIsLoggingOut(false);
  }
};

useEffect(() => {
  if (!logoutModalOpen) return;

  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = originalOverflow;
  };
}, [logoutModalOpen]);

  return (
    <>
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--ghost-border)] bg-[color:var(--nav-bg)]/80 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-9xl items-center justify-between gap-3 px-4 py-3 sm:px-5 md:px-8">
        {/* Logo */}
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <div className=" h-auto w-5 shrink-0  transition-transform duration-500 group-hover:scale-105 sm:w-5">
            <Image
              src={ resolvedTheme ? '/images/zoya/zoya-symbol-yellow.webp' :'/images/zoya/zoya-symbol-dark-2.webp' }
              alt="ZOYA Botanicals logo"
              width={1000}
              height={1000}
              className=""
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold align-bottom justify-baseline tracking-[-0.03em] leading-[0.92] text-[var(--brand-primary)] transition-all duration-500 group-hover:text-[var(--brand-primary-soft)] font-zoya sm:text-base">
              ZOYA <br/> <span className="text-[0.8rem] -mt-5 tracking-normal">BOTANICALS</span>
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const active = isActiveLink(link.href);

            return (
              <Link
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
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Desktop theme toggle */}
          <div className="hidden lg:inline-flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="zoya-icon-btn hidden lg:inline-flex"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mounted ? (
  resolvedTheme === "light" ? (
    <Icon icon="uil:moon" width="20" height="20" />
  ) : (
    <Icon icon="solar:sun-linear" width="20" height="20" />
  )
) : (
  <Icon icon="solar:sun-linear" width="20" height="20" />
)}
            </span>
          </button>
          </div>

          {/* Desktop search */}
          <div className="hidden items-center rounded-2xl bg-[var(--surface-soft)] px-3 py-2 shadow-[inset_0_0_0_1px_var(--ghost-border)] xl:flex">
            <span className="mr-2 text-[18px] text-[var(--text-muted)]">
              <Icon icon="bitcoin-icons:search-outline" width="20" height="20" />
            </span>
            <input
              type="text"
              placeholder="Search rituals..."
              className="w-40 bg-transparent text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none"
            />
          </div>

          {/* Desktop login/profile */}
          <div className="hidden md:flex">
            {loggedIn ? (
              
    <a
      href="/account"
      className="flex items-center gap-3 rounded-2xl border border-[var(--ghost-border)] bg-[var(--surface-soft)] px-3 py-2 text-[var(--brand-primary)] shadow-sm transition-all duration-500 hover:scale-105 hover:shadow-md"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
        <Icon icon="solar:user-outline" width="20" height="20" />
      </span>

      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">Account</span>
        <span className="text-[11px] font-medium text-[var(--text-muted)]">
          {username}
        </span>
      </span>
    </a>
  ) : (
              <a
                href="/auth/login"
                className="ripple-btn rounded-xl zoya-outline-btn px-4 py-2 dark:border-[var(--brand-primary)]"
              >
                Login
              </a>
            )}
          </div>

          {/* Cart */}
          <a
            href="/cart"
            aria-label="Cart"
            className="flex h-11 w-11 items-center justify-center bg-transparent rounded-2xl border border-white/0 hover:border-[var(--ghost-border)] hover:bg-[var(--surface-soft)] active:border-[var(--ghost-border)] active:bg-[var(--surface-soft)] text-[var(--brand-primary)] hover:shadow-sm transition-all duration-500 hover:-translate-y-0.5 active:shadow-md"
          >
            <Icon icon="mage:bag-a" width="24" height="24" />
          </a>

          {/* Mobile user icon: between cart and menu */}
          {loggedIn && (
  <a
    href="/account"
    aria-label="Account"
    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--ghost-border)] bg-[var(--surface-soft)] text-[var(--brand-primary)] shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md md:hidden"
  >
    <Icon icon="solar:user-outline" width="22" height="22" />
  </a>
)}

          {/* Mobile menu button */}
          <div className="relative lg:hidden" ref={menuRef}>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--ghost-border)] bg-[var(--surface-soft)] text-[var(--text-main)] shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md"
            >
              <Icon
                icon={mobileMenuOpen ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"}
                width="24"
                height="24"
              />
            </button>

            {/* Mobile dropdown */}
            <div
              className={`absolute right-0 top-[calc(100%+14px)] w-[290px] origin-top-right overflow-hidden rounded-[28px] border border-white/10 bg-[color:var(--nav-bg)]/95 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition-all duration-300 sm:w-[320px] ${
                mobileMenuOpen
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-2 scale-95 opacity-0"
              }`}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.02)_100%)]" />
              <div className="relative p-3">



                {/* Seaarch */}
                {/* Search for mobile */}
                <div className="mt-3 rounded-3xl border border-white/10 bg-[var(--surface-soft)]/60 p-3">
                  <div className="flex items-center rounded-2xl border border-[var(--ghost-border)] bg-[var(--nav-bg)]/70 px-3 py-3">
                    <Icon
                      icon="bitcoin-icons:search-outline"
                      width="20"
                      height="20"
                      className="mr-2 text-[var(--text-muted)]"
                    />
                    <input
                      type="text"
                      placeholder="Search rituals..."
                      className="w-full bg-transparent text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none"
                    />
                  </div>
                </div>

                {/* Nav links */}
                <div className="mt-3 space-y-2 rounded-3xl border border-white/10 bg-[var(--surface-soft)]/60 p-3">
                  {navLinks.map((link) => {
                    const active = isActiveLink(link.href);
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-500 ${
                          active
                            ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                            : "text-[var(--text-main)] hover:bg-white/5 hover:text-[var(--brand-primary)]"
                        }`}
                      >
                        <span>{link.label}</span>
                        <Icon icon="solar:alt-arrow-right-linear" width="18" height="18" />
                      </a>
                    );
                  })}
                </div>

                {/* Theme switch */}
                <div className="mt-3 rounded-3xl border border-white/10 bg-[var(--surface-soft)]/60 p-3">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--text-main)] transition-all duration-500 hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 p-2 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                        {mounted ? (
  resolvedTheme === "light" ? (
    <Icon icon="uil:moon" width="20" height="20" />
  ) : (
    <Icon icon="solar:sun-linear" width="20" height="20" />
  )
) : (
  <Icon icon="solar:sun-linear" width="20" height="20" />
)}
                      </div>
                      <div className="text-left">
                        <p className="font-bold">Appearance</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Switch between light and dark mode
                        </p>
                      </div>
                    </div>
                    <div className="rounded-full border border-[var(--ghost-border)] px-3 py-1 text-xs font-bold text-[var(--brand-primary)]">
                      {mounted ? (resolvedTheme === "light" ? "Light" : "Dark") : "Theme"}
                    </div>
                  </button>
                </div>
{/* Top panel */}
                <div className="rounded-3xl border items-center border-white/10 bg-[var(--surface-soft)]/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] mt-3">
                  {!loggedIn ? (
                    <a
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between align-middle rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-bold text-white dark:text-[#34058d] transition-all duration-500 hover:scale-[1.01] hover:bg-[var(--brand-primary-soft)]"
                    >
                      <span>Login to your account</span>
                      <Icon icon="solar:login-2-linear" width="20" height="20" />
                    </a>
                  ) : (
                    <div className="space-y-3">
                    <a
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-2xl bg-[var(--brand-primary)]/10 px-4 py-3 text-[var(--brand-primary)] transition-all duration-500 hover:bg-[var(--brand-primary)]/15"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-primary)] text-white">
                          <Icon icon="solar:user-outline" width="20" height="20" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">My Account</p>
                          <p className="text-xs opacity-70">{username}</p>
                        </div>
                      </div>
                      <Icon icon="solar:alt-arrow-right-linear" width="18" height="18" />
                    </a>

                    <button
  type="button"
  onClick={() => setLogoutModalOpen(true)}
  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[0.95rem] font-semibold text-red-600 transition-all duration-500 hover:-translate-y-0.5 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
>
      <Icon icon="solar:logout-2-outline" width="18" height="18" />
      <span>Log out</span>
    </button>
    </div>
                  )}
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </nav>

    {logoutModalOpen && (
  <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
    <button
      type="button"
      aria-label="Close logout confirmation"
      className="absolute inset-0 bg-[#14072f]/55 backdrop-blur-[6px]"
      onClick={() => !isLoggingOut && setLogoutModalOpen(false)}
    />

    <div className="relative z-[121] w-full max-w-md overflow-hidden rounded-[2rem] border border-[var(--ghost-border)] bg-[var(--surface-card)] shadow-[0_30px_90px_rgba(24,7,55,0.24)]">
      <div className="p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.4rem] bg-red-50 text-red-600 shadow-[0_10px_30px_rgba(220,38,38,0.12)] dark:bg-red-500/10 dark:text-red-300">
            <Icon icon="solar:logout-2-outline" width="24" height="24" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-[1.15rem] font-extrabold tracking-[-0.02em] text-[var(--text-primary)]">
              Confirm logout
            </h3>
            <p className="mt-2 text-[0.96rem] leading-7 text-[var(--text-muted)]">
              Are you sure you want to log out of your curator account on this device?
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setLogoutModalOpen(false)}
            disabled={isLoggingOut}
            className="inline-flex items-center justify-center rounded-2xl bg-red-500 px-4 py-3 text-[0.95rem] font-semibold text-white transition-all duration-500 hover:-translate-y-0.5 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center justify-center rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-[0.95rem] font-semibold text-white shadow-[0_16px_34px_rgba(52,5,141,0.18)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(52,5,141,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Accept"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
   </>
    
  );

  
}