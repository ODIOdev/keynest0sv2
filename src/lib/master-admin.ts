/** Canonical credentials identity for the platform master admin. */
export const MASTER_ADMIN_EMAIL = "admin@keynestos.com";
export const MASTER_ADMIN_USERNAME = "admin";

export function resolveSignInEmail(identifier: string) {
  const value = identifier.trim();
  if (value.toLowerCase() === MASTER_ADMIN_USERNAME) {
    return MASTER_ADMIN_EMAIL;
  }
  return value;
}
