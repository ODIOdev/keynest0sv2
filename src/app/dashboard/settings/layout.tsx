import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { SettingsNav } from "@/components/dashboard/SettingsNav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardFrame
      title="Settings"
      description="Profile, security, sessions, and notification preferences."
    >
      <div className="settings-layout">
        <SettingsNav />
        <div className="settings-layout__content">{children}</div>
      </div>
    </DashboardFrame>
  );
}
