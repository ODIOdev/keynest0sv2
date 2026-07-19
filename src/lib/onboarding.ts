export const ONBOARDING = {
  root: "/onboarding",
  account: "/onboarding/account",
  business: "/onboarding/business",
  industry: "/onboarding/industry",
  plan: "/onboarding/plan",
  branding: "/onboarding/branding",
  team: "/onboarding/team",
  complete: "/onboarding/complete",
} as const;

export type OnboardingPath = (typeof ONBOARDING)[keyof typeof ONBOARDING];

export const BUSINESS_STEPS = [
  { path: ONBOARDING.account, label: "Account", key: "account" },
  { path: ONBOARDING.business, label: "Business", key: "business" },
  { path: ONBOARDING.industry, label: "Industry", key: "industry" },
  { path: ONBOARDING.plan, label: "Plan", key: "plan" },
  { path: ONBOARDING.branding, label: "Branding", key: "branding" },
  { path: ONBOARDING.team, label: "Team", key: "team" },
  { path: ONBOARDING.complete, label: "Done", key: "complete" },
] as const;

export const PERSONAL_STEPS = [
  { path: ONBOARDING.account, label: "Account", key: "account" },
  { path: ONBOARDING.complete, label: "Done", key: "complete" },
] as const;

export const INDUSTRIES = [
  "Real estate",
  "Tax preparation",
  "Property management",
  "Brokerage",
  "Other",
] as const;

export const PLANS = [
  { id: "starter", label: "Starter", hint: "Solo agents and small teams" },
  { id: "growth", label: "Growth", hint: "Growing brokerages" },
  { id: "enterprise", label: "Enterprise", hint: "Multi-office organizations" },
] as const;

export type OnboardingDraft = {
  full_name: string;
  phone: string;
  business_name: string;
  industry: string;
  plan: string;
  branding_color: string;
  invite_email: string;
};

export const EMPTY_DRAFT: OnboardingDraft = {
  full_name: "",
  phone: "",
  business_name: "",
  industry: "Real estate",
  plan: "starter",
  branding_color: "#0c0407",
  invite_email: "",
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}
