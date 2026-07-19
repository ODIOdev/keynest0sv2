"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteMediaButton } from "@/components/dashboard/DeleteButtons";
import type { MediaAsset } from "@/lib/types";

export function MediaUploader({ recent }: { recent: MediaAsset[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [dragging, setDragging] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  function pickFile(next: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    if (!next) {
      setFile(null);
      setPreview("");
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setStatus("");
  }

  function onDropFiles(files: FileList | null) {
    const next = files?.[0];
    if (!next || !next.type.startsWith("image/")) return;
    pickFile(next);
  }

  async function onUpload() {
    if (!file) return;
    setUploading(true);
    setStatus("Uploading…");
    const data = new FormData();
    data.append("file", file);
    data.append("alt", file.name.replace(/\.[^.]+$/, ""));
    const res = await fetch("/api/upload", { method: "POST", body: data });
    setUploading(false);
    if (!res.ok) {
      setStatus("Upload failed");
      return;
    }
    pickFile(null);
    if (fileRef.current) fileRef.current.value = "";
    setStatus("Uploaded");
    router.refresh();
  }

  const updateNav = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(max > 4 && el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateNav();
    el.addEventListener("scroll", updateNav, { passive: true });
    const ro = new ResizeObserver(updateNav);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateNav);
      ro.disconnect();
    };
  }, [updateNav, recent]);

  function scrollByDir(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".media-recent__card");
    const step = card ? card.offsetWidth + 12 : el.clientWidth * 0.75;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  const showNav = recent.length > 0 && (canPrev || canNext);

  return (
    <div className="dash-panel dash-panel--pad media-uploader">
      <h2 className="dash-panel__title">Upload images</h2>

      <div className="media-uploader__layout">
        <div className="media-uploader__box">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              pickFile(e.target.files?.[0] ?? null);
            }}
          />

          <div
            className={`media-uploader__drop${dragging ? " is-dragging" : ""}${preview ? " has-preview" : ""}`}
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
              onDropFiles(e.dataTransfer.files);
            }}
          >
            {preview ? (
              <button
                type="button"
                className="media-uploader__preview"
                onClick={() => fileRef.current?.click()}
                aria-label="Change image"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="" />
              </button>
            ) : (
              <button
                type="button"
                className="media-uploader__empty"
                onClick={() => fileRef.current?.click()}
              >
                <span className="media-uploader__empty-title">Choose an image</span>
                <span className="media-uploader__empty-hint">
                  Click to browse or drop a file here
                </span>
              </button>
            )}
          </div>

          <div className="media-uploader__actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {preview ? "Change image" : "Browse"}
            </button>
            {preview ? (
              <button
                type="button"
                className="cat-upload__remove"
                onClick={() => {
                  pickFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                aria-label="Remove image"
                title="Remove image"
                disabled={uploading}
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
            <button
              type="button"
              className="btn-primary"
              disabled={!file || uploading}
              onClick={() => void onUpload()}
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>

        <div className="media-recent">
          <div className="media-recent__head">
            <h3 className="media-recent__title">Recent uploads</h3>
            {showNav ? (
              <div className="media-recent__nav">
                <button
                  type="button"
                  className="media-recent__nav-btn"
                  aria-label="Previous uploads"
                  disabled={!canPrev}
                  onClick={() => scrollByDir(-1)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M15 6l-6 6 6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="media-recent__nav-btn"
                  aria-label="Next uploads"
                  disabled={!canNext}
                  onClick={() => scrollByDir(1)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ) : null}
          </div>

          {recent.length === 0 ? (
            <div className="media-recent__empty">No uploads yet</div>
          ) : (
            <div ref={trackRef} className="media-recent__track">
              {recent.map((asset) => (
                <article key={asset.id} className="media-recent__card">
                  <div className="media-recent__thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt={asset.alt || asset.filename} />
                  </div>
                  <div className="media-recent__meta">
                    <p className="media-recent__name" title={asset.filename}>
                      {asset.filename}
                    </p>
                    <DeleteMediaButton id={asset.id} variant="icon" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {status ? <p className="dash-empty">{status}</p> : null}
    </div>
  );
}
