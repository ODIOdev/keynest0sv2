"use client";

import { FormEvent, useRef, useState } from "react";
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [image, setImage] = useState(category?.image || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function uploadImage(file: File) {
    setUploading(true);
    setUploadError("");
    const data = new FormData();
    data.append("file", file);
    data.append("alt", name || file.name);
    const res = await fetch("/api/upload", { method: "POST", body: data });
    setUploading(false);
    if (!res.ok) {
      setUploadError("Upload failed. Try another image.");
      return;
    }
    const asset = await res.json();
    setImage(asset.url);
    router.refresh();
  }

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
    <form onSubmit={onSubmit} className="dash-panel dash-panel--pad cat-form">
      <div className="cat-form__layout">
        <div className="cat-form__fields">
          <label className="field">
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>

        <div className="field cat-form__upload">
          <span>Cover image</span>
          <div className="cat-upload">
            {image ? (
              <div className="cat-upload__preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" />
              </div>
            ) : (
              <div className="cat-upload__empty">No image yet</div>
            )}
            <div className="cat-upload__actions">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadImage(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className="btn-secondary"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? "Uploading…" : "Upload image"}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving || uploading}
              >
                {saving
                  ? "Saving..."
                  : category
                    ? "Update category"
                    : "Create category"}
              </button>
              {image ? (
                <button
                  type="button"
                  className="cat-upload__remove"
                  onClick={() => setImage("")}
                  aria-label="Remove image"
                  title="Remove image"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : null}
            </div>
            {uploadError ? (
              <p className="text-sm text-red-600">{uploadError}</p>
            ) : null}
          </div>
        </div>
      </div>

      {mediaUrls.length > 0 ? (
        <div className="field">
          <span>Pick from media library</span>
          <div className="cat-upload__library">
            {mediaUrls.map((url) => (
              <button
                key={url}
                type="button"
                className={`cat-upload__thumb${image === url ? " is-active" : ""}`}
                onClick={() => setImage(url)}
                title={url}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}
