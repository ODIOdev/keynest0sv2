import { getUser } from "@/lib/auth";
import { getTeamContext } from "@/lib/team-data";
import {
  TeamEmptyState,
  TeamOverview,
} from "@/components/dashboard/TeamPanels";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const user = await getUser();
  const team = await getTeamContext();
  if (!team || !user) return <TeamEmptyState />;

  return (
    <TeamOverview
      orgName={team.org.name}
      memberCount={team.members.length}
      pendingInvites={team.invites.length}
      yourRole={team.membership.role}
      rolesInUse={new Set(team.members.map((m) => m.role)).size}
    />
  );
}
