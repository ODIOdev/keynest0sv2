"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlacesAutocompleteInput,
  type PlaceSelection,
} from "@/components/site/PlacesAutocompleteInput";
import {
  isListingTypeTag,
  syncListingTypeTagIds,
} from "@/lib/property-tags";
import { normalizeUsState, US_STATES } from "@/lib/us-states";
import type { Agent, Category, ListingType, Property, Tag } from "@/lib/types";

type Props = {
  property?: Property | null;
  categories: Category[];
  agents: Agent[];
  tags: Tag[];
};

const empty = {
  title: "",
  description: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  price: "",
  listingType: "rent" as ListingType,
  categoryId: "",
  tagIds: [] as string[],
  bedrooms: "3",
  bathrooms: "2",
  parking: "1",
  sqft: "1200",
  images: [] as string[],
  featured: true,
  status: "published",
  agentId: "",
  lat: "" as string,
  lng: "" as string,
};

export function PropertyForm({
  property,
  categories,
  agents,
  tags,
}: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const initial = useMemo(() => {
    if (!property) {
      return {
        ...empty,
        tagIds: syncListingTypeTagIds([], empty.listingType, tags),
      };
    }
    return {
      title: property.title,
      description: property.description,
      address: property.address,
      city: property.city,
      state: normalizeUsState(property.state),
      zip: property.zip || "",
      price: String(property.price),
      listingType: property.listingType,
      categoryId: property.categoryId || "",
      tagIds: syncListingTypeTagIds(
        property.tagIds || [],
        property.listingType,
        tags,
      ),
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      parking: String(property.parking),
      sqft: String(property.sqft),
      images: [...property.images],
      featured: property.featured,
      status: property.status,
      agentId: property.agentId || "",
      lat:
        property.lat != null && Number.isFinite(property.lat)
          ? String(property.lat)
          : "",
      lng:
        property.lng != null && Number.isFinite(property.lng)
          ? String(property.lng)
          : "",
    };
  }, [property, tags]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setListingType(next: ListingType) {
    setForm((prev) => ({
      ...prev,
      listingType: next,
      tagIds: syncListingTypeTagIds(prev.tagIds, next, tags),
    }));
  }

  function onPlaceSelect(place: PlaceSelection | null) {
    if (!place) {
      setForm((prev) => ({ ...prev, lat: "", lng: "" }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      address: place.street || place.label,
      city: place.city || prev.city,
      state: place.state ? normalizeUsState(place.state) : prev.state,
      zip: place.zip || prev.zip,
      lat: String(place.lat),
      lng: String(place.lng),
    }));
  }

  function toggleTag(id: string) {
    const tag = tags.find((t) => t.id === id);
    if (tag && isListingTypeTag(tag)) {
      const name = tag.name.trim().toLowerCase();
      setListingType(name === "rent" ? "rent" : "sell");
      return;
    }

    setForm((prev) => {
      const nextIds = prev.tagIds.includes(id)
        ? prev.tagIds.filter((t) => t !== id)
        : [...prev.tagIds, id];
      return {
        ...prev,
        tagIds: syncListingTypeTagIds(
          nextIds,
          prev.listingType as ListingType,
          tags,
        ),
      };
    });
  }

  function setPriceFromInput(raw: string) {
    const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    set("price", digits);
  }

  function formatPriceDisplay(value: string) {
    if (!value) return "";
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    return new Intl.NumberFormat("en-US").format(n);
  }

  function removeImage(url: string) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== url),
    }));
  }

  function moveImage(url: string, dir: -1 | 1) {
    setForm((prev) => {
      const index = prev.images.indexOf(url);
      if (index < 0) return prev;
      const next = index + dir;
      if (next < 0 || next >= prev.images.length) return prev;
      const images = [...prev.images];
      const [item] = images.splice(index, 1);
      images.splice(next, 0, item);
      return { ...prev, images };
    });
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;

    setUploading(true);
    setUploadError("");
    const uploaded: string[] = [];

    for (const file of list) {
      const data = new FormData();
      data.append("file", file);
      data.append("alt", file.name.replace(/\.[^.]+$/, ""));
      const res = await fetch("/api/upload", { method: "POST", body: data });
      if (!res.ok) {
        setUploadError("One or more uploads failed");
        continue;
      }
      const asset = (await res.json()) as { url?: string };
      if (asset.url) uploaded.push(asset.url);
    }

    if (uploaded.length) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploaded],
      }));
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const latNum = Number(form.lat);
    const lngNum = Number(form.lng);
    const payload = {
      id: property?.id,
      title: form.title,
      description: form.description,
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
      price: Number(form.price),
      listingType: form.listingType,
      categoryId: form.categoryId || null,
      tagIds: syncListingTypeTagIds(
        form.tagIds,
        form.listingType as ListingType,
        tags,
      ),
      lat: form.lat !== "" && Number.isFinite(latNum) ? latNum : null,
      lng: form.lng !== "" && Number.isFinite(lngNum) ? lngNum : null,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      parking: Number(form.parking),
      sqft: Number(form.sqft),
      images: form.images,
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

  const submitLabel = saving
    ? "Saving..."
    : property
      ? "Update property"
      : "Publish property";

  return (
    <form
      id="kn-property-form"
      onSubmit={onSubmit}
      className="dash-panel dash-panel--pad space-y-5"
    >
      <div className="property-form__top">
        <div className="property-form__top-fields">
          <label className="field">
            <span>Title</span>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={6}
            />
          </label>
        </div>

        <div id="listing-images" className="property-form__images-card">
          <div className="property-form__images-head">
            <span>Listing images</span>
            <span className="property-form__images-count">
              {form.images.length}{" "}
              {form.images.length === 1 ? "photo" : "photos"}
            </span>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) void uploadFiles(e.target.files);
            }}
          />

          <button
            type="button"
            className={`property-form__drop${dragging ? " is-dragging" : ""}`}
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (e.dataTransfer.files?.length) {
                void uploadFiles(e.dataTransfer.files);
              }
            }}
          >
            <strong>{uploading ? "Uploading…" : "Upload images"}</strong>
            <span>Drop multiple photos here, or click to browse</span>
          </button>

          {form.images.length > 0 ? (
            <ul className="property-form__thumbs">
              {form.images.map((url, index) => (
                <li key={`${url}-${index}`} className="property-form__thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" />
                  {index === 0 ? (
                    <span className="property-form__thumb-badge">Cover</span>
                  ) : null}
                  <div className="property-form__thumb-actions">
                    <button
                      type="button"
                      aria-label="Move earlier"
                      disabled={index === 0}
                      onClick={() => moveImage(url, -1)}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      aria-label="Move later"
                      disabled={index === form.images.length - 1}
                      onClick={() => moveImage(url, 1)}
                    >
                      ›
                    </button>
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() => removeImage(url)}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="property-form__images-empty">
              No images yet. Upload photos to show on the listing.
            </p>
          )}

          {uploadError ? (
            <p className="text-sm text-red-600">{uploadError}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="field">
          <span>Address</span>
          <PlacesAutocompleteInput
            value={form.address}
            onChange={(value) => set("address", value)}
            onPlaceSelect={onPlaceSelect}
            autoComplete="off"
            placeholder="Start typing an address…"
          />
        </label>
        <label className="field">
          <span>City</span>
          <input value={form.city} onChange={(e) => set("city", e.target.value)} />
        </label>
        <label className="field">
          <span>State</span>
          <select
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
            autoComplete="address-level1"
          >
            <option value="">Select state</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
            {form.state &&
            !US_STATES.some((s) => s.value === form.state) ? (
              <option value={form.state}>{form.state}</option>
            ) : null}
          </select>
        </label>
        <label className="field">
          <span>ZIP</span>
          <input
            value={form.zip}
            onChange={(e) => set("zip", e.target.value)}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="ZIP code"
          />
        </label>
        <label className="field">
          <span>Price</span>
          <div className="field-money">
            <span className="field-money__prefix" aria-hidden>
              $
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              required
              placeholder="0"
              value={formatPriceDisplay(form.price)}
              onChange={(e) => setPriceFromInput(e.target.value)}
              aria-label="Price in dollars"
            />
          </div>
        </label>
        <label className="field">
          <span>Listing type</span>
          <select
            value={form.listingType}
            onChange={(e) => setListingType(e.target.value as ListingType)}
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
        <div className="field md:col-span-2">
          <span>Platform tags</span>
          <p className="property-form__tags-hint">
            Selected tags appear on cards and detail pages. Buy/Rent stays in
            sync with listing type.
          </p>
          {tags.length === 0 ? (
            <p className="dash-empty">
              No tags yet. Create them on Categories.
            </p>
          ) : (
            <div
              className="property-form__tags"
              role="group"
              aria-label="Platform tags"
            >
              {tags.map((tag) => {
                const active = form.tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`property-form__tag${active ? " is-active" : ""}`}
                    style={
                      active
                        ? {
                            backgroundColor: tag.color,
                            borderColor: tag.color,
                          }
                        : undefined
                    }
                    aria-pressed={active}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />
          Featured on homepage
        </label>
      </div>
      {error ? (
        <p className="property-form__error text-sm text-red-600">{error}</p>
      ) : null}
      <div className="property-form__actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={saving || uploading}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
