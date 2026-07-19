"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Category } from "@/lib/types";

export function HomeCategoryCarousel({ categories }: { categories: Category[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const overflow = max > 4;
    setCanPrev(overflow && el.scrollLeft > 4);
    setCanNext(overflow && el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update, categories.length]);

  function scrollByDir(dir: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".home-cat-card");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  if (categories.length === 0) return null;

  const fill = categories.length <= 3;

  return (
    <div
      className={`home-cat-carousel${fill ? " home-cat-carousel--fill" : " home-cat-carousel--scroll"}`}
    >
      <button
        type="button"
        className="home-cat-carousel__nav home-cat-carousel__nav--prev"
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

      <div ref={trackRef} className="home-cat-carousel__track">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/properties?category=${category.slug}`}
            className="home-cat-card group"
          >
            <div className="home-cat-card__media">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 80vw, 33vw"
              />
              <div className="home-cat-card__shade" aria-hidden />
              <div className="home-cat-card__copy">
                <h3 className="home-cat-card__title">{category.name}</h3>
                <p className="home-cat-card__desc">{category.description}</p>
                <span className="home-cat-card__cta">Explore Now</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="home-cat-carousel__nav home-cat-carousel__nav--next"
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
    </div>
  );
}
