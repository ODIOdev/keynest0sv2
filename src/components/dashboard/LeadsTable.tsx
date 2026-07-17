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

  return (
    <div className="overflow-x-auto rounded-3xl bg-white">
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
                <div className="font-medium text-[#0c0407]">{lead.name}</div>
                <div className="text-[#758696]">{lead.email}</div>
                <div className="text-[#758696]">{lead.phone}</div>
              </td>
              <td className="max-w-xs">{lead.message}</td>
              <td>
                <select
                  className="rounded-lg border border-[#e8e8e8] px-2 py-1"
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
              <td>{lead.source}</td>
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
