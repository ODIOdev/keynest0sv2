import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/dashboard/LoginForm";
import { isAuthenticated } from "@/lib/auth";

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center bg-[#f4f4f5] px-4">
      <div className="w-full">
        <LoginForm />
        <p className="mt-4 text-center text-sm text-[#758696]">
          <Link href="/" className="underline">
            Back to website
          </Link>
        </p>
      </div>
    </main>
  );
}
