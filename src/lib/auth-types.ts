export type AccountType = "business" | "employee" | "customer";

export type AppRole =
  | "platform_admin"
  | "owner"
  | "manager"
  | "employee"
  | "realtor"
  | "tax_preparer"
  | "assistant"
  | "customer";

export type ProfileSocialLink = {
  id: string;
  platform: string;
  handle: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  account_type: AccountType | null;
  phone: string | null;
  /** Coverage / service zip code zone (e.g. 10001 or 10001–10019) */
  zip_zone: string | null;
  /** Date of birth (YYYY-MM-DD) */
  date_of_birth: string | null;
  gender: string | null;
  social_links: ProfileSocialLink[] | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  logo_url: string | null;
  branding: Record<string, unknown>;
  subscription_plan: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Membership = {
  id: string;
  org_id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
};

export function roleLabel(role: AppRole) {
  const labels: Record<AppRole, string> = {
    platform_admin: "Platform administrator",
    owner: "Business owner",
    manager: "Manager",
    employee: "Employee",
    realtor: "Realtor",
    tax_preparer: "Tax preparer",
    assistant: "Assistant",
    customer: "Customer",
  };
  return labels[role];
}
