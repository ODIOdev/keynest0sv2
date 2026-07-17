import Link from "next/link";
import { SignUpForm } from "@/components/auth/AuthForms";

export default function SignUpPage() {
  return (
    <main className="auth-shell">
      <SignUpForm />
      <p className="mt-4 text-center text-sm text-[#758696]">
        <Link href="/" className="underline">
          Back to website
        </Link>
      </p>
    </main>
  );
}
