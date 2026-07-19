import { Suspense } from "react";
import { InvitationForm } from "@/components/auth/AuthExtraForms";

export const metadata = { title: "Invitation" };

export default function InvitationPage() {
  return (
    <Suspense fallback={<div className="auth-card">Loading...</div>}>
      <InvitationForm />
    </Suspense>
  );
}
