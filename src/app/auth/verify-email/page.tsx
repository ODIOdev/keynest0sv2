import { Suspense } from "react";
import { VerifyEmailPanel } from "@/components/auth/AuthExtraForms";

export const metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="auth-card">Loading...</div>}>
      <VerifyEmailPanel />
    </Suspense>
  );
}
