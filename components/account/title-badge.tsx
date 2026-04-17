"use client";

import { Icon } from "@iconify/react";

type AccountTitleBadgeProps = {
  icon: string;
  label: string;
};

export default function AccountTitleBadge({ icon, label }: AccountTitleBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#ede6ff] px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.22em] text-[#34058d] dark:bg-[#24173e] dark:text-[#d7c4ff]">
      <Icon icon={icon} width="16" height="16" />
      <span>{label}</span>
    </span>
  );
}
