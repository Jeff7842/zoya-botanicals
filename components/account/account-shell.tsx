import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import AccountSidebar from "@/components/account/sidebar";
import type { AccountProfile } from "@/lib/account/shared";

type AccountShellProps = {
  profile: AccountProfile;
  children: React.ReactNode;
};

export default function AccountShell({ profile, children }: AccountShellProps) {
  return (
    <div className="min-h-screen bg-[#f7f4fb] text-[#1a1c1e] transition-colors duration-300 dark:bg-[#090612] dark:text-[#f4eeff]">
      <Navbar />

      <div className="relative">
        <div className="mx-auto flex w-full max-w-[1800px] gap-0 pt-20">
          <AccountSidebar profile={profile} />

          <main className="min-w-0 flex-1 px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pb-14 lg:pt-8 xl:px-10">
            {children}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
