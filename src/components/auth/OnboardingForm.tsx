"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const industries = [
  "Real estate",
  "Tax preparation",
  "Property management",
  "Brokerage",
  "Other",
];

const plans = [
  { id: "starter", label: "Starter", hint: "Solo agents and small teams" },
  { id: "growth", label: "Growth", hint: "Growing brokerages" },
  { id: "enterprise", label: "Enterprise", hint: "Multi-office organizations" },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function OnboardingForm({
  email,
  fullName,
  accountType,
}: {
  email: string;
  fullName: string;
  accountType: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [personal, setPersonal] = useState({
    full_name: fullName || "",
    phone: "",
  });
  const [business, setBusiness] = useState({
    name: "",
    industry: "Real estate",
    plan: "starter",
    branding_color: "#0c0407",
  });
  const [inviteEmail, setInviteEmail] = useState("");

  const isBusiness = accountType === "business" || !accountType;
  const steps = isBusiness
    ? ["Personal", "Business", "Plan", "Team", "Done"]
    : ["Personal", "Done"];

  async function finish() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError("Session expired. Please sign in again.");
      return;
    }

    const { error: profileError } = await supabase
      .from("kn_profiles")
      .update({
        full_name: personal.full_name,
        phone: personal.phone || null,
        onboarding_completed: true,
        account_type: accountType || "business",
      })
      .eq("id", user.id);

    if (profileError) {
      setLoading(false);
      setError(profileError.message);
      return;
    }

    if (isBusiness) {
      const baseSlug = slugify(business.name) || `org-${user.id.slice(0, 8)}`;
      const { data: org, error: orgError } = await supabase
        .from("kn_organizations")
        .insert({
          name: business.name,
          slug: baseSlug,
          industry: business.industry,
          subscription_plan: business.plan,
          branding: { primary: business.branding_color },
          owner_id: user.id,
        })
        .select("*")
        .single();

      if (orgError) {
        setLoading(false);
        setError(orgError.message);
        return;
      }

      const { error: memberError } = await supabase.from("kn_memberships").insert({
        org_id: org.id,
        user_id: user.id,
        role: "owner",
      });

      if (memberError) {
        setLoading(false);
        setError(memberError.message);
        return;
      }

      if (inviteEmail.trim()) {
        const token = crypto.randomUUID();
        await supabase.from("kn_invitations").insert({
          org_id: org.id,
          email: inviteEmail.trim().toLowerCase(),
          role: "employee",
          invited_by: user.id,
          token,
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        });
      }
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < steps.length - 1) {
      if (step === 0 && !personal.full_name.trim()) {
        setError("Name is required.");
        return;
      }
      if (isBusiness && step === 1 && !business.name.trim()) {
        setError("Business name is required.");
        return;
      }
      setError("");
      setStep((s) => s + 1);
      return;
    }
    await finish();
  }

  return (
    <form onSubmit={onSubmit} className="auth-card space-y-5">
      <div>
        <p className="text-sm uppercase tracking-wide text-[#758696]">Onboarding</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#0c0407]">
          {steps[step]}
        </h1>
        <p className="mt-1 text-sm text-[#758696]">
          Step {step + 1} of {steps.length} · {email}
        </p>
      </div>

      {step === 0 ? (
        <div className="space-y-4">
          <label className="field">
            <span>Full name</span>
            <input
              value={personal.full_name}
              onChange={(e) => setPersonal((p) => ({ ...p, full_name: e.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Phone</span>
            <input
              value={personal.phone}
              onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Optional"
            />
          </label>
        </div>
      ) : null}

      {isBusiness && step === 1 ? (
        <div className="space-y-4">
          <label className="field">
            <span>Business name</span>
            <input
              value={business.name}
              onChange={(e) => setBusiness((b) => ({ ...b, name: e.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Industry</span>
            <select
              value={business.industry}
              onChange={(e) => setBusiness((b) => ({ ...b, industry: e.target.value }))}
            >
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Brand color</span>
            <input
              type="color"
              value={business.branding_color}
              onChange={(e) =>
                setBusiness((b) => ({ ...b, branding_color: e.target.value }))
              }
            />
          </label>
        </div>
      ) : null}

      {isBusiness && step === 2 ? (
        <div className="grid gap-2">
          {plans.map((plan) => (
            <label
              key={plan.id}
              className={`flex cursor-pointer gap-3 rounded-2xl border px-3 py-3 ${
                business.plan === plan.id
                  ? "border-[#0c0407] bg-[#f7f7f7]"
                  : "border-[#e8e8e8]"
              }`}
            >
              <input
                type="radio"
                name="plan"
                checked={business.plan === plan.id}
                onChange={() => setBusiness((b) => ({ ...b, plan: plan.id }))}
              />
              <span>
                <span className="block font-medium text-[#0c0407]">{plan.label}</span>
                <span className="block text-sm text-[#758696]">{plan.hint}</span>
              </span>
            </label>
          ))}
        </div>
      ) : null}

      {isBusiness && step === 3 ? (
        <div className="space-y-4">
          <p className="text-sm text-[#758696]">
            Optionally invite a teammate now. You can add more later.
          </p>
          <label className="field">
            <span>Teammate email</span>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
            />
          </label>
        </div>
      ) : null}

      {(step === steps.length - 1) ? (
        <p className="text-[#758696]">
          You&apos;re ready. Enter the dashboard to manage properties, leads, and your team.
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-2">
        {step > 0 ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
        ) : null}
        <button className="btn-primary flex-1" disabled={loading}>
          {loading
            ? "Saving..."
            : step === steps.length - 1
              ? "Enter dashboard"
              : "Continue"}
        </button>
      </div>
    </form>
  );
}
