import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { AUTH } from "@/lib/auth-routes";
import { SecuritySettingsPanel } from "@/components/dashboard/SettingsForms";

export const metadata = { title: "Security · Settings" };

export default async function SettingsSecurityPage() {
  const user = await getUser();
  if (!user) redirect(AUTH.signIn);

  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  const mfaEnabled = Boolean(data?.totp?.some((f) => f.status === "verified"));

  return (
    <SecuritySettingsPanel
      hasPassword={Boolean(
        user.identities?.some((identity) => identity.provider === "email"),
      )}
      mfaEnabled={mfaEnabled}
    />
  );
}
