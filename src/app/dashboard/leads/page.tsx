import Link from "next/link";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { listLeads } from "@/lib/db";

export default async function LeadsPage() {
  const leads = listLeads();

  return (
    <DashboardFrame
      title="Leads"
      description="Track inquiries from contact, sell, and property pages."
      action={
        <Link href="/contact" className="btn-secondary">
          Public contact form
        </Link>
      }
    >
      <LeadsTable leads={leads} />
    </DashboardFrame>
  );
}
