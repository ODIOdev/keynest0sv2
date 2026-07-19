"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Agent } from "@/lib/types";
import { DeleteAgentButton } from "@/components/dashboard/DeleteButtons";

export function AgentManager({
  agents,
  mediaUrls,
}: {
  agents: Agent[];
  mediaUrls: string[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    bio: "",
    image: "",
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", title: "", email: "", phone: "", bio: "", image: "" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={onSubmit} className="dash-panel dash-panel--pad space-y-3">
        <h2 className="dash-panel__title">Add agent</h2>
        {(
          [
            ["name", "Name"],
            ["title", "Title"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["image", "Image URL"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="field">
            <span>{label}</span>
            <input
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={key === "name"}
            />
          </label>
        ))}
        <label className="field">
          <span>Bio</span>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </label>
        {mediaUrls.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {mediaUrls.map((url) => (
              <button
                key={url}
                type="button"
                className="rounded-lg border border-[var(--dash-border,#e2e8f0)] px-2 py-1 text-xs text-[var(--dash-muted,#64748b)]"
                onClick={() => setForm({ ...form, image: url })}
              >
                Use {url.split("/").pop()}
              </button>
            ))}
          </div>
        ) : null}
        <button className="btn-primary" type="submit">
          Save agent
        </button>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Title</th>
              <th>Contact</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id}>
                <td className="font-medium">{agent.name}</td>
                <td>{agent.title}</td>
                <td>
                  <div>{agent.email}</div>
                  <div className="text-sm text-[var(--dash-muted,#64748b)]">
                    {agent.phone}
                  </div>
                </td>
                <td>
                  <DeleteAgentButton id={agent.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
