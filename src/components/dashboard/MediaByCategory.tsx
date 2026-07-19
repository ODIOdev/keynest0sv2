"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type {
  MediaCategoryGroup,
  MediaPropertyEntry,
} from "@/lib/media-by-category";

type MediaViewMode = "cards" | "list";

function ViewToggle({
  view,
  onViewChange,
}: {
  view: MediaViewMode;
  onViewChange: (value: MediaViewMode) => void;
}) {
  return (
    <div className="property-results__view" role="group" aria-label="View mode">
      <button
        type="button"
        className={`property-results__view-btn${view === "cards" ? " is-active" : ""}`}
        aria-pressed={view === "cards"}
        onClick={() => onViewChange("cards")}
      >
        Cards
      </button>
      <button
        type="button"
        className={`property-results__view-btn${view === "list" ? " is-active" : ""}`}
        aria-pressed={view === "list"}
        onClick={() => onViewChange("list")}
      >
        List
      </button>
    </div>
  );
}

function propertyImagesHref(propertyId: string) {
  return `/dashboard/properties/${propertyId}?from=media#listing-images`;
}

function PropertyMediaCard({ property }: { property: MediaPropertyEntry }) {
  const href = propertyImagesHref(property.id);
  const mosaic = property.images.slice(0, 4);

  return (
    <Link href={href} className="media-cat__prop media-cat__prop--link">
      <div
        className={`media-cat__prop-mosaic${mosaic.length > 1 ? ` media-cat__prop-mosaic--${Math.min(mosaic.length, 4)}` : ""}`}
      >
        {(mosaic.length > 0 ? mosaic : [property.preview]).map((url, i) => (
          <div key={`${property.id}-${i}`} className="media-cat__prop-cell">
            <Image
              src={url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 220px"
            />
          </div>
        ))}
        {property.imageCount > 4 ? (
          <span className="media-cat__prop-more">+{property.imageCount - 4}</span>
        ) : null}
      </div>
      <div className="media-cat__prop-meta">
        <p className="media-cat__prop-address" title={property.address}>
          {property.address || "No address"}
        </p>
        <p className="media-cat__prop-title">{property.title}</p>
        <p className="media-cat__prop-count">
          {property.imageCount}{" "}
          {property.imageCount === 1 ? "image" : "images"}
          <span className="media-cat__thumb-cta">Manage images</span>
        </p>
      </div>
    </Link>
  );
}

function PropertyMediaList({ properties }: { properties: MediaPropertyEntry[] }) {
  return (
    <div className="sheet-table-wrap media-cat__list">
      <table className="sheet-table">
        <thead>
          <tr>
            <th className="media-cat__col-thumb"> </th>
            <th>Address</th>
            <th>Listing</th>
            <th>Images</th>
            <th className="sheet-table__col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => {
            const href = propertyImagesHref(property.id);
            return (
              <tr key={property.id}>
                <td className="media-cat__list-thumb">
                  <Image
                    src={property.preview}
                    alt=""
                    width={48}
                    height={36}
                    className="media-cat__list-img"
                  />
                </td>
                <td>
                  <Link
                    href={href}
                    className="sheet-table__name media-cat__list-link"
                    title={property.address}
                  >
                    {property.address || "No address"}
                  </Link>
                </td>
                <td>
                  <Link href={href} className="media-cat__thumb-prop">
                    {property.title}
                  </Link>
                </td>
                <td>{property.imageCount}</td>
                <td className="sheet-table__col-actions">
                  <Link href={href} className="media-cat__manage-btn">
                    Manage images
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MediaSection({
  group,
  view,
  onViewChange,
}: {
  group: MediaCategoryGroup;
  view: MediaViewMode;
  onViewChange: (value: MediaViewMode) => void;
}) {
  const editHref =
    group.id !== "uncategorized"
      ? `/dashboard/categories/${group.id}`
      : undefined;

  return (
    <section className="media-cat__section dash-panel">
      <header className="media-cat__head">
        <div className="media-cat__head-copy">
          {group.cover ? (
            <div className="media-cat__cover">
              <Image
                src={group.cover}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          ) : null}
          <div>
            <h2 className="media-cat__title">{group.name}</h2>
            <p className="media-cat__sub">
              {group.propertyCount} listing
              {group.propertyCount === 1 ? "" : "s"}
              {" · "}
              {group.imageCount} image
              {group.imageCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="media-cat__head-actions">
          <ViewToggle view={view} onViewChange={onViewChange} />
          {editHref ? (
            <Link href={editHref} className="media-cat__edit">
              Edit type
            </Link>
          ) : null}
        </div>
      </header>

      {group.properties.length === 0 ? (
        <p className="media-cat__empty">
          No listings in this property type yet.
        </p>
      ) : view === "cards" ? (
        <div className="media-cat__grid">
          {group.properties.map((property) => (
            <PropertyMediaCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <PropertyMediaList properties={group.properties} />
      )}
    </section>
  );
}

export function MediaByCategory({ groups }: { groups: MediaCategoryGroup[] }) {
  const [view, setView] = useState<MediaViewMode>("cards");

  if (groups.length === 0) {
    return (
      <p className="dash-empty">
        No categories yet. Add a property type, then attach listing photos.
      </p>
    );
  }

  return (
    <div className="media-cat">
      {groups.map((group) => (
        <MediaSection
          key={group.id}
          group={group}
          view={view}
          onViewChange={setView}
        />
      ))}
    </div>
  );
}
