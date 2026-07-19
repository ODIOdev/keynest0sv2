import { Suspense } from "react";
import { AuthErrorPanel } from "@/components/auth/AuthExtraForms";

export const metadata = { title: "Authentication error" };

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="auth-card">Loading...</div>}>
      <AuthErrorPanel />
    </Suspense>
  );
}
