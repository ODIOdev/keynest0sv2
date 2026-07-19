import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-shell">
      {children}
      <p className="mt-4 text-center text-sm text-[#758696]">
        <Link href="/" className="underline">
          Back to website
        </Link>
      </p>
    </main>
  );
}
