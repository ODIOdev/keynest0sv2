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
      <form onSubmit={onSubmit} className="space-y-3 rounded-3xl bg-white p-5">
        <h2 className="text-lg font-semibold">Add agent</h2>
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
                className="rounded-lg border px-2 py-1 text-xs"
                onClick={() => setForm({ ...form, image: url })}
              >
                Use {url}
              </button>
            ))}
          </div>
        ) : null}
        <button className="btn-primary" type="submit">
          Save agent
        </button>
      </form>

      <div className="overflow-x-auto rounded-3xl bg-white">
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
                <td>{agent.name}</td>
                <td>{agent.title}</td>
                <td>
                  <div>{agent.email}</div>
                  <div>{agent.phone}</div>
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
