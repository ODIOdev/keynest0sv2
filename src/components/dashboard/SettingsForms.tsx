"use client";

import { FormEvent, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatPhoneInput } from "@/lib/format";
import {
  buildProfileCsv,
  downloadProfileCsv,
  parseProfileCsv,
} from "@/lib/profile-csv";
import { SETTINGS } from "@/lib/settings-routes";
import type { Organization, Profile, ProfileSocialLink } from "@/lib/auth-types";
import type { Property } from "@/lib/types";
import { SocialPlatformIcon } from "@/components/site/SocialPlatformIcon";

const SOCIAL_PLATFORMS = [
  "Instagram",
  "Facebook",
  "X",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "Other",
] as const;

const GENDER_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "non_binary", label: "Non-binary" },
  { value: "other", label: "Other" },
] as const;

function normalizeSocialLinks(
  value: Profile["social_links"],
): ProfileSocialLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is ProfileSocialLink =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.platform === "string" &&
        typeof item.handle === "string",
    )
    .map((item) => ({
      id: item.id,
      platform: item.platform.trim() || "Other",
      handle: item.handle.trim(),
    }))
    .filter((item) => item.handle.length > 0);
}

function newSocialId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `social-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

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

async function syncSiteSocialLinks(links: ProfileSocialLink[]) {
  try {
    await fetch("/api/site-social", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ socialLinks: links }),
    });
  } catch {
    // Footer still reads from Supabase profile/org branding.
  }
}

async function persistProfileSocials({
  profileId,
  organization,
  links,
}: {
  profileId: string;
  organization?: Organization | null;
  links: ProfileSocialLink[];
}) {
  const cleaned = links
    .map((item) => ({
      id: item.id,
      platform: (item.platform || "Other").trim() || "Other",
      handle: (item.handle || "").trim(),
    }))
    .filter((item) => item.handle.length > 0);

  const supabase = createClient();
  const { error: updateError } = await supabase
    .from("kn_profiles")
    .update({ social_links: cleaned })
    .eq("id", profileId);
  if (updateError) throw new Error(updateError.message);

  if (organization) {
    const nextBranding = {
      ...(organization.branding && typeof organization.branding === "object"
        ? organization.branding
        : {}),
      socialLinks: cleaned,
    };
    await supabase
      .from("kn_organizations")
      .update({ branding: nextBranding })
      .eq("id", organization.id);
  }

  void syncSiteSocialLinks(cleaned);
  return cleaned;
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
  const [zipZone, setZipZone] = useState(profile.zip_zone || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    () => profile.date_of_birth?.slice(0, 10) || "",
  );
  const [gender, setGender] = useState(profile.gender || "");
  const [socialLinks, setSocialLinks] = useState<ProfileSocialLink[]>(() =>
    normalizeSocialLinks(profile.social_links),
  );
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [logoUrl, setLogoUrl] = useState(organization?.logo_url ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");
  const [csvImporting, setCsvImporting] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

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

    if (socialLinks.some((s) => !s.handle.trim())) {
      setLoading(false);
      setError("Add a handle for every social link, or remove empty rows.");
      return;
    }

    const cleanedSocials = normalizeSocialLinks(socialLinks);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("kn_profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        zip_zone: zipZone.trim() || null,
        date_of_birth: dateOfBirth.trim() || null,
        gender: gender.trim() || null,
        social_links: cleanedSocials,
        avatar_url: avatarUrl,
      })
      .eq("id", profile.id);

    if (updateError) {
      setLoading(false);
      setError(updateError.message);
      return;
    }

    try {
      if (organization) {
        const nextBranding = {
          ...(organization.branding && typeof organization.branding === "object"
            ? organization.branding
            : {}),
          socialLinks: cleanedSocials,
        };
        await supabase
          .from("kn_organizations")
          .update({ branding: nextBranding })
          .eq("id", organization.id);
      }
      void syncSiteSocialLinks(cleanedSocials);
      setSocialLinks(cleanedSocials);
      setEditingSocialId(null);
      setOk("Profile saved. Social links are live on the site footer.");
      router.refresh();
    } catch (err) {
      setSocialLinks(cleanedSocials);
      setOk("Profile saved.");
      setError(
        err instanceof Error
          ? err.message
          : "Social links could not sync to the footer.",
      );
    } finally {
      setLoading(false);
    }
  }

  function addSocial() {
    const id = newSocialId();
    setSocialLinks((prev) => [
      ...prev,
      { id, platform: "Instagram", handle: "" },
    ]);
    setEditingSocialId(id);
    setOk("");
    setError("");
  }

  function updateSocial(
    id: string,
    patch: Partial<Pick<ProfileSocialLink, "platform" | "handle">>,
  ) {
    setSocialLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  async function finishSocial(id: string) {
    const row = socialLinks.find((item) => item.id === id);
    if (!row || !row.handle.trim()) {
      setError("Add a handle before finishing this social link.");
      return;
    }
    setError("");
    setOk("");
    setEditingSocialId(null);
    const next = socialLinks.map((item) =>
      item.id === id
        ? {
            ...item,
            handle: item.handle.trim(),
            platform: item.platform.trim() || "Other",
          }
        : item,
    );
    setSocialLinks(normalizeSocialLinks(next));
    try {
      const saved = await persistProfileSocials({
        profileId: profile.id,
        organization,
        links: next,
      });
      setSocialLinks(saved);
      setOk("Social link published to the site footer.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not publish social link.",
      );
    }
  }

  async function deleteSocial(id: string) {
    const next = socialLinks.filter((item) => item.id !== id);
    setSocialLinks(next);
    setEditingSocialId((current) => (current === id ? null : current));
    setOk("");
    setError("");
    try {
      const saved = await persistProfileSocials({
        profileId: profile.id,
        organization,
        links: next,
      });
      setSocialLinks(saved);
      setOk(
        saved.length
          ? "Social link removed from the site footer."
          : "All social links removed from the site footer.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update social links.",
      );
    }
  }

  function exportProfileCsv() {
    setOk("");
    setError("");
    const csv = buildProfileCsv({
      fullName,
      phone,
      zipZone,
      dateOfBirth,
      gender,
      socialLinks: normalizeSocialLinks(socialLinks),
      email: profile.email,
    });
    const stamp = new Date().toISOString().slice(0, 10);
    downloadProfileCsv(csv, `keynestos-profile-${stamp}.csv`);
    setOk("Profile CSV downloaded.");
  }

  async function importProfileCsv(file: File) {
    setCsvImporting(true);
    setOk("");
    setError("");
    try {
      const text = await file.text();
      const parsed = parseProfileCsv(text);
      if (parsed.fullName) setFullName(parsed.fullName);
      if (parsed.phone) setPhone(formatPhoneInput(parsed.phone));
      if (parsed.zipZone) setZipZone(parsed.zipZone);
      if (parsed.dateOfBirth) setDateOfBirth(parsed.dateOfBirth.slice(0, 10));
      if (parsed.gender !== undefined) setGender(parsed.gender);
      if (parsed.socialLinks.length > 0) {
        setSocialLinks(parsed.socialLinks);
        setEditingSocialId(null);
      }
      setOk(
        "CSV imported into the form. Review the fields, then click Save profile.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import CSV.");
    } finally {
      setCsvImporting(false);
    }
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

      <div className="settings-field-row">
        <label className="field">
          <span>Full name</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input value={profile.email} disabled />
        </label>
      </div>
      <div className="settings-field-row">
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
        <label className="field">
          <span>Zip code zone</span>
          <input
            type="text"
            inputMode="text"
            autoComplete="postal-code"
            value={zipZone}
            onChange={(e) => setZipZone(e.target.value)}
            placeholder="10001 or 10001–10019"
            maxLength={64}
          />
        </label>
      </div>
      <div className="settings-field-row">
        <label className="field">
          <span>Date of birth</span>
          <input
            type="date"
            autoComplete="bday"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </label>
        <label className="field">
          <span>Gender</span>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            autoComplete="sex"
          >
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value || "unspecified"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="settings-social">
        <div className="settings-social__head">
          <div>
            <p className="settings-social__title">Social media</p>
            <p className="settings-social__sub">
              Add handles people can find you on. Confirming a row publishes it
              to the website footer.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary settings-social__add"
            onClick={addSocial}
          >
            + Add social
          </button>
        </div>

        {socialLinks.length === 0 ? (
          <p className="settings-social__empty">No social handles yet.</p>
        ) : (
          <ul className="settings-social__list">
            {socialLinks.map((item) => {
              const editing = editingSocialId === item.id;
              return (
                <li
                  key={item.id}
                  className={`settings-social__item${editing ? " is-editing" : ""}`}
                >
                  {editing ? (
                    <div className="settings-social__fields">
                      <label className="field settings-social__platform">
                        <span>Platform</span>
                        <div className="settings-social__platform-control">
                          <span className="settings-social__mark" aria-hidden>
                            <SocialPlatformIcon platform={item.platform} />
                          </span>
                          <select
                            value={
                              SOCIAL_PLATFORMS.includes(
                                item.platform as (typeof SOCIAL_PLATFORMS)[number],
                              )
                                ? item.platform
                                : "Other"
                            }
                            onChange={(e) =>
                              updateSocial(item.id, { platform: e.target.value })
                            }
                            aria-label="Platform"
                          >
                            {SOCIAL_PLATFORMS.map((platform) => (
                              <option key={platform} value={platform}>
                                {platform}
                              </option>
                            ))}
                          </select>
                        </div>
                      </label>
                      <label className="field settings-social__handle">
                        <span>Handle</span>
                        <input
                          value={item.handle}
                          onChange={(e) =>
                            updateSocial(item.id, { handle: e.target.value })
                          }
                          placeholder="@username or profile URL"
                          aria-label="Handle"
                          autoFocus
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="settings-social__preview">
                      <span className="settings-social__mark" aria-hidden>
                        <SocialPlatformIcon platform={item.platform} />
                      </span>
                      <div className="settings-social__preview-copy">
                        <p className="settings-social__platform-label">
                          {item.platform}
                        </p>
                        <p className="settings-social__handle-label">
                          {item.handle.startsWith("@") ||
                          item.handle.includes("/")
                            ? item.handle
                            : `@${item.handle}`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="settings-social__actions">
                    {editing ? (
                      <button
                        type="button"
                        className="settings-social__icon-btn"
                        aria-label="Done editing"
                        title="Done"
                        onClick={() => void finishSocial(item.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="settings-social__icon-btn"
                        aria-label={`Edit ${item.platform}`}
                        title="Edit"
                        onClick={() => setEditingSocialId(item.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      className="settings-social__icon-btn settings-social__icon-btn--danger"
                      aria-label={`Delete ${item.platform}`}
                      title="Delete"
                      onClick={() => void deleteSocial(item.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="settings-csv">
        <div className="settings-csv__copy">
          <p className="settings-csv__title">Export / import CSV</p>
          <p className="settings-csv__sub">
            Download your profile and social handles, or load a CSV into this
            form before saving.
          </p>
        </div>
        <div className="settings-csv__actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={exportProfileCsv}
          >
            Export CSV
          </button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importProfileCsv(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn-secondary"
            disabled={csvImporting}
            onClick={() => csvInputRef.current?.click()}
          >
            {csvImporting ? "Importing…" : "Import CSV"}
          </button>
        </div>
      </div>

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
  canClearPlatform = false,
}: {
  hasPassword: boolean;
  mfaEnabled: boolean;
  canClearPlatform?: boolean;
}) {
  const router = useRouter();
  const [clearStep, setClearStep] = useState<0 | 1 | 2>(0);
  const [confirmText, setConfirmText] = useState("");
  const [clearLoading, setClearLoading] = useState(false);
  const [clearOk, setClearOk] = useState("");
  const [clearError, setClearError] = useState("");

  async function clearPlatformData() {
    setClearLoading(true);
    setClearOk("");
    setClearError("");
    try {
      const res = await fetch("/api/platform/clear-data", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(body.error || "Could not clear platform data.");
      }
      setClearOk(body.message || "Platform data cleared.");
      setClearStep(0);
      setConfirmText("");
      router.refresh();
    } catch (err) {
      setClearError(
        err instanceof Error ? err.message : "Could not clear platform data.",
      );
    } finally {
      setClearLoading(false);
    }
  }

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

      {canClearPlatform ? (
        <div className="settings-danger">
          <div className="settings-danger__head">
            <div>
              <p className="settings-danger__title">Clear platform data</p>
              <p className="settings-danger__sub">
                Format and wipe CRM listings, leads, agents, categories, media,
                and site content back to the demo seed. Auth accounts are not
                deleted.
              </p>
            </div>
            {clearStep === 0 ? (
              <button
                type="button"
                className="btn-secondary settings-danger__trigger"
                onClick={() => {
                  setClearStep(1);
                  setClearOk("");
                  setClearError("");
                }}
              >
                Clear data
              </button>
            ) : null}
          </div>

          {clearStep === 1 ? (
            <div className="settings-danger__warn" role="alert">
              <p className="settings-danger__warn-title">Warning</p>
              <p>
                This permanently replaces live CRM and marketing data with the
                seeded demo dataset. Uploaded listing records and leads will be
                removed from the platform store.
              </p>
              <div className="settings-danger__actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setClearStep(0)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-secondary settings-danger__continue"
                  onClick={() => {
                    setClearStep(2);
                    setConfirmText("");
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          ) : null}

          {clearStep === 2 ? (
            <div className="settings-danger__warn settings-danger__warn--final" role="alert">
              <p className="settings-danger__warn-title">Final confirmation</p>
              <p>
                Type <strong>CLEAR</strong> to confirm you want to format and
                wipe platform data. This cannot be undone.
              </p>
              <label className="field">
                <span>Confirmation</span>
                <input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="CLEAR"
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <div className="settings-danger__actions">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={clearLoading}
                  onClick={() => {
                    setClearStep(0);
                    setConfirmText("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="settings-danger__confirm"
                  disabled={clearLoading || confirmText.trim() !== "CLEAR"}
                  onClick={() => void clearPlatformData()}
                >
                  {clearLoading ? "Clearing…" : "Format & clear data"}
                </button>
              </div>
            </div>
          ) : null}

          <Status ok={clearOk} error={clearError} />
        </div>
      ) : null}
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

export function ArchivesSettingsPanel({
  deleted,
  drafts,
  closed,
}: {
  deleted: ArchiveItem[];
  drafts: ArchiveItem[];
  closed: ArchiveItem[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function restore(id: string) {
    setBusyId(id);
    setError("");
    setOk("");
    try {
      const res = await fetch(`/api/properties?id=${id}&restore=1`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Could not restore property.");
      }
      setOk("Property restored.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not restore.");
    } finally {
      setBusyId(null);
    }
  }

  async function purge(id: string, title: string) {
    if (
      !confirm(
        `Permanently delete “${title}”? This cannot be undone.`,
      )
    ) {
      return;
    }
    setBusyId(id);
    setError("");
    setOk("");
    try {
      const res = await fetch(`/api/properties?id=${id}&permanent=1`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Could not delete permanently.");
      }
      setOk("Property permanently deleted.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete permanently.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const empty =
    deleted.length === 0 && drafts.length === 0 && closed.length === 0;

  return (
    <div className="settings-panel space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[#0c0407]">Archives</h2>
        <p className="mt-1 text-sm text-[#758696]">
          Deleted listings stay here until you restore or permanently remove
          them. Drafts and closed listings are listed for quick access.
        </p>
      </div>

      <Status ok={ok} error={error} />

      {empty ? (
        <p className="settings-social__empty">
          No drafts, deleted, or closed listings yet.
        </p>
      ) : null}

      <ArchiveSection
        title="Deleted"
        hint="Removed from inventory — restore or delete forever."
        emptyLabel="No deleted properties."
        items={deleted}
        badge={(item) => (
          <span className="settings-archives__badge settings-archives__badge--deleted">
            Deleted
          </span>
        )}
        meta={(item) =>
          item.deletedAt
            ? `Removed ${new Date(item.deletedAt).toLocaleString()}`
            : "Removed"
        }
        actions={(item) => (
          <>
            <button
              type="button"
              className="btn-secondary settings-archives__open"
              disabled={busyId === item.id}
              onClick={() => void restore(item.id)}
            >
              {busyId === item.id ? "Working…" : "Restore"}
            </button>
            <button
              type="button"
              className="settings-archives__purge"
              disabled={busyId === item.id}
              onClick={() => void purge(item.id, item.title)}
            >
              Delete forever
            </button>
          </>
        )}
      />

      <ArchiveSection
        title="Drafts"
        hint="Unpublished listings still in progress."
        emptyLabel="No drafts."
        items={drafts}
        badge={() => (
          <span className="settings-archives__badge settings-archives__badge--draft">
            Draft
          </span>
        )}
        meta={(item) =>
          `${item.city}, ${item.state} · ${item.priceLabel}`
        }
        actions={(item) => (
          <Link
            href={`/dashboard/properties/${item.id}`}
            className="btn-secondary settings-archives__open"
          >
            Open
          </Link>
        )}
      />

      <ArchiveSection
        title="Closed"
        hint="Sold or rented listings."
        emptyLabel="No closed listings."
        items={closed}
        badge={(item) => (
          <span
            className={`settings-archives__badge settings-archives__badge--${item.status}`}
          >
            {item.status === "sold" ? "Sold" : "Rented"}
          </span>
        )}
        meta={(item) =>
          `${item.city}, ${item.state} · ${item.priceLabel}`
        }
        actions={(item) => (
          <Link
            href={`/dashboard/properties/${item.id}`}
            className="btn-secondary settings-archives__open"
          >
            Open
          </Link>
        )}
      />
    </div>
  );
}

type ArchiveItem = {
  id: string;
  title: string;
  city: string;
  state: string;
  status: Property["status"];
  deletedAt: string | null;
  priceLabel: string;
  updatedAt: string;
};

function ArchiveSection({
  title,
  hint,
  emptyLabel,
  items,
  badge,
  meta,
  actions,
}: {
  title: string;
  hint: string;
  emptyLabel: string;
  items: ArchiveItem[];
  badge: (item: ArchiveItem) => ReactNode;
  meta: (item: ArchiveItem) => string;
  actions: (item: ArchiveItem) => ReactNode;
}) {
  return (
    <section className="settings-archives-section">
      <div className="settings-archives-section__head">
        <h3 className="settings-archives-section__title">{title}</h3>
        <p className="settings-archives-section__hint">{hint}</p>
      </div>
      {items.length === 0 ? (
        <p className="settings-social__empty">{emptyLabel}</p>
      ) : (
        <ul className="settings-archives">
          {items.map((item) => (
            <li key={item.id} className="settings-archives__item">
              <div className="settings-archives__copy">
                <p className="settings-archives__title">{item.title}</p>
                <p className="settings-archives__meta">{meta(item)}</p>
              </div>
              {badge(item)}
              <div className="settings-archives__actions">{actions(item)}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
