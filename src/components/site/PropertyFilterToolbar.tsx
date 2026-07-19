"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  InventoryLocationInput,
  locationSuggestionsFromProperties,
} from "@/components/site/InventoryLocationInput";
import {
  buildPropertiesHref,
  typeFilterFromParam,
} from "@/lib/listing-params";
import type { Category, Property } from "@/lib/types";

export type PropertyViewMode = "cards" | "list";
export type PropertyTypeFilter = "all" | Property["listingType"];
export type PropertyStatusFilter = "all" | Property["status"];

export type PropertyFilterState = {
  query: string;
  type: PropertyTypeFilter;
  status: PropertyStatusFilter;
  categoryId: string;
  view: PropertyViewMode;
};

export function usePropertyFilters(properties: Property[]) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<PropertyTypeFilter>("all");
  const [status, setStatus] = useState<PropertyStatusFilter>("all");
  const [categoryId, setCategoryId] = useState("all");
  const [view, setView] = useState<PropertyViewMode>("cards");

  const locationSuggestions = useMemo(
    () => locationSuggestionsFromProperties(properties),
    [properties],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter((property) => {
      if (type !== "all" && property.listingType !== type) return false;
      if (status !== "all" && property.status !== status) return false;
      if (categoryId === "none" && property.categoryId) return false;
      if (
        categoryId !== "all" &&
        categoryId !== "none" &&
        property.categoryId !== categoryId
      ) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        property.title,
        property.address,
        property.city,
        property.state,
        property.slug,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [properties, query, type, status, categoryId]);

  const hasFilters =
    query.trim() !== "" ||
    type !== "all" ||
    status !== "all" ||
    categoryId !== "all";

  function clearFilters() {
    setQuery("");
    setType("all");
    setStatus("all");
    setCategoryId("all");
  }

  return {
    query,
    setQuery,
    type,
    setType,
    status,
    setStatus,
    categoryId,
    setCategoryId,
    view,
    setView,
    filtered,
    hasFilters,
    clearFilters,
    locationSuggestions,
  };
}

/** Same as usePropertyFilters, but Type mirrors platform `?type=` (Buy=sell, Rent=rent). */
export function usePropertyFiltersSynced(properties: Property[]) {
  const filters = usePropertyFilters(properties);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    filters.setType(typeFilterFromParam(searchParams.get("type")));
    // Only re-sync when the URL type changes — not when setType identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [searchParams]);

  function setType(next: PropertyTypeFilter) {
    filters.setType(next);
    if (pathname !== "/properties") return;
    const href = buildPropertiesHref(searchParams, {
      type: next === "all" ? null : next,
    });
    router.replace(href, { scroll: false });
  }

  function clearFilters() {
    filters.setQuery("");
    setType("all");
    filters.setStatus("all");
    filters.setCategoryId("all");
  }

  return {
    ...filters,
    setType,
    clearFilters,
  };
}

type PropertyFilterToolbarProps = {
  categories: Category[];
  locationSuggestions: string[];
  total: number;
  filteredCount: number;
  query: string;
  onQueryChange: (value: string) => void;
  type: PropertyTypeFilter;
  onTypeChange: (value: PropertyTypeFilter) => void;
  status: PropertyStatusFilter;
  onStatusChange: (value: PropertyStatusFilter) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  view: PropertyViewMode;
  onViewChange: (value: PropertyViewMode) => void;
  hasFilters: boolean;
  onClear: () => void;
  /** Hide status when the result set is already status-scoped (e.g. published only) */
  showStatus?: boolean;
  showViewToggle?: boolean;
  emptyLabel?: string;
  className?: string;
};

export function PropertyFilterToolbar({
  categories,
  locationSuggestions,
  total,
  filteredCount,
  query,
  onQueryChange,
  type,
  onTypeChange,
  status,
  onStatusChange,
  categoryId,
  onCategoryChange,
  view,
  onViewChange,
  hasFilters,
  onClear,
  showStatus = true,
  showViewToggle = true,
  className = "",
}: PropertyFilterToolbarProps) {
  return (
    <div className={`property-results ${className}`.trim()}>
      <div className="property-results__toolbar">
        <label className="property-results__search">
          <span className="sr-only">Search properties</span>
          <InventoryLocationInput
            value={query}
            onChange={onQueryChange}
            suggestions={locationSuggestions}
            placeholder="Search saved addresses…"
          />
        </label>

        <div className="property-results__filters">
          <label>
            <span>Type</span>
            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value as PropertyTypeFilter)}
            >
              <option value="all">All</option>
              <option value="sell">Buy</option>
              <option value="rent">Rent</option>
            </select>
          </label>
          {showStatus ? (
            <label>
              <span>Status</span>
              <select
                value={status}
                onChange={(e) =>
                  onStatusChange(e.target.value as PropertyStatusFilter)
                }
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </label>
          ) : null}
          <label className="property-results__filter--wide">
            <span>Category</span>
            <select
              value={categoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <option value="all">All</option>
              <option value="none">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {showViewToggle ? (
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
        ) : null}
      </div>

      <div className="property-results__meta">
        <p>
          {filteredCount} of {total} {total === 1 ? "property" : "properties"}
        </p>
        {hasFilters ? (
          <button type="button" className="property-results__clear" onClick={onClear}>
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}
