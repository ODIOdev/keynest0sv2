import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import type { AppRole, Membership, Organization, Profile } from "@/lib/auth-types";
import { hasPermission } from "@/lib/permissions";

export type TeamMember = Membership & {
  kn_profiles: Pick<Profile, "id" | "email" | "full_name" | "avatar_url"> | null;
};

export type TeamInvite = {
  id: string;
  org_id: string;
  email: string;
  role: AppRole;
  token: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
};

export type TeamContext = {
  org: Organization;
  membership: Membership;
  members: TeamMember[];
  invites: TeamInvite[];
};

export async function getTeamContext(): Promise<TeamContext | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("kn_memberships")
    .select("*, kn_organizations(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership?.kn_organizations) return null;

  const org = membership.kn_organizations as Organization;
  const { data: members } = await supabase
    .from("kn_memberships")
    .select("*, kn_profiles(id, email, full_name, avatar_url)")
    .eq("org_id", org.id)
    .order("created_at", { ascending: true });

  const { data: invites } = await supabase
    .from("kn_invitations")
    .select("*")
    .eq("org_id", org.id)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  const { kn_organizations: _org, ...memberRow } = membership;

  return {
    org,
    membership: memberRow as Membership,
    members: (members as TeamMember[]) || [],
    invites: (invites as TeamInvite[]) || [],
  };
}

export function canManageTeam(role: AppRole) {
  return (
    hasPermission(role, "team.invite") ||
    hasPermission(role, "team.update") ||
    hasPermission(role, "team.remove")
  );
}

export function canInviteTeam(role: AppRole) {
  return hasPermission(role, "team.invite");
}

export function canUpdateTeam(role: AppRole) {
  return hasPermission(role, "team.update");
}

export function canRemoveTeam(role: AppRole) {
  return hasPermission(role, "team.remove");
}
