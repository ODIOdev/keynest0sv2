"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatPhoneInput } from "@/lib/format";
import { SETTINGS } from "@/lib/settings-routes";
import type { Organization, Profile } from "@/lib/auth-types";

function Status({
  ok,
  error,
}: {
  ok?: string;
  error?: string;
}) {
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (ok) return <p className="text-sm text-green-700">{ok}</p>;
  return null;
}

async function syncSiteBrandLogo(url: string | null) {
  await fetch("/api/brand-logo", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brandLogo: url || "" }),
  });
}

async function uploadImage(file: File, alt: string) {
  const data = new FormData();
  data.append("file", file);
  data.append("alt", alt);
  const res = await fetch("/api/upload", { method: "POST", body: data });
  if (!res.ok) throw new Error("Upload failed");
  const asset = (await res.json()) as { url?: string };
  if (!asset.url) throw new Error("Upload failed");
  return asset.url;
}

function ImageUploadField({
  label,
  hint,
  value,
  variant,
  uploading,
  onPick,
  onClear,
}: {
  label: string;
  hint: string;
  value: string | null;
  variant: "avatar" | "logo";
  uploading: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="settings-image-field">
      <div className="settings-image-field__copy">
        <p className="settings-image-field__label">{label}</p>
        <p className="settings-image-field__hint">{hint}</p>
      </div>
      <div className="settings-image-field__row">
        <div
          className={`settings-image-field__preview settings-image-field__preview--${variant}`}
        >
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : variant === "avatar" ? (
            <svg
              className="settings-image-field__icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
              <path
                d="M5 19.5c1.4-3.2 3.8-4.8 7-4.8s5.6 1.6 7 4.8"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              className="settings-image-field__icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M4 19V8.5L12 4l8 4.5V19"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path
                d="M9 19v-5h6v5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <div className="settings-image-field__actions">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPick(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn-secondary"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
          {value ? (
            <button
              type="button"
              className="settings-image-field__clear"
              disabled={uploading}
              onClick={onClear}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ProfileSettingsForm({
  profile,
  organization,
}: {
  profile: Profile;
  organization?: Organization | null;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(() =>
    formatPhoneInput(profile.phone || ""),
  );
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [logoUrl, setLogoUrl] = useState(organization?.logo_url ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");

  async function uploadAvatar(file: File) {
    setAvatarUploading(true);
    setOk("");
    setError("");
    try {
      const url = await uploadImage(file, `${fullName || "Profile"} avatar`);
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("kn_profiles")
        .update({ avatar_url: url })
        .eq("id", profile.id);
      if (updateError) throw new Error(updateError.message);
      setAvatarUrl(url);
      setOk("Profile photo updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload photo.");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function clearAvatar() {
    setAvatarUploading(true);
    setOk("");
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("kn_profiles")
      .update({ avatar_url: null })
      .eq("id", profile.id);
    setAvatarUploading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setAvatarUrl(null);
    setOk("Profile photo removed.");
    router.refresh();
  }

  async function uploadLogo(file: File) {
    if (!organization) return;
    setLogoUploading(true);
    setOk("");
    setError("");
    try {
      const url = await uploadImage(
        file,
        `${organization.name || "Company"} logo`,
      );
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("kn_organizations")
        .update({ logo_url: url })
        .eq("id", organization.id);
      if (updateError) throw new Error(updateError.message);
      await syncSiteBrandLogo(url);
      setLogoUrl(url);
      setOk("Company logo updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload logo.");
    } finally {
      setLogoUploading(false);
    }
  }

  async function clearLogo() {
    if (!organization) return;
    setLogoUploading(true);
    setOk("");
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("kn_organizations")
      .update({ logo_url: null })
      .eq("id", organization.id);
    setLogoUploading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await syncSiteBrandLogo(null);
    setLogoUrl(null);
    setOk("Company logo removed.");
    router.refresh();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOk("");
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("kn_profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        avatar_url: avatarUrl,
      })
      .eq("id", profile.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setOk("Profile saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="settings-panel space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[#0c0407]">Profile</h2>
        <p className="mt-1 text-sm text-[#758696]">
          Update how you appear across KeyNestOS.
        </p>
      </div>

      <div className="settings-image-grid">
        <ImageUploadField
          label="Profile photo"
          hint="Shown on your account and team directory."
          value={avatarUrl}
          variant="avatar"
          uploading={avatarUploading}
          onPick={(file) => void uploadAvatar(file)}
          onClear={() => void clearAvatar()}
        />
        {organization ? (
          <ImageUploadField
            label="Company logo"
            hint="For best results, upload a PNG or WebP with a transparent background."
            value={logoUrl}
            variant="logo"
            uploading={logoUploading}
            onPick={(file) => void uploadLogo(file)}
            onClear={() => void clearLogo()}
          />
        ) : (
          <div className="settings-image-field settings-image-field--muted">
            <div className="settings-image-field__copy">
              <p className="settings-image-field__label">Company logo</p>
              <p className="settings-image-field__hint">
                Join or create an organization to upload a company logo.
              </p>
            </div>
          </div>
        )}
      </div>

      <label className="field">
        <span>Email</span>
        <input value={profile.email} disabled />
      </label>
      <label className="field">
        <span>Full name</span>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </label>
      <label className="field">
        <span>Phone</span>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
          placeholder="(555) 000-0000"
        />
      </label>
      <Status ok={ok} error={error} />
      <button className="btn-primary w-fit" disabled={loading}>
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

export function SecuritySettingsPanel({
  hasPassword,
  mfaEnabled,
}: {
  hasPassword: boolean;
  mfaEnabled: boolean;
}) {
  return (
    <div className="settings-panel space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[#0c0407]">Security</h2>
        <p className="mt-1 text-sm text-[#758696]">
          Review how your account is protected.
        </p>
      </div>
      <ul className="settings-list">
        <li>
          <div>
            <p className="font-medium text-[#0c0407]">Password</p>
            <p className="text-sm text-[#758696]">
              {hasPassword ? "Password sign-in is enabled." : "No password on file."}
            </p>
          </div>
          <Link href={SETTINGS.password} className="btn-secondary">
            Manage
          </Link>
        </li>
        <li>
          <div>
            <p className="font-medium text-[#0c0407]">Two-factor authentication</p>
            <p className="text-sm text-[#758696]">
              {mfaEnabled ? "Authenticator app is enabled." : "Not enabled yet."}
            </p>
          </div>
          <Link href={SETTINGS.twoFactor} className="btn-secondary">
            {mfaEnabled ? "Manage" : "Enable"}
          </Link>
        </li>
        <li>
          <div>
            <p className="font-medium text-[#0c0407]">Active sessions</p>
            <p className="text-sm text-[#758696]">
              Review devices signed into your account.
            </p>
          </div>
          <Link href={SETTINGS.sessions} className="btn-secondary">
            View
          </Link>
        </li>
      </ul>
    </div>
  );
}

export function PasswordSettingsForm() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk("");
    setError("");
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    if (password !== confirm) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setLoading(false);
      setError("Use at least 8 characters.");
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    e.currentTarget.reset();
    setOk("Password updated.");
  }

  return (
    <form onSubmit={onSubmit} className="settings-panel space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[#0c0407]">Password</h2>
        <p className="mt-1 text-sm text-[#758696]">
          Choose a strong password you don&apos;t use elsewhere.
        </p>
      </div>
      <label className="field">
        <span>New password</span>
        <input name="password" type="password" required minLength={8} />
      </label>
      <label className="field">
        <span>Confirm password</span>
        <input name="confirm" type="password" required minLength={8} />
      </label>
      <Status ok={ok} error={error} />
      <button className="btn-primary w-fit" disabled={loading}>
        {loading ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

export function TwoFactorSettingsForm({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");
  const [isEnabled, setIsEnabled] = useState(enabled);

  async function startEnroll() {
    setLoading(true);
    setError("");
    setOk("");
    const supabase = createClient();
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator",
    });
    setLoading(false);
    if (enrollError) {
      setError(enrollError.message);
      return;
    }
    setFactorId(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
  }

  async function verifyEnroll(e: FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) {
      setLoading(false);
      setError(challenge.error.message);
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code,
    });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    setIsEnabled(true);
    setFactorId(null);
    setQr("");
    setSecret("");
    setCode("");
    setOk("Two-factor authentication is on.");
    router.refresh();
  }

  async function unenroll() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const totp = data?.totp?.[0];
    if (!totp) {
      setLoading(false);
      setError("No authenticator found.");
      return;
    }
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId: totp.id,
    });
    setLoading(false);
    if (unenrollError) {
      setError(unenrollError.message);
      return;
    }
    setIsEnabled(false);
    setOk("Two-factor authentication turned off.");
    router.refresh();
  }

  return (
    <div className="settings-panel space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[#0c0407]">
          Two-factor authentication
        </h2>
        <p className="mt-1 text-sm text-[#758696]">
          Add an authenticator app for an extra sign-in step.
        </p>
      </div>

      {isEnabled && !factorId ? (
        <>
          <p className="rounded-2xl bg-[#f7f7f7] px-4 py-3 text-sm text-[#0c0407]">
            Authenticator app is currently enabled.
          </p>
          <button
            type="button"
            className="btn-secondary w-fit"
            disabled={loading}
            onClick={unenroll}
          >
            {loading ? "Updating…" : "Turn off 2FA"}
          </button>
        </>
      ) : null}

      {!isEnabled && !factorId ? (
        <button
          type="button"
          className="btn-primary w-fit"
          disabled={loading}
          onClick={startEnroll}
        >
          {loading ? "Starting…" : "Set up authenticator"}
        </button>
      ) : null}

      {factorId ? (
        <form onSubmit={verifyEnroll} className="space-y-4">
          {qr ? (
            // QR is a data URL from Supabase MFA enroll
            <img
              src={qr}
              alt="Authenticator QR code"
              className="h-44 w-44 rounded-2xl border border-[#e8e8e8] bg-white p-2"
            />
          ) : null}
          <p className="text-sm text-[#758696]">
            Secret: <code className="text-[#0c0407]">{secret}</code>
          </p>
          <label className="field">
            <span>Verification code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              placeholder="123456"
            />
          </label>
          <button className="btn-primary w-fit" disabled={loading}>
            {loading ? "Verifying…" : "Confirm and enable"}
          </button>
        </form>
      ) : null}

      <Status ok={ok} error={error} />
    </div>
  );
}

export function SessionsSettingsPanel({
  email,
  lastSignIn,
}: {
  email: string;
  lastSignIn: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signOutEverywhere() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: signOutError } = await supabase.auth.signOut({
      scope: "global",
    });
    setLoading(false);
    if (signOutError) {
      setError(signOutError.message);
      return;
    }
    router.push("/auth/sign-in");
    router.refresh();
  }

  return (
    <div className="settings-panel space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[#0c0407]">Sessions</h2>
        <p className="mt-1 text-sm text-[#758696]">
          Manage where you&apos;re signed in.
        </p>
      </div>
      <div className="rounded-2xl border border-[#e8e8e8] px-4 py-4">
        <p className="font-medium text-[#0c0407]">This device</p>
        <p className="mt-1 text-sm text-[#758696]">{email}</p>
        <p className="mt-1 text-sm text-[#758696]">
          Last sign-in:{" "}
          {lastSignIn ? new Date(lastSignIn).toLocaleString() : "Unavailable"}
        </p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        className="btn-secondary w-fit"
        disabled={loading}
        onClick={signOutEverywhere}
      >
        {loading ? "Signing out…" : "Sign out of all devices"}
      </button>
    </div>
  );
}

const NOTIF_KEY = "keynest_notification_prefs";

type NotifPrefs = {
  leads: boolean;
  listings: boolean;
  security: boolean;
  product: boolean;
};

const DEFAULT_PREFS: NotifPrefs = {
  leads: true,
  listings: true,
  security: true,
  product: false,
};

export function NotificationSettingsForm() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [ok, setOk] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIF_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      // ignore
    }
  }, []);

  function save(e: FormEvent) {
    e.preventDefault();
    localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
    setOk("Notification preferences saved on this device.");
  }

  const items: { key: keyof NotifPrefs; label: string; hint: string }[] = [
    {
      key: "leads",
      label: "New leads",
      hint: "When someone submits a contact or sell form",
    },
    {
      key: "listings",
      label: "Listing updates",
      hint: "Publishing and status changes",
    },
    {
      key: "security",
      label: "Security alerts",
      hint: "Password and sign-in activity",
    },
    {
      key: "product",
      label: "Product updates",
      hint: "Occasional KeyNestOS news",
    },
  ];

  return (
    <form onSubmit={save} className="settings-panel space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[#0c0407]">Notifications</h2>
        <p className="mt-1 text-sm text-[#758696]">
          Choose what you want to hear about.
        </p>
      </div>
      <ul className="settings-list">
        {items.map((item) => (
          <li key={item.key}>
            <div>
              <p className="font-medium text-[#0c0407]">{item.label}</p>
              <p className="text-sm text-[#758696]">{item.hint}</p>
            </div>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={prefs[item.key]}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, [item.key]: e.target.checked }))
                }
              />
              <span />
            </label>
          </li>
        ))}
      </ul>
      <Status ok={ok} />
      <button className="btn-primary w-fit">Save preferences</button>
    </form>
  );
}
