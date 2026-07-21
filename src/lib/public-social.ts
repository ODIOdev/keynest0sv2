import { cache } from "react";
import { createServiceClient } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/db";
import { normalizeSiteSocialLinks } from "@/lib/social-links";
import type { ProfileSocialLink } from "@/lib/auth-types";

/**
 * Public footer social links.
 * Prefers org branding (persisted in Supabase), then the org owner profile,
 * then local site settings (dev / in-memory fallback).
 */
export const getPublicSocialLinks = cache(async (): Promise<ProfileSocialLink[]> => {
  const fromSettings = normalizeSiteSocialLinks(getSettings().socialLinks);

  try {
    const admin = createServiceClient();
    const { data: org } = await admin
      .from("kn_organizations")
      .select("owner_id, branding")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (org) {
      const branding =
        org.branding && typeof org.branding === "object"
          ? (org.branding as Record<string, unknown>)
          : {};
      const fromBranding = normalizeSiteSocialLinks(branding.socialLinks);
      if (fromBranding.length > 0) return fromBranding;

      if (org.owner_id) {
        const { data: profile } = await admin
          .from("kn_profiles")
          .select("social_links")
          .eq("id", org.owner_id)
          .maybeSingle();
        const fromOwner = normalizeSiteSocialLinks(profile?.social_links);
        if (fromOwner.length > 0) return fromOwner;
      }
    }

    // Any profile with social links (solo / no owner set).
    const { data: profiles } = await admin
      .from("kn_profiles")
      .select("social_links")
      .order("updated_at", { ascending: false })
      .limit(50);

    for (const row of profiles ?? []) {
      const links = normalizeSiteSocialLinks(row.social_links);
      if (links.length > 0) return links;
    }
  } catch {
    // Missing service role or offline — fall through to local settings.
  }

  return fromSettings;
});
