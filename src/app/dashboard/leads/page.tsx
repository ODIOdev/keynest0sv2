import Link from "next/link";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { listLeads } from "@/lib/db";

export default async function LeadsPage() {
  const leads = listLeads();

  return (
    <DashboardFrame
      title="Leads CRM"
      action={
        <Link href="/" className="btn-secondary">
          Website contact form feeds here
        </Link>
      }
    >
      <LeadsTable leads={leads} />
    </DashboardFrame>
  );
}
