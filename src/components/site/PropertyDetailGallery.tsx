"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

type PropertyDetailGalleryProps = {
  images: string[];
  title: string;
};

export function PropertyDetailGallery({
  images,
  title,
}: PropertyDetailGalleryProps) {
  const photos = images.length > 0 ? images : ["/placeholder-property.jpg"];
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const openAt = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, prev, next]);

  const side = photos.slice(1, 5);
  const remaining = Math.max(0, photos.length - 5);

  return (
    <>
      <div className="pdp-gallery">
        <button
          type="button"
          className="pdp-gallery__hero"
          onClick={() => openAt(0)}
          aria-label={`View photo 1 of ${photos.length}`}
        >
          <Image
            src={photos[0]}
            alt={title}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 66vw"
            className="pdp-gallery__img"
          />
        </button>

        {side.length > 0 ? (
          <div className="pdp-gallery__side">
            {side.map((src, i) => {
              const photoIndex = i + 1;
              const isLast = i === side.length - 1 && remaining > 0;
              return (
                <button
                  key={`${src}-${photoIndex}`}
                  type="button"
                  className="pdp-gallery__tile"
                  onClick={() => openAt(photoIndex)}
                  aria-label={
                    isLast
                      ? `See all ${photos.length} photos`
                      : `View photo ${photoIndex + 1} of ${photos.length}`
                  }
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 50vw, 20vw"
                    className="pdp-gallery__img"
                  />
                  {isLast ? (
                    <span className="pdp-gallery__more">
                      See all {photos.length} photos
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}

        <button
          type="button"
          className="pdp-gallery__all"
          onClick={() => openAt(0)}
        >
          See all {photos.length} photos
        </button>
      </div>

      {mounted && open
        ? createPortal(
            <div className="pdp-lightbox" role="presentation">
              <button
                type="button"
                className="pdp-lightbox__backdrop"
                aria-label="Close photos"
                onClick={close}
              />
              <div
                className="pdp-lightbox__panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
              >
                <header className="pdp-lightbox__bar">
                  <p id={titleId} className="pdp-lightbox__count">
                    {index + 1} / {photos.length}
                  </p>
                  <button
                    type="button"
                    className="pdp-lightbox__close"
                    onClick={close}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </header>
                <div className="pdp-lightbox__stage">
                  {photos.length > 1 ? (
                    <button
                      type="button"
                      className="pdp-lightbox__nav pdp-lightbox__nav--prev"
                      onClick={prev}
                      aria-label="Previous photo"
                    >
                      ‹
                    </button>
                  ) : null}
                  <div className="pdp-lightbox__frame">
                    <Image
                      src={photos[index]}
                      alt={`${title} — photo ${index + 1}`}
                      fill
                      sizes="100vw"
                      className="pdp-gallery__img"
                      priority
                    />
                  </div>
                  {photos.length > 1 ? (
                    <button
                      type="button"
                      className="pdp-lightbox__nav pdp-lightbox__nav--next"
                      onClick={next}
                      aria-label="Next photo"
                    >
                      ›
                    </button>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
