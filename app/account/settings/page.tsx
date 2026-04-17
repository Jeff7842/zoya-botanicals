import SettingsPanel from "@/components/account/settings-panel";
import { requireAccountProfile } from "@/lib/account/profile";

export default async function AccountSettingsPage() {
  const profile = await requireAccountProfile();

  return <div className="mx-auto max-w-7xl"><SettingsPanel profile={profile} /></div>;
}
