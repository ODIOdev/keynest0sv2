import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getProfile, requireUser } from "@/lib/auth";
import { ONBOARDING } from "@/lib/onboarding";
import { OnboardingProvider } from "@/components/auth/OnboardingProvider";

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser(ONBOARDING.root);
  const profile = await getProfile();
  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-shell">
      <OnboardingProvider
        email={profile?.email || ""}
        fullName={profile?.full_name || ""}
        accountType={profile?.account_type || "business"}
      >
        {children}
      </OnboardingProvider>
      <p className="mt-4 text-center text-sm text-[#758696]">
        <Link href="/" className="underline">
          Back to website
        </Link>
      </p>
    </main>
  );
}
