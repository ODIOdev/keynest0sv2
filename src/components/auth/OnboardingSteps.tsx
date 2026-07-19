"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  INDUSTRIES,
  ONBOARDING,
  PLANS,
  slugify,
} from "@/lib/onboarding";
import {
  clearOnboardingDraft,
  useOnboarding,
} from "@/components/auth/OnboardingProvider";
import {
  OnboardingActions,
  OnboardingShell,
} from "@/components/auth/OnboardingShell";

export function AccountStep() {
  const { draft, patch, goNext } = useOnboarding();
  const [error, setError] = useState("");

  return (
    <OnboardingShell title="Your account">
      <div className="space-y-4">
        <label className="field">
          <span>Full name</span>
          <input
            value={draft.full_name}
            onChange={(e) => patch({ full_name: e.target.value })}
            required
            autoComplete="name"
          />
        </label>
        <label className="field">
          <span>Phone</span>
          <input
            value={draft.phone}
            onChange={(e) => patch({ phone: e.target.value })}
            placeholder="Optional"
            autoComplete="tel"
          />
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <OnboardingActions
        onContinue={() => {
          if (!draft.full_name.trim()) {
            setError("Name is required.");
            return;
          }
          setError("");
          goNext();
        }}
      />
    </OnboardingShell>
  );
}

export function BusinessStep() {
  const { draft, patch, goNext } = useOnboarding();
  const [error, setError] = useState("");

  return (
    <OnboardingShell title="Your business">
      <label className="field">
        <span>Business name</span>
        <input
          value={draft.business_name}
          onChange={(e) => patch({ business_name: e.target.value })}
          required
          placeholder="KeyNest Realty"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <OnboardingActions
        onContinue={() => {
          if (!draft.business_name.trim()) {
            setError("Business name is required.");
            return;
          }
          setError("");
          goNext();
        }}
      />
    </OnboardingShell>
  );
}

export function IndustryStep() {
  const { draft, patch, goNext } = useOnboarding();

  return (
    <OnboardingShell title="Industry">
      <div className="grid gap-2">
        {INDUSTRIES.map((industry) => (
          <label
            key={industry}
            className={`flex cursor-pointer gap-3 rounded-2xl border px-3 py-3 ${
              draft.industry === industry
                ? "border-[#0c0407] bg-[#f7f7f7]"
                : "border-[#e8e8e8]"
            }`}
          >
            <input
              type="radio"
              name="industry"
              checked={draft.industry === industry}
              onChange={() => patch({ industry })}
            />
            <span className="font-medium text-[#0c0407]">{industry}</span>
          </label>
        ))}
      </div>
      <OnboardingActions onContinue={goNext} />
    </OnboardingShell>
  );
}

export function PlanStep() {
  const { draft, patch, goNext } = useOnboarding();

  return (
    <OnboardingShell title="Choose a plan">
      <div className="grid gap-2">
        {PLANS.map((plan) => (
          <label
            key={plan.id}
            className={`flex cursor-pointer gap-3 rounded-2xl border px-3 py-3 ${
              draft.plan === plan.id
                ? "border-[#0c0407] bg-[#f7f7f7]"
                : "border-[#e8e8e8]"
            }`}
          >
            <input
              type="radio"
              name="plan"
              checked={draft.plan === plan.id}
              onChange={() => patch({ plan: plan.id })}
            />
            <span>
              <span className="block font-medium text-[#0c0407]">
                {plan.label}
              </span>
              <span className="block text-sm text-[#758696]">{plan.hint}</span>
            </span>
          </label>
        ))}
      </div>
      <OnboardingActions onContinue={goNext} />
    </OnboardingShell>
  );
}

export function BrandingStep() {
  const { draft, patch, goNext } = useOnboarding();

  return (
    <OnboardingShell title="Branding">
      <label className="field">
        <span>Brand color</span>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={draft.branding_color}
            onChange={(e) => patch({ branding_color: e.target.value })}
            className="h-12 w-16 cursor-pointer rounded-lg border border-[#e8e8e8] bg-white p-1"
          />
          <span className="text-sm text-[#758696]">{draft.branding_color}</span>
        </div>
      </label>
      <p className="text-sm text-[#758696]">
        Used for accents in your workspace. You can change this later.
      </p>
      <OnboardingActions onContinue={goNext} />
    </OnboardingShell>
  );
}

export function TeamStep() {
  const { draft, patch, goNext } = useOnboarding();

  return (
    <OnboardingShell title="Invite your team">
      <p className="text-sm text-[#758696]">
        Optionally invite a teammate now. You can add more later.
      </p>
      <label className="field">
        <span>Teammate email</span>
        <input
          type="email"
          value={draft.invite_email}
          onChange={(e) => patch({ invite_email: e.target.value })}
          placeholder="colleague@company.com"
        />
      </label>
      <OnboardingActions onContinue={goNext} continueLabel="Continue" />
    </OnboardingShell>
  );
}

export function CompleteStep() {
  const router = useRouter();
  const { draft, accountType, isBusiness } = useOnboarding();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        full_name: draft.full_name,
        phone: draft.phone || null,
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
      const baseSlug =
        slugify(draft.business_name) || `org-${user.id.slice(0, 8)}`;
      const { data: org, error: orgError } = await supabase
        .from("kn_organizations")
        .insert({
          name: draft.business_name,
          slug: baseSlug,
          industry: draft.industry,
          subscription_plan: draft.plan,
          branding: { primary: draft.branding_color },
          owner_id: user.id,
        })
        .select("*")
        .single();

      if (orgError) {
        setLoading(false);
        setError(orgError.message);
        return;
      }

      const { error: memberError } = await supabase
        .from("kn_memberships")
        .insert({
          org_id: org.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) {
        setLoading(false);
        setError(memberError.message);
        return;
      }

      if (draft.invite_email.trim()) {
        const token = crypto.randomUUID();
        await supabase.from("kn_invitations").insert({
          org_id: org.id,
          email: draft.invite_email.trim().toLowerCase(),
          role: "employee",
          invited_by: user.id,
          token,
          expires_at: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 7,
          ).toISOString(),
        });
      }
    }

    clearOnboardingDraft();
    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <OnboardingShell title="You're ready">
      <p className="text-[#758696]">
        {isBusiness
          ? `We’ll set up ${draft.business_name || "your workspace"} and take you to the dashboard.`
          : "Enter the dashboard to manage listings and your account."}
      </p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <OnboardingActions
        onContinue={finish}
        continueLabel="Enter dashboard"
        loading={loading}
      />
    </OnboardingShell>
  );
}

export function OnboardingIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ONBOARDING.account);
  }, [router]);

  return (
    <div className="auth-card">
      <p className="text-[#758696]">Starting onboarding…</p>
    </div>
  );
}
