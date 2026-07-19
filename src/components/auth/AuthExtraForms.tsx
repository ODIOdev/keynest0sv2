"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AUTH } from "@/lib/auth-routes";
import { KeynestLogo } from "@/components/site/KeynestLogo";

export function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function resend() {
    if (!email) {
      setError("Add your email on the sign-up page to resend.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${origin}${AUTH.callback}?next=/onboarding`,
      },
    });
    if (resendError) {
      setError(resendError.message);
      setStatus("error");
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="auth-card space-y-4">
      <KeynestLogo size="sm" className="mb-1 inline-flex" />
      <h1 className="text-3xl font-semibold tracking-tight text-[#0c0407]">
        Verify your email
      </h1>
      <p className="text-[#758696]">
        {email ? (
          <>
            We sent a verification link to <strong>{email}</strong>. Open it to
            activate your account, then finish onboarding.
          </>
        ) : (
          <>
            Check your inbox for a verification link. Once confirmed, you can
            sign in and finish onboarding.
          </>
        )}
      </p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {status === "sent" ? (
        <p className="text-sm text-green-700">Verification email resent.</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-secondary"
          disabled={status === "sending" || !email}
          onClick={resend}
        >
          {status === "sending" ? "Sending…" : "Resend email"}
        </button>
        <Link href={AUTH.signIn} className="btn-primary inline-flex">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export function InvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<{ email?: string; role?: string } | null>(
    null,
  );

  async function lookup() {
    if (!token) {
      setError("This invitation link is missing a token.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: lookupError } = await supabase
      .from("kn_invitations")
      .select("email, role, accepted_at, expires_at")
      .eq("token", token)
      .maybeSingle();
    setLoading(false);

    if (lookupError || !data) {
      setError("We couldn’t find this invitation. Ask your admin for a new link.");
      return;
    }
    if (data.accepted_at) {
      setError("This invitation has already been accepted.");
      return;
    }
    if (new Date(data.expires_at).getTime() < Date.now()) {
      setError("This invitation has expired. Ask your admin for a new link.");
      return;
    }
    setInfo({ email: data.email, role: data.role });
  }

  async function accept(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const fullName = String(form.get("full_name") || "").trim();
    const email = info?.email || String(form.get("email") || "").trim();

    const supabase = createClient();
    const origin = window.location.origin;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}${AUTH.callback}?next=/onboarding`,
        data: {
          full_name: fullName,
          account_type: "employee",
          invite_token: token,
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
  }

  if (!info) {
    return (
      <div className="auth-card space-y-4">
        <KeynestLogo size="sm" className="mb-1 inline-flex" />
        <h1 className="text-3xl font-semibold tracking-tight text-[#0c0407]">
          Team invitation
        </h1>
        <p className="text-[#758696]">
          {token
            ? "Open your invite to join the organization."
            : "Paste or open a valid invitation link from your admin."}
        </p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="button"
          className="btn-primary w-full"
          disabled={loading || !token}
          onClick={lookup}
        >
          {loading ? "Checking…" : "Continue"}
        </button>
        <p className="text-center text-sm text-[#758696]">
          Already have an account?{" "}
          <Link href={AUTH.signIn} className="underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={accept} className="auth-card space-y-4">
      <KeynestLogo size="sm" className="mb-1 inline-flex" />
      <h1 className="text-3xl font-semibold tracking-tight text-[#0c0407]">
        Join your team
      </h1>
      <p className="text-sm text-[#758696]">
        Invited as <strong>{info.role}</strong> · {info.email}
      </p>
      <label className="field">
        <span>Full name</span>
        <input name="full_name" required placeholder="Jordan Lee" />
      </label>
      <input type="hidden" name="email" value={info.email} />
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" required minLength={8} />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Creating account…" : "Accept invitation"}
      </button>
    </form>
  );
}

export function TwoFactorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(
    () => searchParams.get("next") || "/dashboard",
    [searchParams],
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const code = String(form.get("code") || "").trim();
    const supabase = createClient();

    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totp = factors?.totp?.[0];
    if (!totp) {
      setLoading(false);
      setError("No authenticator is enrolled on this account yet.");
      return;
    }

    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: totp.id });
    if (challengeError) {
      setLoading(false);
      setError(challengeError.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: totp.id,
      challengeId: challenge.id,
      code,
    });

    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="auth-card space-y-4">
      <KeynestLogo size="sm" className="mb-1 inline-flex" />
      <h1 className="text-3xl font-semibold tracking-tight text-[#0c0407]">
        Two-factor authentication
      </h1>
      <p className="text-sm text-[#758696]">
        Enter the 6-digit code from your authenticator app.
      </p>
      <label className="field">
        <span>Authentication code</span>
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          placeholder="123456"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Verifying…" : "Verify"}
      </button>
      <p className="text-center text-sm text-[#758696]">
        <Link href={AUTH.signIn} className="underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function AuthErrorPanel() {
  const searchParams = useSearchParams();
  const code = searchParams.get("error") || searchParams.get("code") || "unknown";
  const description =
    searchParams.get("error_description") ||
    searchParams.get("message") ||
    "Something went wrong during authentication.";

  return (
    <div className="auth-card space-y-4">
      <KeynestLogo size="sm" className="mb-1 inline-flex" />
      <h1 className="text-3xl font-semibold tracking-tight text-[#0c0407]">
        Authentication error
      </h1>
      <p className="text-[#758696]">{description}</p>
      <p className="text-xs uppercase tracking-wide text-[#758696]">
        Error code: {code}
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href={AUTH.signIn} className="btn-primary inline-flex">
          Try signing in again
        </Link>
        <Link href={AUTH.signUp} className="btn-secondary inline-flex">
          Create an account
        </Link>
      </div>
    </div>
  );
}
