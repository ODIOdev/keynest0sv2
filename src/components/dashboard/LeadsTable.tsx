"use client";

import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/types";

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();

  async function updateStatus(id: string, status: Lead["status"]) {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (leads.length === 0) {
    return (
      <div className="dash-panel dash-panel--pad">
        <p className="dash-empty">No leads yet. New inquiries will show up here.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Lead</th>
            <th>Message</th>
            <th>Status</th>
            <th>Source</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <div className="font-medium text-[var(--dash-ink,#0c0407)]">
                  {lead.name}
                </div>
                <div className="text-sm text-[var(--dash-muted,#64748b)]">
                  {lead.email}
                </div>
                <div className="text-sm text-[var(--dash-muted,#64748b)]">
                  {lead.phone}
                </div>
              </td>
              <td className="max-w-xs text-[var(--dash-muted,#64748b)]">
                {lead.message}
              </td>
              <td>
                <select
                  className="rounded-lg border border-[var(--dash-border,#e2e8f0)] bg-white px-2 py-1.5 text-sm"
                  value={lead.status}
                  onChange={(e) =>
                    updateStatus(lead.id, e.target.value as Lead["status"])
                  }
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="closed">Closed</option>
                  <option value="lost">Lost</option>
                </select>
              </td>
              <td>
                <span className="dash-badge">{lead.source}</span>
              </td>
              <td>
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() => remove(lead.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
