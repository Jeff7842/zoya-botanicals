import AccountAvatarUpload from "@/components/account/account-avatar-upload";
import AccountDeleteSection from "@/components/account/delete-account-section";
import AccountLogoutButton from "@/components/account/logout-button";
import AccountProfileForm from "@/components/account/profile-form";
import { requireAccountProfile } from "@/lib/account/profile";

export default async function AccountPage() {
  const profile = await requireAccountProfile();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,#fbf9ff_0%,#f2eef9_100%)] p-6 shadow-[0_28px_70px_rgba(52,5,141,0.08)] dark:border-white/10 dark:bg-[linear-gradient(135deg,#161024_0%,#0e0918_100%)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
            <AccountAvatarUpload
              displayName={profile.displayName}
              username={profile.username}
              imageUrl={profile.imageUrl}
            />

            <div>
              <span className="inline-flex rounded-full bg-[#fcdf46] px-4 py-1.5 text-[0.66rem] font-black uppercase tracking-[0.24em] text-[#5e4a00]">
                Botanical dashboard
              </span>
              <h1 className="mt-5 font-headline text-[2.8rem] font-extrabold tracking-[-0.06em] text-[#34058d] dark:text-[#f4eeff] md:text-[4rem]">
                {profile.displayName}
              </h1>
              <p className="mt-2 text-[0.74rem] font-semibold uppercase tracking-[0.28em] text-[#948ea8] dark:text-[#a89dc4]">
                @{profile.username}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f6a7d] dark:text-[#b6abcf]">
                Manage your personal details, password security, and communication preferences from one dashboard that
                follows your current Zoya theme.
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <AccountLogoutButton />
          </div>
        </div>
      </section>

      <AccountProfileForm profile={profile} />
      <AccountDeleteSection displayName={profile.displayName} />
    </div>
  );
}
