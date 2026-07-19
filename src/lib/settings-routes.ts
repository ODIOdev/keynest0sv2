export const SETTINGS = {
  root: "/dashboard/settings",
  profile: "/dashboard/settings/profile",
  security: "/dashboard/settings/security",
  password: "/dashboard/settings/password",
  twoFactor: "/dashboard/settings/two-factor",
  sessions: "/dashboard/settings/sessions",
  notifications: "/dashboard/settings/notifications",
} as const;

export const SETTINGS_NAV = [
  { href: SETTINGS.profile, label: "Profile", hint: "Name and contact" },
  { href: SETTINGS.security, label: "Security", hint: "Account protection" },
  { href: SETTINGS.password, label: "Password", hint: "Change password" },
  { href: SETTINGS.twoFactor, label: "Two-factor", hint: "Authenticator app" },
  { href: SETTINGS.sessions, label: "Sessions", hint: "Signed-in devices" },
  {
    href: SETTINGS.notifications,
    label: "Notifications",
    hint: "Email alerts",
  },
] as const;
