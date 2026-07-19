import { canInviteTeam, getTeamContext } from "@/lib/team-data";
import {
  TeamEmptyState,
  TeamInviteForm,
} from "@/components/dashboard/TeamPanels";

export const metadata = { title: "Invite · Team" };

export default async function TeamInvitePage() {
  const team = await getTeamContext();
  if (!team) return <TeamEmptyState />;

  return (
    <TeamInviteForm
      orgId={team.org.id}
      canInvite={canInviteTeam(team.membership.role)}
    />
  );
}
