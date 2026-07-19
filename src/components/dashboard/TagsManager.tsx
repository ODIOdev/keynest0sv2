"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatAddress, formatPrice } from "@/lib/format";
import type { Property, Tag } from "@/lib/types";

const COLORS = [
  "#1e3a5f",
  "#0ea5e9",
  "#0f766e",
  "#b45309",
  "#be123c",
  "#6d28d9",
  "#334155",
];

export function TagsManager({
  tags,
  properties,
}: {
  tags: Tag[];
  properties: Property[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedTag = useMemo(
    () => tags.find((t) => t.id === selectedTagId) ?? null,
    [tags, selectedTagId],
  );

  const matchedProperties = useMemo(() => {
    if (!selectedTagId) return [];
    return properties.filter((p) => (p.tagIds || []).includes(selectedTagId));
  }, [properties, selectedTagId]);

  function openAdd() {
    setEditingId(null);
    setName("");
    setDescription("");
    setColor(COLORS[0]);
    setError("");
    setAdding(true);
  }

  function openEdit(tag: Tag) {
    setAdding(false);
    setEditingId(tag.id);
    setName(tag.name);
    setDescription(tag.description);
    setColor(tag.color || COLORS[0]);
    setError("");
  }

  function cancel() {
    setAdding(false);
    setEditingId(null);
    setError("");
  }

  function selectTag(tag: Tag) {
    setSelectedTagId((prev) => (prev === tag.id ? null : tag.id));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      name: name.trim(),
      description: description.trim(),
      color,
      ...(editingId ? { id: editingId } : {}),
    };

    const res = await fetch("/api/tags", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      setError("Could not save tag. Try again.");
      return;
    }
    cancel();
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this tag?")) return;
    await fetch(`/api/tags?id=${id}`, { method: "DELETE" });
    if (editingId === id) cancel();
    if (selectedTagId === id) setSelectedTagId(null);
    router.refresh();
  }

  return (
    <div className="tags-manager">
      <div className="tags-manager__toolbar">
        <button type="button" className="btn-primary" onClick={openAdd}>
          Add tag
        </button>
        <div
          className="tags-manager__count"
          aria-label={`${tags.length} platform tags`}
        >
          <span className="tags-manager__count-value">{tags.length}</span>
          <span className="tags-manager__count-label">
            {tags.length === 1 ? "tag" : "tags"}
          </span>
        </div>
      </div>

      {(adding || editingId) && (
        <form className="tags-manager__form" onSubmit={onSubmit}>
          <div className="tags-manager__form-grid">
            <label className="field">
              <span>Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Waterfront"
                required
                autoFocus
              />
            </label>
            <label className="field">
              <span>Color</span>
              <div className="tags-manager__swatches">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`tags-manager__swatch${color === c ? " is-active" : ""}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </label>
            <label className="field tags-manager__span-2">
              <span>Description</span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional note about when to use this tag"
              />
            </label>
          </div>
          <div className="tags-manager__form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Create tag"}
            </button>
            <button type="button" className="btn-secondary" onClick={cancel}>
              Cancel
            </button>
            {error ? <p className="tags-manager__error">{error}</p> : null}
          </div>
        </form>
      )}

      <div className="sheet-table-wrap">
        <table className="sheet-table">
          <thead>
            <tr>
              <th className="sheet-table__col-color">Color</th>
              <th>Tag</th>
              <th>Description</th>
              <th>Updated</th>
              <th className="sheet-table__col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.length === 0 ? (
              <tr className="sheet-table__empty">
                <td colSpan={5}>No tags yet. Click Add tag to create one.</td>
              </tr>
            ) : (
              tags.map((tag) => {
                const selected = selectedTagId === tag.id;
                const count = properties.filter((p) =>
                  (p.tagIds || []).includes(tag.id),
                ).length;
                return (
                  <tr
                    key={tag.id}
                    className={selected ? "tags-manager__row is-selected" : undefined}
                  >
                    <td>
                      <span
                        className="tags-manager__dot"
                        style={{ background: tag.color }}
                        aria-hidden
                      />
                    </td>
                    <td className="sheet-table__name">
                      <button
                        type="button"
                        className="tags-manager__tag-btn"
                        onClick={() => selectTag(tag)}
                        aria-pressed={selected}
                      >
                        {tag.name}
                        <span className="tags-manager__tag-btn-count">
                          {count}
                        </span>
                      </button>
                    </td>
                    <td className="sheet-table__muted">
                      {tag.description || "—"}
                    </td>
                    <td className="sheet-table__muted">
                      {new Date(tag.updatedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="sheet-table__actions">
                        <button
                          type="button"
                          className="sheet-table__icon-btn"
                          onClick={() => openEdit(tag)}
                          aria-label={`Edit ${tag.name}`}
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path
                              d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="sheet-table__icon-btn sheet-table__icon-btn--danger"
                          onClick={() => remove(tag.id)}
                          aria-label={`Delete ${tag.name}`}
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path
                              d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                              stroke="currentColor"
                              strokeWidth="1.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedTag ? (
        <div className="tags-manager__results" aria-live="polite">
          <div className="tags-manager__results-head">
            <div>
              <p className="tags-manager__results-kicker">Tagged listings</p>
              <h3 className="tags-manager__results-title">
                <span
                  className="tags-manager__results-swatch"
                  style={{ background: selectedTag.color }}
                  aria-hidden
                />
                {selectedTag.name}
                <span className="tags-manager__results-meta">
                  {matchedProperties.length}{" "}
                  {matchedProperties.length === 1 ? "listing" : "listings"}
                </span>
              </h3>
            </div>
            <button
              type="button"
              className="tags-manager__results-clear"
              onClick={() => setSelectedTagId(null)}
            >
              Clear
            </button>
          </div>

          {matchedProperties.length === 0 ? (
            <p className="tags-manager__results-empty">
              No listings use this tag yet.
            </p>
          ) : (
            <ul className="tags-manager__results-list">
              {matchedProperties.map((property) => {
                const price = formatPrice(property);
                const image =
                  property.images[0] || "/placeholder-property.jpg";
                return (
                  <li key={property.id}>
                    <Link
                      href={`/dashboard/properties/${property.id}`}
                      className="tags-manager__result"
                    >
                      <span className="tags-manager__result-thumb">
                        <Image
                          src={image}
                          alt=""
                          width={56}
                          height={42}
                          className="tags-manager__result-img"
                        />
                      </span>
                      <span className="tags-manager__result-copy">
                        <span className="tags-manager__result-name">
                          {property.title}
                        </span>
                        <span className="tags-manager__result-address">
                          {formatAddress(property)}
                        </span>
                      </span>
                      <span className="tags-manager__result-price">
                        {price.amount}
                        {price.suffix ? (
                          <span className="tags-manager__result-suffix">
                            {price.suffix}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
