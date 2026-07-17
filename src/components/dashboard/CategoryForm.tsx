"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";

export function CategoryForm({
  category,
  mediaUrls,
}: {
  category?: Category | null;
  mediaUrls: string[];
}) {
  const router = useRouter();
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [image, setImage] = useState(category?.image || "");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/categories", {
      method: category ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: category?.id,
        name,
        description,
        image,
      }),
    });
    setSaving(false);
    router.push("/dashboard/categories");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl bg-white p-6">
      <label className="field">
        <span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="field">
        <span>Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className="field">
        <span>Image URL</span>
        <input value={image} onChange={(e) => setImage(e.target.value)} />
      </label>
      {mediaUrls.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {mediaUrls.map((url) => (
            <button
              key={url}
              type="button"
              className="rounded-lg border px-3 py-1.5 text-xs"
              onClick={() => setImage(url)}
            >
              Use {url}
            </button>
          ))}
        </div>
      ) : null}
      <button className="btn-primary" disabled={saving}>
        {saving ? "Saving..." : category ? "Update category" : "Create category"}
      </button>
    </form>
  );
}
