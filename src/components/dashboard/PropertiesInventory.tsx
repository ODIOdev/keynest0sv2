"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { DashboardPropertyCard } from "@/components/dashboard/DashboardPropertyCard";
import { DeletePropertyButton } from "@/components/dashboard/DeleteButtons";
import {
  PropertyFilterToolbar,
  usePropertyFilters,
} from "@/components/site/PropertyFilterToolbar";
import { formatAddress, formatPrice } from "@/lib/format";
import { displayTagsForProperty } from "@/lib/property-tags";
import type { Category, Property, Tag } from "@/lib/types";

export function PropertiesInventory({
  properties,
  categories,
  tags,
}: {
  properties: Property[];
  categories: Category[];
  tags: Tag[];
}) {
  const filters = usePropertyFilters(properties);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) map.set(category.id, category.name);
    return map;
  }, [categories]);

  return (
    <div className="property-results-wrap">
      <PropertyFilterToolbar
        categories={categories}
        total={properties.length}
        filteredCount={filters.filtered.length}
        query={filters.query}
        onQueryChange={filters.setQuery}
        type={filters.type}
        onTypeChange={filters.setType}
        status={filters.status}
        onStatusChange={filters.setStatus}
        categoryId={filters.categoryId}
        onCategoryChange={filters.setCategoryId}
        view={filters.view}
        onViewChange={filters.setView}
        hasFilters={filters.hasFilters}
        onClear={filters.clearFilters}
        showStatus
        locationSuggestions={filters.locationSuggestions}
      />

      {filters.filtered.length === 0 ? (
        <p className="dash-empty">
          {filters.hasFilters
            ? "No properties match these filters."
            : "No properties yet. Add your first listing."}
        </p>
      ) : filters.view === "cards" ? (
        <div className="dash-property-grid">
          {filters.filtered.map((property) => (
            <DashboardPropertyCard
              key={property.id}
              property={property}
              tags={tags}
            />
          ))}
        </div>
      ) : (
        <div className="sheet-table-wrap">
          <table className="sheet-table dash-property-sheet">
            <thead>
              <tr>
                <th className="dash-property-sheet__col-thumb"> </th>
                <th>Title</th>
                <th>Tags</th>
                <th>Price</th>
                <th>Status</th>
                <th>Category</th>
                <th>Featured</th>
                <th>Location</th>
                <th className="sheet-table__col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filters.filtered.map((property) => {
                const price = formatPrice(property);
                const image =
                  property.images[0] || "/placeholder-property.jpg";
                const propertyTags = displayTagsForProperty(property, tags);
                return (
                  <tr key={property.id}>
                    <td className="dash-property-sheet__thumb">
                      <Image
                        src={image}
                        alt=""
                        width={48}
                        height={36}
                        className="dash-property-sheet__img"
                      />
                    </td>
                    <td>
                      <span className="sheet-table__name">{property.title}</span>
                    </td>
                    <td>
                      <div className="dash-property-sheet__tags">
                        {propertyTags.length > 0 ? (
                          propertyTags.map((tag) => (
                            <span
                              key={tag.id}
                              className="property-card__tag"
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))
                        ) : (
                          <span className="sheet-table__muted capitalize">
                            {property.listingType}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {price.amount}
                      {price.suffix ? (
                        <span className="sheet-table__muted">{price.suffix}</span>
                      ) : null}
                    </td>
                    <td>
                      <span className={`dash-badge dash-badge--${property.status}`}>
                        {property.status}
                      </span>
                    </td>
                    <td>
                      {property.categoryId &&
                      categoryNameById.get(property.categoryId) ? (
                        categoryNameById.get(property.categoryId)
                      ) : (
                        <span className="sheet-table__muted">—</span>
                      )}
                    </td>
                    <td>{property.featured ? "Yes" : "No"}</td>
                    <td className="sheet-table__muted">
                      {formatAddress(property)}
                    </td>
                    <td className="sheet-table__col-actions">
                      <div className="sheet-table__actions">
                        <Link
                          href={`/dashboard/properties/${property.id}`}
                          className="dash-property-card__btn"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/properties/${property.slug}`}
                          className="dash-property-card__btn dash-property-card__btn--ghost"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </Link>
                        <DeletePropertyButton
                          id={property.id}
                          className="dash-property-card__btn dash-property-card__btn--danger"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
