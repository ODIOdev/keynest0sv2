/** Listing type URL param ↔ search UI mode */

export type SearchListingMode = "buy" | "rent" | "sell";

/** Map `?type=` to the results toolbar filter (All / Buy / Rent). */
export function typeFilterFromParam(
  type: string | null | undefined,
): "all" | "sell" | "rent" {
  if (type === "rent") return "rent";
  if (type === "sell") return "sell";
  return "all";
}

/** Map `?type=` to the Buy/Rent search tab. Missing type → buy (browse-all default). */
export function modeFromTypeParam(
  type: string | null | undefined,
): Exclude<SearchListingMode, "sell"> {
  return type === "rent" ? "rent" : "buy";
}

/** Map Buy/Rent tab → `?type=` value used by the properties page. */
export function typeParamFromMode(
  mode: Exclude<SearchListingMode, "sell">,
): "sell" | "rent" {
  return mode === "rent" ? "rent" : "sell";
}

/**
 * Build a `/properties` href, merging patch into current query.
 * Pass `type: null` to clear the listing-type filter (Listings / all).
 */
export function buildPropertiesHref(
  current: URLSearchParams | string,
  patch: {
    type?: "sell" | "rent" | null;
    clearFilters?: boolean;
  } = {},
): string {
  const params = new URLSearchParams(
    typeof current === "string" ? current : current.toString(),
  );

  if (patch.type === null) {
    params.delete("type");
  } else if (patch.type === "sell" || patch.type === "rent") {
    params.set("type", patch.type);
  }

  if (patch.clearFilters) {
    params.delete("beds");
    params.delete("baths");
    params.delete("sqft");
    params.delete("psf");
  }

  const query = params.toString();
  return query ? `/properties?${query}` : "/properties";
}

/** Static nav hrefs when not already on a properties search URL. */
export function propertiesNavHref(
  kind: "all" | "buy" | "rent",
): string {
  if (kind === "buy") return "/properties?type=sell";
  if (kind === "rent") return "/properties?type=rent";
  return "/properties";
}

export function navKindFromHref(href: string): "all" | "buy" | "rent" | null {
  if (!href.startsWith("/properties")) return null;
  const query = href.includes("?") ? href.slice(href.indexOf("?") + 1) : "";
  const type = new URLSearchParams(query).get("type");
  if (type === "sell") return "buy";
  if (type === "rent") return "rent";
  if (!query || !type) {
    // Bare /properties or /properties without type
    const path = href.split("?")[0];
    if (path === "/properties") return "all";
  }
  return null;
}
