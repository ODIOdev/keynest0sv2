import type { ReactNode } from "react";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { TeamNav } from "@/components/dashboard/TeamNav";

export default function TeamLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardFrame
      title="Team"
      description="Members, invites, roles, and permission matrix."
    >
      <div className="settings-layout">
        <TeamNav />
        <div className="settings-layout__content">{children}</div>
      </div>
    </DashboardFrame>
  );
}
