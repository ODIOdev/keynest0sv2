import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { AgentManager } from "@/components/dashboard/AgentManager";
import { listAgents, listMedia } from "@/lib/db";

export default async function AgentsAdminPage() {
  return (
    <DashboardFrame title="Agents">
      <AgentManager
        agents={listAgents()}
        mediaUrls={listMedia().map((m) => m.url)}
      />
    </DashboardFrame>
  );
}
