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

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  account_type: AccountType | null;
  phone: string | null;
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
