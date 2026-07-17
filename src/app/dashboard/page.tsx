import Link from "next/link";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { getDashboardStats, listLeads, listProperties } from "@/lib/db";

export default async function DashboardHomePage() {
  const stats = getDashboardStats();
  const leads = listLeads().slice(0, 5);
  const properties = listProperties().slice(0, 5);

  return (
    <DashboardFrame title="CRM Overview">
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Properties", value: stats.properties },
          { label: "Published", value: stats.published },
          { label: "New leads", value: stats.newLeads },
          { label: "Media assets", value: stats.media },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl bg-white p-5">
            <p className="text-sm text-[#758696]">{item.label}</p>
            <p className="text-3xl font-semibold text-[#0c0407]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent leads</h2>
            <Link href="/dashboard/leads" className="text-sm underline">
              View all
            </Link>
          </div>
          <ul className="space-y-3">
            {leads.map((lead) => (
              <li key={lead.id} className="border-b border-[#eee] pb-3 text-sm">
                <p className="font-medium text-[#0c0407]">{lead.name}</p>
                <p className="text-[#758696]">{lead.message}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Latest listings</h2>
            <Link href="/dashboard/properties" className="text-sm underline">
              Manage
            </Link>
          </div>
          <ul className="space-y-3">
            {properties.map((property) => (
              <li key={property.id} className="border-b border-[#eee] pb-3 text-sm">
                <p className="font-medium text-[#0c0407]">{property.title}</p>
                <p className="text-[#758696]">
                  {property.status} · {property.listingType}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardFrame>
  );
}
