"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useMemo } from "react";
import { PropertyCard } from "@/components/site/PropertyCard";
import {
  PropertyFilterToolbar,
  usePropertyFilters,
  usePropertyFiltersSynced,
} from "@/components/site/PropertyFilterToolbar";
import { formatAddress, formatPrice } from "@/lib/format";
import { displayTagsForProperty } from "@/lib/property-tags";
import type { Category, Property, Tag } from "@/lib/types";

type PropertyResultsProps = {
  properties: Property[];
  categories: Category[];
  tags: Tag[];
  showStatus?: boolean;
  showViewToggle?: boolean;
  emptyMessage?: string;
  /** Sync Type with platform `?type=` (Buy / Rent). Use on /properties. */
  syncUrlType?: boolean;
};

export function PropertyResults(props: PropertyResultsProps) {
  if (props.syncUrlType) {
    return (
      <Suspense
        fallback={
          <PropertyResultsInner {...props} syncUrlType={false} />
        }
      >
        <PropertyResultsSynced {...props} />
      </Suspense>
    );
  }
  return <PropertyResultsInner {...props} />;
}

function PropertyResultsSynced(props: PropertyResultsProps) {
  const filters = usePropertyFiltersSynced(props.properties);
  return <PropertyResultsView {...props} filters={filters} />;
}

function PropertyResultsInner(props: PropertyResultsProps) {
  const filters = usePropertyFilters(props.properties);
  return <PropertyResultsView {...props} filters={filters} />;
}

function PropertyResultsView({
  properties,
  categories,
  tags,
  showStatus = false,
  showViewToggle = true,
  emptyMessage = "No properties matched your search.",
  filters,
}: PropertyResultsProps & {
  filters: ReturnType<typeof usePropertyFilters>;
}) {
  const view = showViewToggle ? filters.view : "cards";

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
        view={view}
        onViewChange={filters.setView}
        hasFilters={filters.hasFilters}
        onClear={filters.clearFilters}
        showStatus={showStatus}
        showViewToggle={showViewToggle}
        locationSuggestions={filters.locationSuggestions}
      />

      {filters.filtered.length === 0 ? (
        <p className="property-results__empty">
          {filters.hasFilters
            ? "No properties match these filters."
            : emptyMessage}
        </p>
      ) : view === "cards" ? (
        <div className="property-results__grid">
          {filters.filtered.map((property) => (
            <PropertyCard key={property.id} property={property} tags={tags} />
          ))}
        </div>
      ) : (
        <div className="sheet-table-wrap">
          <table className="sheet-table property-results-sheet">
            <thead>
              <tr>
                <th className="dash-property-sheet__col-thumb"> </th>
                <th>Title</th>
                <th>Tags</th>
                <th>Price</th>
                <th>Category</th>
                <th>Location</th>
                <th className="sheet-table__col-actions"> </th>
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
                      <Link
                        href={`/properties/${property.slug}`}
                        className="sheet-table__name"
                      >
                        {property.title}
                      </Link>
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
                            {property.listingType === "rent" ? "Rent" : "Buy"}
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
                      {property.categoryId &&
                      categoryNameById.get(property.categoryId) ? (
                        categoryNameById.get(property.categoryId)
                      ) : (
                        <span className="sheet-table__muted">—</span>
                      )}
                    </td>
                    <td className="sheet-table__muted">
                      {formatAddress(property)}
                    </td>
                    <td className="sheet-table__col-actions">
                      <Link
                        href={`/properties/${property.slug}`}
                        className="dash-property-card__btn"
                      >
                        View
                      </Link>
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
