import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { AUTH } from "@/lib/auth-routes";
import { SecuritySettingsPanel } from "@/components/dashboard/SettingsForms";
import { getTeamContext } from "@/lib/team-data";

export const metadata = { title: "Security · Settings" };

export default async function SettingsSecurityPage() {
  const user = await getUser();
  if (!user) redirect(AUTH.signIn);

  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  const mfaEnabled = Boolean(data?.totp?.some((f) => f.status === "verified"));
  const team = await getTeamContext();
  const canClearPlatform =
    team?.membership.role === "platform_admin" ||
    team?.membership.role === "owner";

  return (
    <SecuritySettingsPanel
      hasPassword={Boolean(
        user.identities?.some((identity) => identity.provider === "email"),
      )}
      mfaEnabled={mfaEnabled}
      canClearPlatform={Boolean(canClearPlatform)}
    />
  );
}
