import type { AppRole } from "@/lib/auth-types";
import {
  PERMISSIONS,
  PERMISSION_META,
  permissionsForRole,
  hasPermission,
  type Permission,
} from "@/lib/permissions";

export const TEAM = {
  root: "/dashboard/team",
  invite: "/dashboard/team/invite",
  members: "/dashboard/team/members",
  roles: "/dashboard/team/roles",
  permissions: "/dashboard/team/permissions",
} as const;

export const TEAM_NAV = [
  { href: TEAM.root, label: "Overview", hint: "Team snapshot", exact: true },
  { href: TEAM.members, label: "Members", hint: "People in your org" },
  { href: TEAM.invite, label: "Invite", hint: "Send an invite" },
  { href: TEAM.roles, label: "Roles", hint: "What each role means" },
  { href: TEAM.permissions, label: "Permissions", hint: "Access matrix" },
] as const;

export const ASSIGNABLE_ROLES: AppRole[] = [
  "owner",
  "manager",
  "employee",
  "realtor",
  "tax_preparer",
  "assistant",
];

export const ROLE_DETAILS: {
  role: AppRole;
  summary: string;
  permissions: Permission[];
}[] = [
  {
    role: "platform_admin",
    summary: "Full platform access across organizations.",
    permissions: permissionsForRole("platform_admin"),
  },
  {
    role: "owner",
    summary: "Owns the organization — org updates, invites, clients, billing, and reports.",
    permissions: permissionsForRole("owner"),
  },
  {
    role: "manager",
    summary: "Runs day-to-day operations and can manage most team access.",
    permissions: permissionsForRole("manager"),
  },
  {
    role: "realtor",
    summary: "Works listings and client conversations.",
    permissions: permissionsForRole("realtor"),
  },
  {
    role: "employee",
    summary: "Assigned client work, documents, and tasks.",
    permissions: permissionsForRole("employee"),
  },
  {
    role: "tax_preparer",
    summary: "Handles tax and document workflows for clients.",
    permissions: permissionsForRole("tax_preparer"),
  },
  {
    role: "assistant",
    summary: "Supports agents with scheduling and follow-ups.",
    permissions: permissionsForRole("assistant"),
  },
  {
    role: "customer",
    summary: "External client portal access only.",
    permissions: permissionsForRole("customer"),
  },
];

/** Matrix rows for the permissions page — one per permission key */
export const PERMISSION_MATRIX = PERMISSIONS.map((key) => ({
  key,
  label: PERMISSION_META[key].label,
  group: PERMISSION_META[key].group,
  description: PERMISSION_META[key].description,
  roles: {
    platform_admin: hasPermission("platform_admin", key),
    owner: hasPermission("owner", key),
    manager: hasPermission("manager", key),
    realtor: hasPermission("realtor", key),
    employee: hasPermission("employee", key),
    tax_preparer: hasPermission("tax_preparer", key),
    assistant: hasPermission("assistant", key),
    customer: hasPermission("customer", key),
  } satisfies Record<AppRole, boolean>,
}));
