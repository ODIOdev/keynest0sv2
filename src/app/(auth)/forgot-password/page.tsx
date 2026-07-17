import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";

export default function ForgotPasswordPage() {
  return (
    <main className="auth-shell">
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm text-[#758696]">
        <Link href="/sign-in" className="underline">
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
