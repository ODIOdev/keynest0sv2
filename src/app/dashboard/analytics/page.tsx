import Link from "next/link";
import { AnalyticsBoard } from "@/components/dashboard/AnalyticsBoard";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { getSiteAnalytics } from "@/lib/site-analytics";

export default async function DashboardAnalyticsPage() {
  const analytics = getSiteAnalytics();

  return (
    <DashboardFrame
      title="Analytics"
      description="Infographic pulse of web engagement, CRM conversion, and listing health — with tools to act next."
      action={
        <div className="dash-actions">
          <Link href="/dashboard/leads" className="btn-secondary">
            Leads
          </Link>
          <Link href="/dashboard/properties" className="btn-primary">
            Properties
          </Link>
        </div>
      }
    >
      <AnalyticsBoard data={analytics} />
    </DashboardFrame>
  );
}
