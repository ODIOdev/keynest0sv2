"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AccountType } from "@/lib/auth-types";
import { AUTH } from "@/lib/auth-routes";
import { resolveSignInEmail } from "@/lib/master-admin";
import { AppleLogo, GoogleLogo } from "@/components/auth/OAuthLogos";
import { KeynestLogo } from "@/components/site/KeynestLogo";

const accountTypes: { value: AccountType; label: string; hint: string }[] = [
  {
    value: "business",
    label: "Business owner",
    hint: "Create an organization and invite your team",
  },
  {
    value: "employee",
    label: "Team member",
    hint: "Join with an invitation from your employer",
  },
  {
    value: "customer",
    label: "Customer / client",
    hint: "Access listings and your client portal",
  },
];

export function SignUpForm() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("business");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const fullName = String(form.get("full_name") || "").trim();
    const accepted = form.get("terms") === "on";

    if (!accepted) {
      setLoading(false);
      setError("Please accept the terms to continue.");
      return;
    }

    const supabase = createClient();
    const origin = window.location.origin;
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}${AUTH.callback}?next=/onboarding`,
        data: {
          full_name: fullName,
          account_type: accountType,
        },
      },
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    router.push(
      `${AUTH.verifyEmail}?email=${encodeURIComponent(email)}`,
    );
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="auth-card space-y-4">
      <div>
        <KeynestLogo size="sm" className="mb-1 inline-flex" />
        <h1 className="text-3xl font-semibold tracking-tight text-[#0c0407]">
          Create account
        </h1>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-[#0c0407]">Account type</legend>
        <div className="grid gap-2">
          {accountTypes.map((type) => (
            <label
              key={type.value}
              className={`flex cursor-pointer gap-3 rounded-2xl border px-3 py-3 ${
                accountType === type.value
                  ? "border-[#0c0407] bg-[#f7f7f7]"
                  : "border-[#e8e8e8]"
              }`}
            >
              <input
                type="radio"
                name="account_type"
                value={type.value}
                checked={accountType === type.value}
                onChange={() => setAccountType(type.value)}
                className="mt-1"
              />
              <span>
                <span className="block font-medium text-[#0c0407]">{type.label}</span>
                <span className="block text-sm text-[#758696]">{type.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span>Full name</span>
        <input name="full_name" required placeholder="Jordan Lee" />
      </label>
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" required placeholder="you@company.com" />
      </label>
      <label className="field">
        <span>Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
      </label>
      <label className="flex items-start gap-2 text-sm text-[#333]">
        <input name="terms" type="checkbox" className="mt-1" />
        <span>I accept the terms of service and privacy policy.</span>
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-[#758696]">
        Already have an account?{" "}
        <Link href={AUTH.signIn} className="underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get("next") || "/dashboard", [searchParams]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const identifier = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const email = resolveSignInEmail(identifier);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    // Persist longer session preference via local storage flag for UX;
    // Supabase SSR cookies are managed by the client.
    if (remember) {
      localStorage.setItem("keynest_remember", "1");
    } else {
      localStorage.removeItem("keynest_remember");
    }

    router.push(next);
    router.refresh();
  }

  async function oauth(provider: "google" | "apple") {
    setError("");
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}${AUTH.callback}?next=${encodeURIComponent(next)}`,
      },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <form onSubmit={onSubmit} className="auth-card space-y-4">
      <div>
        <KeynestLogo size="sm" className="mb-1 inline-flex" />
        <h1 className="text-3xl font-semibold tracking-tight text-[#0c0407]">
          Sign in
        </h1>
      </div>

      <label className="field">
        <span>Email or username</span>
        <input
          name="email"
          required
          autoComplete="username"
          placeholder="admin or you@company.com"
        />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" required placeholder="••••••••" />
      </label>

      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="flex items-center gap-2 text-[#333]">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember this device
        </label>
        <Link href={AUTH.forgotPassword} className="text-[#758696] underline">
          Forgot password?
        </Link>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <div className="auth-oauth" aria-label="Sign in with a provider">
        <div className="auth-oauth__divider">
          <span>or continue with</span>
        </div>
        <div className="auth-oauth__stack">
          <button
            type="button"
            onClick={() => oauth("google")}
            className="auth-oauth__btn auth-oauth__btn--google"
          >
            <GoogleLogo />
            <span>Continue with Google</span>
          </button>
          <button
            type="button"
            onClick={() => oauth("apple")}
            className="auth-oauth__btn auth-oauth__btn--apple"
          >
            <AppleLogo />
            <span>Continue with Apple</span>
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-[#758696]">
        New here?{" "}
        <Link href={AUTH.signUp} className="underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}${AUTH.callback}?next=${AUTH.resetPassword}`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="auth-card space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0c0407]">
          Reset email sent
        </h1>
        <p className="text-[#758696]">
          Check your inbox for a link to create a new password.
        </p>
        <Link href={AUTH.signIn} className="btn-primary inline-flex">
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="auth-card space-y-4">
      <div>
        <KeynestLogo size="sm" className="mb-1 inline-flex" />
        <h1 className="text-3xl font-semibold tracking-tight text-[#0c0407]">
          Forgot password
        </h1>
        <p className="mt-2 text-sm text-[#758696]">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" required placeholder="you@company.com" />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Sending..." : "Send reset email"}
      </button>
      <p className="text-center text-sm text-[#758696]">
        <Link href={AUTH.signIn} className="underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    if (password !== confirm) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push(AUTH.signIn);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="auth-card space-y-4">
      <div>
        <KeynestLogo size="sm" className="mb-1 inline-flex" />
        <h1 className="text-3xl font-semibold tracking-tight text-[#0c0407]">
          Create new password
        </h1>
      </div>
      <label className="field">
        <span>New password</span>
        <input name="password" type="password" required minLength={8} />
      </label>
      <label className="field">
        <span>Confirm password</span>
        <input name="confirm" type="password" required minLength={8} />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Saving..." : "Save password"}
      </button>
    </form>
  );
}
