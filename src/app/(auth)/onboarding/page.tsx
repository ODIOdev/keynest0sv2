import { redirect } from "next/navigation";
import { getProfile, requireUser } from "@/lib/auth";
import { OnboardingForm } from "@/components/auth/OnboardingForm";

export default async function OnboardingPage() {
  await requireUser("/onboarding");
  const profile = await getProfile();
  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-shell">
      <OnboardingForm
        email={profile?.email || ""}
        fullName={profile?.full_name || ""}
        accountType={profile?.account_type || "business"}
      />
    </main>
  );
}
