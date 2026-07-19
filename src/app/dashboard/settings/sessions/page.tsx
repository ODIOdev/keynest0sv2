import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { AUTH } from "@/lib/auth-routes";
import { SessionsSettingsPanel } from "@/components/dashboard/SettingsForms";

export const metadata = { title: "Sessions · Settings" };

export default async function SettingsSessionsPage() {
  const user = await getUser();
  if (!user) redirect(AUTH.signIn);

  return (
    <SessionsSettingsPanel
      email={user.email || ""}
      lastSignIn={user.last_sign_in_at || null}
    />
  );
}
