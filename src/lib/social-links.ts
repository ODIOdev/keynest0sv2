import type { ProfileSocialLink } from "@/lib/auth-types";

/** Resolve a social handle/URL to an absolute profile link. */
export function socialProfileUrl(platform: string, handle: string): string | null {
  const raw = handle.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;

  const cleaned = raw.replace(/^@/, "").replace(/^\/+/, "");
  if (!cleaned) return null;

  const key = platform.trim().toLowerCase();
  switch (key) {
    case "instagram":
      return `https://www.instagram.com/${cleaned}/`;
    case "facebook":
      return `https://www.facebook.com/${cleaned}`;
    case "x":
    case "twitter":
      return `https://x.com/${cleaned}`;
    case "linkedin":
      return cleaned.includes("/")
        ? `https://www.linkedin.com/${cleaned.replace(/^\/+/, "")}`
        : `https://www.linkedin.com/in/${cleaned}`;
    case "tiktok":
      return `https://www.tiktok.com/@${cleaned}`;
    case "youtube":
      return cleaned.startsWith("c/") || cleaned.startsWith("channel/") || cleaned.startsWith("@")
        ? `https://www.youtube.com/${cleaned.replace(/^@/, "@")}`
        : `https://www.youtube.com/@${cleaned}`;
    default:
      return raw.includes(".") ? `https://${cleaned}` : null;
  }
}

export function normalizeSiteSocialLinks(
  value: unknown,
): ProfileSocialLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is ProfileSocialLink =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as ProfileSocialLink).platform === "string" &&
        typeof (item as ProfileSocialLink).handle === "string",
    )
    .map((item) => ({
      id:
        typeof item.id === "string" && item.id
          ? item.id
          : `social-${item.platform}-${item.handle}`,
      platform: item.platform.trim() || "Other",
      handle: item.handle.trim(),
    }))
    .filter((item) => item.handle.length > 0);
}
