import AccountShell from "@/components/account/account-shell";
import AccountTitleBadge from "@/components/account/title-badge";
import { requireAccountProfile } from "@/lib/account/profile";

export default async function WishlistPage() {
  const profile = await requireAccountProfile();

  return (
    <AccountShell profile={profile}>
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] border border-white/70 bg-white p-8 shadow-[0_20px_60px_rgba(52,5,141,0.08)] dark:border-white/10 dark:bg-[#120d21] dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)] md:p-12">
          <AccountTitleBadge icon="solar:heart-linear" label="Wishlist" />
          <h1 className="mt-4 font-headline text-[2.8rem] font-extrabold tracking-[-0.05em] text-[#34058d] dark:text-[#f4eeff]">
            Saved Rituals
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#6f6a7d] dark:text-[#b6abcf]">
            Your saved products and rituals will live here. The route is ready so the new navbar user menu has a real
            destination right away.
          </p>
        </section>
      </div>
    </AccountShell>
  );
}
