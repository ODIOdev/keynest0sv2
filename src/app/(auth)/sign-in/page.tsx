import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/AuthForms";

export default function SignInPage() {
  return (
    <main className="auth-shell">
      <Suspense fallback={<div className="auth-card">Loading...</div>}>
        <SignInForm />
      </Suspense>
      <p className="mt-4 text-center text-sm text-[#758696]">
        <Link href="/" className="underline">
          Back to website
        </Link>
      </p>
    </main>
  );
}
