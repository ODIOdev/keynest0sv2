import { NextResponse } from "next/server";
import { getProfile, isAuthenticated } from "@/lib/auth";
import { updateSettings } from "@/lib/db";
import { normalizeSiteSocialLinks } from "@/lib/social-links";
import { createClient } from "@/lib/supabase/server";
import { getTeamContext } from "@/lib/team-data";

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { socialLinks?: unknown };
  const socialLinks = normalizeSiteSocialLinks(body.socialLinks);

  const settings = updateSettings({ socialLinks });

  // Also mirror into org branding for durable public footer reads.
  const team = await getTeamContext();
  if (team?.org) {
    const branding =
      team.org.branding && typeof team.org.branding === "object"
        ? { ...team.org.branding }
        : {};
    const supabase = await createClient();
    await supabase
      .from("kn_organizations")
      .update({ branding: { ...branding, socialLinks } })
      .eq("id", team.org.id);
  } else {
    // Keep profile as source of truth when there is no org yet.
    const profile = await getProfile();
    if (profile) {
      const supabase = await createClient();
      await supabase
        .from("kn_profiles")
        .update({ social_links: socialLinks })
        .eq("id", profile.id);
    }
  }

  return NextResponse.json(settings);
}
