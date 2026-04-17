"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import CustomSelect from "@/components/account/custom-select";
import AccountTitleBadge from "@/components/account/title-badge";
import type { AccountProfile } from "@/lib/account/shared";

type SettingsPanelProps = {
  profile: AccountProfile;
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-14 rounded-full border transition-colors duration-200 ${
        checked
          ? "border-[#34058d] bg-[#34058d]"
          : "border-[#d9d2e7] bg-[#ebe7f2] dark:border-[#3b2c57] dark:bg-[#221936]"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.14)] transition-all duration-200 ${
          checked ? "left-[1.85rem] bg-white" : "left-1 bg-[#34058d] dark:bg-[#d7c4ff]"
        }`}
      />
    </button>
  );
}

export default function SettingsPanel({ profile }: SettingsPanelProps) {
  const [botanicalUpdates, setBotanicalUpdates] = useState(true);
  const [orderTracking, setOrderTracking] = useState(false);
  const [personalizedRituals, setPersonalizedRituals] = useState(true);
  const [language, setLanguage] = useState("en-gb");
  const [currency, setCurrency] = useState("usd");

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <section className="space-y-10">
        <header>
          <AccountTitleBadge icon="solar:settings-linear" label="Account Settings" />
          <h1 className="mt-5 font-headline text-[3rem] font-extrabold tracking-[-0.05em] text-[#34058d] dark:text-[#f4eeff] md:text-[3.35rem]">
            Account Settings
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-8 text-[#6f6a7d] dark:text-[#b6abcf]">
            Refine your botanical experience. Manage the communication controls and regional preferences attached to
            your account dashboard.
          </p>
        </header>

        <section className="space-y-5">
          <div className="flex items-center gap-4">
            <Icon icon="solar:bell-linear" width="28" height="28" className="text-[#34058d] dark:text-[#d7c4ff]" />
            <h2 className="font-headline text-[1.85rem] font-bold tracking-[-0.03em] text-[#1f1b2d] dark:text-[#f4eeff]">
              Communication Preferences
            </h2>
          </div>

          <div className="rounded-[1.75rem] border border-white/70 bg-[#f0eef5] p-6 dark:border-white/10 dark:bg-[#120d21] md:p-8">
            {[
              {
                title: "Botanical Updates",
                description: "New product launches and seasonal wellness guides.",
                checked: botanicalUpdates,
                onChange: setBotanicalUpdates,
              },
              {
                title: "Order Tracking",
                description: "Real-time SMS updates for your shipping status.",
                checked: orderTracking,
                onChange: setOrderTracking,
              },
              {
                title: "Personalized Rituals",
                description: "AI-curated botanical recommendations based on your usage.",
                checked: personalizedRituals,
                onChange: setPersonalizedRituals,
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className={`flex items-center justify-between gap-4 py-4 ${index === 0 ? "" : "border-t border-white/75 dark:border-[#241b3a]"}`}
              >
                <div>
                  <p className="font-bold text-[#1f1b2d] dark:text-[#f4eeff]">{item.title}</p>
                  <p className="mt-1 text-sm text-[#6f6a7d] dark:text-[#b6abcf]">{item.description}</p>
                </div>
                <Toggle checked={item.checked} onChange={item.onChange} />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-4">
            <Icon icon="solar:widget-6-linear" width="28" height="28" className="text-[#34058d] dark:text-[#d7c4ff]" />
            <h2 className="font-headline text-[1.85rem] font-bold tracking-[-0.03em] text-[#1f1b2d] dark:text-[#f4eeff]">
              Connected Ecosystems
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-4 rounded-[1.5rem] border border-[#ebe7f2] bg-white p-5 dark:border-white/10 dark:bg-[#120d21]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3f1f8] text-[#5e5a6d] dark:bg-[#1d1630] dark:text-[#d7c4ff]">
                <Icon icon="solar:heart-pulse-linear" width="22" height="22" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1f1b2d] dark:text-[#f4eeff]">Apple Health</p>
                <p className="text-xs text-[#7b758d] dark:text-[#9d90bb]">Sync supplement data</p>
              </div>
              <span className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[#34058d] dark:text-[#d7c4ff]">Connect</span>
            </div>

            <div className="flex items-center gap-4 rounded-[1.5rem] border border-[#ebe7f2] bg-white p-5 dark:border-white/10 dark:bg-[#120d21]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#efe8ff] text-[#34058d] dark:bg-[#24173e] dark:text-[#d7c4ff]">
                <Icon icon="solar:fire-linear" width="22" height="22" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1f1b2d] dark:text-[#f4eeff]">Strava</p>
                <p className="text-xs text-[#7b758d] dark:text-[#9d90bb]">Last synced: 2h ago</p>
              </div>
              <span className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[#c53e3e]">Disconnect</span>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-4">
            <Icon icon="solar:global-linear" width="28" height="28" className="text-[#34058d] dark:text-[#d7c4ff]" />
            <h2 className="font-headline text-[1.85rem] font-bold tracking-[-0.03em] text-[#1f1b2d] dark:text-[#f4eeff]">
              Regional & Language
            </h2>
          </div>

          <div className="grid gap-6 rounded-[1.75rem] border border-white/70 bg-[#f0eef5] p-6 dark:border-white/10 dark:bg-[#120d21] md:grid-cols-2 md:p-8">
            <label className="flex flex-col gap-2">
              <span className="ml-1 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#938da7] dark:text-[#a89dc4]">
                Primary Language
              </span>
              <CustomSelect
                value={language}
                onChange={setLanguage}
                options={[
                  { value: "en-gb", label: "English (United Kingdom)" },
                  { value: "en-us", label: "English (United States)" },
                ]}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="ml-1 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#938da7] dark:text-[#a89dc4]">
                Currency Display
              </span>
              <CustomSelect
                value={currency}
                onChange={setCurrency}
                options={[
                  { value: "usd", label: "USD ($)" },
                  { value: "gbp", label: "GBP (£)" },
                  { value: "eur", label: "EUR (€)" },
                ]}
              />
            </label>
          </div>
        </section>
      </section>

      <aside className="space-y-5">
        <div className="overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#34058d_0%,#4b2ba3_100%)] p-6 text-white shadow-[0_24px_60px_rgba(52,5,141,0.2)]">
          <span className="inline-flex rounded-full bg-[#fcdf46] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.24em] text-[#5e4a00]">
            Account profile
          </span>
          <h3 className="mt-5 font-headline text-[1.7rem] font-extrabold tracking-[-0.04em]">{profile.displayName}</h3>
          <p className="mt-1 text-sm text-white/70">{profile.email}</p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-[0.66rem] font-bold uppercase tracking-[0.18em] text-white/70">
              <span>Verification</span>
              <span>{profile.verified ? "Verified" : "Pending"}</span>
            </div>
            <div className="h-2 rounded-full bg-white/15">
              <div className="h-full w-[88%] rounded-full bg-[#fcdf46]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[1.5rem] border border-white/70 bg-white p-5 shadow-[0_12px_35px_rgba(52,5,141,0.06)] dark:border-white/10 dark:bg-[#120d21] dark:shadow-[0_18px_36px_rgba(0,0,0,0.24)]">
            <Icon icon="solar:lock-keyhole-linear" width="22" height="22" className="text-[#34058d] dark:text-[#d7c4ff]" />
            <p className="mt-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#938da7] dark:text-[#a89dc4]">Security</p>
            <p className="mt-1 text-lg font-black text-[#1f1b2d] dark:text-[#f4eeff]">Strong</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/70 bg-white p-5 shadow-[0_12px_35px_rgba(52,5,141,0.06)] dark:border-white/10 dark:bg-[#120d21] dark:shadow-[0_18px_36px_rgba(0,0,0,0.24)]">
            <Icon icon="solar:verified-check-linear" width="22" height="22" className="text-[#34058d] dark:text-[#d7c4ff]" />
            <p className="mt-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#938da7] dark:text-[#a89dc4]">Identity</p>
            <p className="mt-1 text-lg font-black text-[#1f1b2d] dark:text-[#f4eeff]">{profile.verified ? "Verified" : "Pending"}</p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#f2e9b5] bg-[#fff8dc] p-5 dark:border-[#5d4a09] dark:bg-[#2c2307]">
          <p className="font-headline text-lg font-bold text-[#7a6300] dark:text-[#ffe38a]">Support Concierge</p>
          <p className="mt-2 text-sm leading-7 text-[#866f0a] dark:text-[#f6dc85]">
            Need help with your account details or security settings? Our support team is available through the contact
            page.
          </p>
          <a
            href="/contact"
            className="mt-4 inline-flex rounded-xl bg-[#fcdf46] px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#5f4a00]"
          >
            Start Support Session
          </a>
        </div>
      </aside>
    </div>
  );
}
