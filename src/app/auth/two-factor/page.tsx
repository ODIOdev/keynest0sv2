import { Suspense } from "react";
import { TwoFactorForm } from "@/components/auth/AuthExtraForms";

export const metadata = { title: "Two-factor authentication" };

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<div className="auth-card">Loading...</div>}>
      <TwoFactorForm />
    </Suspense>
  );
}
