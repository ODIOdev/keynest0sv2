"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Agent, Category, Property } from "@/lib/types";

type Props = {
  property?: Property | null;
  categories: Category[];
  agents: Agent[];
  mediaUrls: string[];
};

const empty = {
  title: "",
  description: "",
  address: "",
  city: "",
  state: "",
  price: "",
  listingType: "rent",
  categoryId: "",
  bedrooms: "3",
  bathrooms: "2",
  parking: "1",
  sqft: "1200",
  images: "",
  featured: true,
  status: "published",
  agentId: "",
};

export function PropertyForm({ property, categories, agents, mediaUrls }: Props) {
  const router = useRouter();
  const initial = useMemo(() => {
    if (!property) return empty;
    return {
      title: property.title,
      description: property.description,
      address: property.address,
      city: property.city,
      state: property.state,
      price: String(property.price),
      listingType: property.listingType,
      categoryId: property.categoryId || "",
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      parking: String(property.parking),
      sqft: String(property.sqft),
      images: property.images.join("\n"),
      featured: property.featured,
      status: property.status,
      agentId: property.agentId || "",
    };
  }, [property]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      id: property?.id,
      title: form.title,
      description: form.description,
      address: form.address,
      city: form.city,
      state: form.state,
      price: Number(form.price),
      listingType: form.listingType,
      categoryId: form.categoryId || null,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      parking: Number(form.parking),
      sqft: Number(form.sqft),
      images: form.images
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      featured: form.featured,
      status: form.status,
      agentId: form.agentId || null,
    };

    const res = await fetch("/api/properties", {
      method: property ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not save property");
      return;
    }
    router.push("/dashboard/properties");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="field md:col-span-2">
          <span>Title</span>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
        </label>
        <label className="field md:col-span-2">
          <span>Description</span>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Address</span>
          <input value={form.address} onChange={(e) => set("address", e.target.value)} />
        </label>
        <label className="field">
          <span>City</span>
          <input value={form.city} onChange={(e) => set("city", e.target.value)} />
        </label>
        <label className="field">
          <span>State</span>
          <input value={form.state} onChange={(e) => set("state", e.target.value)} />
        </label>
        <label className="field">
          <span>Price</span>
          <input
            type="number"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Listing type</span>
          <select
            value={form.listingType}
            onChange={(e) => set("listingType", e.target.value)}
          >
            <option value="rent">Rent</option>
            <option value="sell">Sell</option>
          </select>
        </label>
        <label className="field">
          <span>Category</span>
          <select
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Agent</span>
          <select value={form.agentId} onChange={(e) => set("agentId", e.target.value)}>
            <option value="">Unassigned</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>
        </label>
        <label className="field">
          <span>Bedrooms</span>
          <input
            type="number"
            value={form.bedrooms}
            onChange={(e) => set("bedrooms", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Bathrooms</span>
          <input
            type="number"
            value={form.bathrooms}
            onChange={(e) => set("bathrooms", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Parking</span>
          <input
            type="number"
            value={form.parking}
            onChange={(e) => set("parking", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Sqft</span>
          <input
            type="number"
            value={form.sqft}
            onChange={(e) => set("sqft", e.target.value)}
          />
        </label>
        <label className="field md:col-span-2">
          <span>Image URLs (one per line)</span>
          <textarea
            value={form.images}
            onChange={(e) => set("images", e.target.value)}
            placeholder="/uploads/photo.jpg"
          />
        </label>
        {mediaUrls.length > 0 ? (
          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium">Insert uploaded image</p>
            <div className="flex flex-wrap gap-2">
              {mediaUrls.map((url) => (
                <button
                  key={url}
                  type="button"
                  className="rounded-lg border border-[#e8e8e8] px-3 py-1.5 text-xs"
                  onClick={() =>
                    set(
                      "images",
                      form.images ? `${form.images}\n${url}` : url,
                    )
                  }
                >
                  {url}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          Featured on homepage
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="btn-primary" disabled={saving}>
        {saving ? "Saving..." : property ? "Update property" : "Publish property"}
      </button>
    </form>
  );
}
