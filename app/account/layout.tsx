import AccountShell from "@/components/account/account-shell";
import { requireAccountProfile } from "@/lib/account/profile";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAccountProfile();

  return (
    <AccountShell profile={profile}>{children}</AccountShell>
  );
}
