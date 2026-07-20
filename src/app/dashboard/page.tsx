import Link from "next/link";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { OverviewBoard } from "@/components/dashboard/OverviewBoard";
import { listLeads, listProperties } from "@/lib/db";
import { getSiteAnalytics } from "@/lib/site-analytics";

export default async function DashboardHomePage() {
  const analytics = getSiteAnalytics();
  const leads = listLeads().slice(0, 6);
  const properties = listProperties().slice(0, 6);

  return (
    <DashboardFrame
      title="Overview"
      description="Infographic pulse of inventory, pipeline, and what to act on next."
      action={
        <div className="dash-actions">
          <Link href="/dashboard/analytics" className="btn-secondary">
            Analytics
          </Link>
          <Link href="/dashboard/properties/new" className="btn-primary">
            Add property
          </Link>
        </div>
      }
    >
      <OverviewBoard
        data={analytics}
        recentLeads={leads}
        recentProperties={properties}
      />
    </DashboardFrame>
  );
}
