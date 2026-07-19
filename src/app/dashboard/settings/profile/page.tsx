import { redirect } from "next/navigation";
import { getProfile, getUser } from "@/lib/auth";
import { AUTH } from "@/lib/auth-routes";
import { ProfileSettingsForm } from "@/components/dashboard/SettingsForms";
import { getSettings, updateSettings } from "@/lib/db";
import { getTeamContext } from "@/lib/team-data";

export const metadata = { title: "Profile · Settings" };

export default async function SettingsProfilePage() {
  const user = await getUser();
  if (!user) redirect(AUTH.signIn);
  const profile = await getProfile();
  if (!profile) redirect(AUTH.signIn);
  const team = await getTeamContext();

  // Keep public brand mark in sync if org already has a logo.
  const settings = getSettings();
  if (team?.org?.logo_url && !settings.brandLogo) {
    updateSettings({ brandLogo: team.org.logo_url });
  }

  return (
    <ProfileSettingsForm
      profile={profile}
      organization={team?.org ?? null}
    />
  );
}
