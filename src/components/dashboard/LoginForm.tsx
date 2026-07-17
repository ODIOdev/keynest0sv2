"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: form.get("password") }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Invalid password");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4 rounded-3xl bg-white p-8 shadow-sm">
      <div>
        <p className="text-sm uppercase tracking-wide text-[#758696]">Realfy CRM</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#0c0407]">
          Sign in to dashboard
        </h1>
      </div>
      <label className="field">
        <span>Admin password</span>
        <input name="password" type="password" required placeholder="••••••••" />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Signing in..." : "Enter dashboard"}
      </button>
      <p className="text-xs text-[#758696]">
        Default local password: <code>admin123</code>
      </p>
    </form>
  );
}
