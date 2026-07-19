/** Canonical auth route paths */
export const AUTH = {
  signIn: "/auth/sign-in",
  signUp: "/auth/sign-up",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  verifyEmail: "/auth/verify-email",
  invitation: "/auth/invitation",
  twoFactor: "/auth/two-factor",
  error: "/auth/error",
  callback: "/auth/callback",
} as const;

export type AuthPath = (typeof AUTH)[keyof typeof AUTH];
