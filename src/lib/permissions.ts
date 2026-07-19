import type { AppRole } from "@/lib/auth-types";

/** Canonical permission keys for KeyNestOS RBAC */
export const PERMISSIONS = [
  "organization.view",
  "organization.update",
  "organization.delete",
  "team.view",
  "team.invite",
  "team.update",
  "team.remove",
  "client.view_all",
  "client.view_assigned",
  "client.create",
  "client.update",
  "client.delete",
  "document.upload",
  "document.view",
  "document.download",
  "document.delete",
  "task.update",
  "billing.view",
  "billing.update",
  "reports.view",
  "settings.update",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_META: Record<
  Permission,
  { label: string; group: string; description: string }
> = {
  "organization.view": {
    group: "Organization",
    label: "View organization",
    description: "See organization profile and workspace details",
  },
  "organization.update": {
    group: "Organization",
    label: "Update organization",
    description: "Edit organization name, branding, and settings",
  },
  "organization.delete": {
    group: "Organization",
    label: "Delete organization",
    description: "Permanently delete the organization",
  },
  "team.view": {
    group: "Team",
    label: "View team",
    description: "See members and pending invites",
  },
  "team.invite": {
    group: "Team",
    label: "Invite members",
    description: "Create and send team invitations",
  },
  "team.update": {
    group: "Team",
    label: "Update members",
    description: "Change member roles",
  },
  "team.remove": {
    group: "Team",
    label: "Remove members",
    description: "Remove members and revoke invites",
  },
  "client.view_all": {
    group: "Clients",
    label: "View all clients",
    description: "Access every client in the organization",
  },
  "client.view_assigned": {
    group: "Clients",
    label: "View assigned clients",
    description: "Access only clients assigned to you",
  },
  "client.create": {
    group: "Clients",
    label: "Create clients",
    description: "Add new clients to the workspace",
  },
  "client.update": {
    group: "Clients",
    label: "Update clients",
    description: "Edit client profiles and details",
  },
  "client.delete": {
    group: "Clients",
    label: "Delete clients",
    description: "Remove clients from the workspace",
  },
  "document.upload": {
    group: "Documents",
    label: "Upload documents",
    description: "Upload files to client or org storage",
  },
  "document.view": {
    group: "Documents",
    label: "View documents",
    description: "Browse document metadata and previews",
  },
  "document.download": {
    group: "Documents",
    label: "Download documents",
    description: "Download document files",
  },
  "document.delete": {
    group: "Documents",
    label: "Delete documents",
    description: "Permanently remove documents",
  },
  "task.update": {
    group: "Tasks",
    label: "Update tasks",
    description: "Edit and complete assigned tasks",
  },
  "billing.view": {
    group: "Billing",
    label: "View billing",
    description: "See plans, invoices, and payment status",
  },
  "billing.update": {
    group: "Billing",
    label: "Update billing",
    description: "Change plan and payment methods",
  },
  "reports.view": {
    group: "Reports",
    label: "View reports",
    description: "Access analytics and exported reports",
  },
  "settings.update": {
    group: "Settings",
    label: "Update settings",
    description: "Change workspace and account settings",
  },
};

/** Role → granted permissions */
export const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  platform_admin: PERMISSIONS,

  owner: [
    "organization.update",
    "team.invite",
    "client.view_all",
    "billing.update",
    "reports.view",
  ],

  manager: [
    "organization.view",
    "organization.update",
    "team.view",
    "team.invite",
    "team.update",
    "team.remove",
    "client.view_all",
    "client.view_assigned",
    "client.create",
    "client.update",
    "client.delete",
    "document.upload",
    "document.view",
    "document.download",
    "document.delete",
    "task.update",
    "billing.view",
    "reports.view",
    "settings.update",
  ],

  realtor: [
    "organization.view",
    "team.view",
    "client.view_assigned",
    "client.create",
    "client.update",
    "document.upload",
    "document.view",
    "document.download",
    "task.update",
    "reports.view",
  ],

  employee: [
    "client.view_assigned",
    "document.upload",
    "document.view",
    "task.update",
  ],

  tax_preparer: [
    "organization.view",
    "team.view",
    "client.view_assigned",
    "client.update",
    "document.upload",
    "document.view",
    "document.download",
    "document.delete",
    "task.update",
    "reports.view",
  ],

  assistant: [
    "organization.view",
    "team.view",
    "client.view_assigned",
    "client.update",
    "document.upload",
    "document.view",
    "document.download",
    "task.update",
  ],

  customer: ["client.view_assigned", "document.view", "document.download"],
};

export function hasPermission(role: AppRole, permission: Permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: AppRole, permissions: Permission[]) {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function permissionsForRole(role: AppRole): Permission[] {
  return [...(ROLE_PERMISSIONS[role] || [])];
}

export function permissionGroups() {
  const groups = new Map<string, Permission[]>();
  for (const key of PERMISSIONS) {
    const group = PERMISSION_META[key].group;
    const list = groups.get(group) || [];
    list.push(key);
    groups.set(group, list);
  }
  return groups;
}
