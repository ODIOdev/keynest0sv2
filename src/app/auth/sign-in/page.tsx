import { Suspense } from "react";
import { SignInForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="auth-card">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
