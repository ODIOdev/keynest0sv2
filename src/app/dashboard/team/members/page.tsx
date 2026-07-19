import { getUser } from "@/lib/auth";
import {
  canInviteTeam,
  canRemoveTeam,
  canUpdateTeam,
  getTeamContext,
} from "@/lib/team-data";
import {
  TeamEmptyState,
  TeamMembersPanel,
} from "@/components/dashboard/TeamPanels";

export const metadata = { title: "Members · Team" };

export default async function TeamMembersPage() {
  const user = await getUser();
  const team = await getTeamContext();
  if (!team || !user) return <TeamEmptyState />;

  return (
    <TeamMembersPanel
      members={team.members}
      invites={team.invites}
      currentUserId={user.id}
      canInvite={canInviteTeam(team.membership.role)}
      canUpdate={canUpdateTeam(team.membership.role)}
      canRemove={canRemoveTeam(team.membership.role)}
    />
  );
}
