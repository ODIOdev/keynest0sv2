import type { ListingType, Property, Tag } from "@/lib/types";

const LISTING_TAG_NAMES = new Set(["buy", "rent", "sell"]);

export function isListingTypeTag(tag: Pick<Tag, "name">) {
  return LISTING_TAG_NAMES.has(tag.name.trim().toLowerCase());
}

/** Prefer the Rent/Buy platform tag that matches listing type. */
export function listingTypeTag(
  property: Pick<Property, "listingType">,
  tags: Tag[],
): Tag | null {
  const wanted = property.listingType === "rent" ? "rent" : "buy";
  return (
    tags.find((t) => t.name.trim().toLowerCase() === wanted) ||
    (wanted === "buy"
      ? tags.find((t) => t.name.trim().toLowerCase() === "sell")
      : null) ||
    null
  );
}

/** Extra labels editors can toggle (excludes Buy/Rent/Sell). */
export function assignablePlatformTags(allTags: Tag[]) {
  return allTags.filter((tag) => !isListingTypeTag(tag));
}

/**
 * Keep Buy/Rent in sync with listing type and drop the opposite listing tag.
 */
export function syncListingTypeTagIds(
  tagIds: string[],
  listingType: ListingType,
  allTags: Tag[],
): string[] {
  const listing = listingTypeTag({ listingType }, allTags);
  const withoutListing = tagIds.filter((id) => {
    const tag = allTags.find((t) => t.id === id);
    return !tag || !isListingTypeTag(tag);
  });
  return listing ? [listing.id, ...withoutListing] : withoutListing;
}

/** Platform tags shown on property cards (listing type first, then assigned). */
export function displayTagsForProperty(
  property: Pick<Property, "listingType" | "tagIds">,
  allTags: Tag[],
): Tag[] {
  const listing = listingTypeTag(property, allTags);
  const assigned = allTags.filter(
    (tag) =>
      (property.tagIds || []).includes(tag.id) &&
      tag.id !== listing?.id &&
      !isListingTypeTag(tag),
  );
  return [...(listing ? [listing] : []), ...assigned];
}
