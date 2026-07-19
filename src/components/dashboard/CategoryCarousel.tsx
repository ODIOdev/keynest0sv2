"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteCategoryButton } from "@/components/dashboard/DeleteButtons";
import type { Category } from "@/lib/types";

export function CategoryCarousel({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const scrollable = categories.length > 3;
  const trackRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(categories);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const dragIdRef = useRef<string | null>(null);

  useEffect(() => {
    setItems(categories);
  }, [categories]);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el || !scrollable) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, [scrollable]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !scrollable) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update, items, scrollable]);

  function scrollByDir(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".cat-tile");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  function onDragStart(e: React.DragEvent<HTMLElement>, id: string) {
    const target = e.target as HTMLElement;
    if (target.closest("a, button, .cat-tile__actions")) {
      e.preventDefault();
      return;
    }
    dragIdRef.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }

  function onDragOver(e: React.DragEvent<HTMLElement>, id: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overId !== id) setOverId(id);
  }

  function onDragLeave(e: React.DragEvent<HTMLElement>, id: string) {
    if (overId === id) setOverId(null);
  }

  async function persistOrder(next: Category[]) {
    setItems(next);
    await fetch("/api/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: next.map((c) => c.id) }),
    });
    router.refresh();
  }

  function onDrop(e: React.DragEvent<HTMLElement>, targetId: string) {
    e.preventDefault();
    const sourceId = dragIdRef.current || e.dataTransfer.getData("text/plain");
    setDraggingId(null);
    setOverId(null);
    dragIdRef.current = null;
    if (!sourceId || sourceId === targetId) return;

    const from = items.findIndex((c) => c.id === sourceId);
    const to = items.findIndex((c) => c.id === targetId);
    if (from < 0 || to < 0) return;

    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    void persistOrder(next);
  }

  function onDragEnd() {
    setDraggingId(null);
    setOverId(null);
    dragIdRef.current = null;
  }

  return (
    <div
      className={`cat-carousel${scrollable ? " cat-carousel--scroll" : " cat-carousel--fill"}`}
    >
      {scrollable ? (
        <button
          type="button"
          className="cat-carousel__nav cat-carousel__nav--prev"
          aria-label="Previous categories"
          disabled={!canPrev}
          onClick={() => scrollByDir(-1)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}

      <div ref={trackRef} className="cat-carousel__track">
        {items.map((category) => (
          <article
            key={category.id}
            className={`cat-tile${draggingId === category.id ? " is-dragging" : ""}${
              overId === category.id && draggingId !== category.id
                ? " is-drag-over"
                : ""
            }`}
            draggable
            onDragStart={(e) => onDragStart(e, category.id)}
            onDragOver={(e) => onDragOver(e, category.id)}
            onDragLeave={(e) => onDragLeave(e, category.id)}
            onDrop={(e) => onDrop(e, category.id)}
            onDragEnd={onDragEnd}
          >
            <div className="cat-tile__media">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 900px) 90vw, 33vw"
                  draggable={false}
                />
              ) : (
                <div className="cat-tile__placeholder" aria-hidden />
              )}
              <div className="cat-tile__shade" aria-hidden />
              <span
                className="cat-tile__grip"
                title="Drag to reorder"
                aria-hidden
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="8" cy="7" r="1.6" />
                  <circle cx="12" cy="7" r="1.6" />
                  <circle cx="16" cy="7" r="1.6" />
                  <circle cx="8" cy="12" r="1.6" />
                  <circle cx="12" cy="12" r="1.6" />
                  <circle cx="16" cy="12" r="1.6" />
                  <circle cx="8" cy="17" r="1.6" />
                  <circle cx="12" cy="17" r="1.6" />
                  <circle cx="16" cy="17" r="1.6" />
                </svg>
              </span>
              <div className="cat-tile__overlay">
                <h3 className="cat-tile__name">{category.name}</h3>
                <p className="cat-tile__desc">
                  {category.description || "No description"}
                </p>
              </div>
            </div>
            <div className="cat-tile__bar">
              <span className="cat-tile__slug">/{category.slug}</span>
              <div className="cat-tile__actions">
                <Link
                  href={`/dashboard/categories/${category.id}`}
                  className="cat-tile__btn"
                >
                  Edit
                </Link>
                <DeleteCategoryButton id={category.id} />
              </div>
            </div>
          </article>
        ))}
      </div>

      {scrollable ? (
        <button
          type="button"
          className="cat-carousel__nav cat-carousel__nav--next"
          aria-label="Next categories"
          disabled={!canNext}
          onClick={() => scrollByDir(1)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
