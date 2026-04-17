"use client";

import Link from "next/link";
import NextImage from "next/image";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { AccountProfile } from "@/lib/account/shared";

const navigationLinks = [
  { href: "/account", label: "Profile", icon: "solar:user-linear" },
  { href: "/account/orders", label: "Orders", icon: "solar:bag-4-linear" },
  { href: "/account/settings", label: "Settings", icon: "solar:settings-linear" },
  { href: "/account/security", label: "Security", icon: "solar:shield-keyhole-linear" },
  { href: "/terms", label: "Terms", icon: "solar:document-text-linear" },
  { href: "/privacy", label: "Privacy", icon: "solar:lock-keyhole-linear" },
];

type SidebarProps = {
  profile: AccountProfile;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/account") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function normalizeImageUrl(value: string) {
  const normalized = value.trim();

  if (!normalized || normalized === "null" || normalized === "undefined") {
    return "";
  }

  return normalized;
}

function ProfileAvatar({ profile }: { profile: AccountProfile }) {
  const imageUrl = normalizeImageUrl(profile.imageUrl);
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(() => new Set());
  const showImage = Boolean(imageUrl) && !failedImageUrls.has(imageUrl);

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1.35rem] border border-white/50 bg-[linear-gradient(135deg,#1f3244_0%,#2a4d69_100%)] text-lg font-black uppercase text-white dark:border-white/10">
      {showImage ? (
        <NextImage
          src={imageUrl}
          alt={`${profile.displayName} profile photo`}
          fill
          sizes="56px"
          unoptimized
          className="object-cover"
          onError={() => {
            setFailedImageUrls((current) => {
              if (current.has(imageUrl)) {
                return current;
              }

              const next = new Set(current);
              next.add(imageUrl);
              return next;
            });
          }}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-[#f2e9ff] text-[#34058d] dark:bg-[#24173e] dark:text-[#fcdf46]">
          <Icon icon="solar:user-linear" width="28" height="28" />
        </span>
      )}
    </div>
  );
}

function ProfileBadge({ profile, collapsed }: { profile: AccountProfile; collapsed: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(247,243,255,0.95)_100%)] p-4 shadow-[0_20px_55px_rgba(52,5,141,0.08)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(28,20,45,0.98)_0%,rgba(17,12,29,0.98)_100%)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.28)] ${
        collapsed ? "px-3 py-4" : "px-5 py-5"
      }`}
    >
      <Icon
        icon="solar:leaf-line-duotone"
        width="24"
        height="24"
        className="absolute right-3 top-3 text-[#c4b0ff] dark:text-[#583f8f]"
      />
      <Icon
        icon="solar:stars-line-duotone"
        width="22"
        height="22"
        className="absolute bottom-3 left-3 text-[#fcdf46]/70 dark:text-[#fcdf46]/45"
      />

      <div className={`relative ${collapsed ? "flex justify-center" : "flex items-center gap-3"}`}>
        <ProfileAvatar profile={profile} />

        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#241f31] dark:text-[#f4eeff]">{profile.displayName}</p>
            <p className="mt-1 truncate text-[0.68rem] uppercase tracking-[0.18em] text-[#8d87a1] dark:text-[#a89dc4]">
              @{profile.username}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function AccountSidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("zoya-account-sidebar-collapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("zoya-account-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const railWidth = collapsed ? "lg:w-[6.25rem]" : "lg:w-[18.5rem]";

  const renderLinks = (compact: boolean) => (
    <nav className="space-y-2">
      {navigationLinks.map((link) => {
        const active = isActivePath(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group flex items-center gap-3 rounded-[1.1rem] px-3 py-3 text-sm font-semibold transition-all duration-200 ${
              compact ? "justify-center" : ""
            } ${
              active
                ? "bg-[linear-gradient(135deg,#34058d_0%,#4b2ba3_100%)] text-white shadow-[0_18px_40px_rgba(52,5,141,0.26)]"
                : "text-[#5d586d] hover:bg-white hover:text-[#34058d] hover:shadow-[0_12px_24px_rgba(52,5,141,0.08)] dark:text-[#c9c0de] dark:hover:bg-[#1d1630] dark:hover:text-[#f4eeff] dark:hover:shadow-none"
            }`}
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] transition-colors ${
                active
                  ? "bg-white/14 text-white"
                  : "bg-[#f2eef9] text-[#34058d] group-hover:bg-[#efe8ff] dark:bg-[#1d1630] dark:text-[#cdb7ff] dark:group-hover:bg-[#2b1f45]"
              }`}
            >
              <Icon icon={link.icon} width="20" height="20" />
            </span>

            {!compact ? <span className="truncate">{link.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="fixed left-4 top-[5.8rem] z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 text-sm font-semibold text-[#34058d] shadow-[0_16px_30px_rgba(52,5,141,0.12)] backdrop-blur dark:border-white/10 dark:bg-[#120d21]/95 dark:text-[#f4eeff] dark:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
        >
          <Icon icon="solar:hamburger-menu-linear" width="18" height="18" />
          <span>Account Menu</span>
        </button>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-[#130924]/52 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button type="button" aria-label="Close account menu" className="absolute inset-0" onClick={() => setMobileOpen(false)} />
        <aside
          className={`relative h-full w-[18.5rem] max-w-[86vw] border-r border-white/10 bg-[#f9f7fd] p-4 shadow-[0_26px_70px_rgba(15,10,29,0.25)] transition-transform duration-300 dark:bg-[#0f0a1d] ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8d87a1] dark:text-[#a89dc4]">
              My Account
            </p>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#34058d] shadow-sm dark:bg-[#1d1630] dark:text-[#f4eeff]"
            >
              <Icon icon="solar:close-circle-linear" width="20" height="20" />
            </button>
          </div>

          <ProfileBadge profile={profile} collapsed={false} />

          <div className="mt-5 rounded-[1.75rem] border border-white/70 bg-[#f4f0fb] p-3 dark:border-white/10 dark:bg-[#140f24]">
            {renderLinks(false)}
          </div>
        </aside>
      </div>

      <aside className={`sticky top-[5.25rem] hidden h-[calc(100vh-6rem)] ${railWidth} lg:block`}>
        <div className="h-full px-4 py-6">
          <div className="relative flex h-full flex-col rounded-[2rem] border border-[#ece5f7] bg-[linear-gradient(180deg,#f8f6fc_0%,#f1eef8_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_30px_60px_rgba(52,5,141,0.08)] dark:border-[#2a1e42] dark:bg-[linear-gradient(180deg,#151024_0%,#0d0918_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_28px_70px_rgba(0,0,0,0.34)]">
            <Icon
              icon="solar:leaf-line-duotone"
              width="28"
              height="28"
              className="absolute right-4 top-4 text-[#d3c3ff] dark:text-[#4b377a]"
            />
            <Icon
              icon="solar:stars-line-duotone"
              width="28"
              height="28"
              className="absolute bottom-4 left-4 text-[#fcdf46]/65 dark:text-[#fcdf46]/40"
            />

            <div className={`relative z-10 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
              {!collapsed ? (
                <div>
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-[#8d87a1] dark:text-[#a89dc4]">
                    Account Dashboard
                  </p>
                  <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#241f31] dark:text-[#f4eeff]">
                    My Account
                  </h2>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setCollapsed((current) => !current)}
                className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white text-[#34058d] shadow-[0_10px_24px_rgba(52,5,141,0.08)] transition-all duration-200 hover:-translate-y-0.5 dark:bg-[#1d1630] dark:text-[#f4eeff] dark:shadow-none"
                aria-label={collapsed ? "Expand account sidebar" : "Collapse account sidebar"}
              >
                <Icon
                  icon={collapsed ? "solar:square-alt-arrow-right-linear" : "solar:square-alt-arrow-left-linear"}
                  width="20"
                  height="20"
                />
              </button>
            </div>

            <div className="relative z-10 mt-6">
              <ProfileBadge profile={profile} collapsed={collapsed} />
            </div>

            <div className="relative z-10 mt-5 flex-1 rounded-[1.75rem] border border-white/70 bg-white/75 p-3 backdrop-blur dark:border-white/10 dark:bg-[#120d21]/85">
              {renderLinks(collapsed)}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
