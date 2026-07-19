import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { AUTH } from "@/lib/auth-routes";
import { TwoFactorSettingsForm } from "@/components/dashboard/SettingsForms";

export const metadata = { title: "Two-factor · Settings" };

export default async function SettingsTwoFactorPage() {
  const user = await getUser();
  if (!user) redirect(AUTH.signIn);

  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  const enabled = Boolean(data?.totp?.some((f) => f.status === "verified"));

  return <TwoFactorSettingsForm enabled={enabled} />;
}
