import AccountTitleBadge from "@/components/account/title-badge";

export default function AccountOrdersPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <section className="rounded-[2rem] border border-white/70 bg-white p-8 shadow-[0_20px_60px_rgba(52,5,141,0.08)] dark:border-white/10 dark:bg-[#120d21] dark:shadow-[0_24px_70px_rgba(0,0,0,0.3)] md:p-12">
        <AccountTitleBadge icon="solar:bag-4-linear" label="Orders" />
        <h1 className="mt-4 font-headline text-[2.8rem] font-extrabold tracking-[-0.05em] text-[#34058d] dark:text-[#f4eeff]">
          Order History
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[#6f6a7d] dark:text-[#b6abcf]">
          This page stays inside the same dashboard shell, so future order data can plug in without changing the
          account navigation experience.
        </p>
      </section>
    </div>
  );
}
