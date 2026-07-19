import { formatAddress } from "@/lib/format";
import type { Category, Property } from "@/lib/types";

export type MediaPropertyEntry = {
  id: string;
  title: string;
  address: string;
  slug: string;
  images: string[];
  imageCount: number;
  /** First listing photo for the card preview */
  preview: string;
};

export type MediaCategoryGroup = {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  propertyCount: number;
  imageCount: number;
  properties: MediaPropertyEntry[];
};

function toEntry(property: Property): MediaPropertyEntry {
  const images = property.images.filter(Boolean);
  return {
    id: property.id,
    title: property.title,
    address: formatAddress(property),
    slug: property.slug,
    images,
    imageCount: images.length,
    preview: images[0] || "/placeholder-property.jpg",
  };
}

/** One entry per listing, grouped under each property category. */
export function groupMediaByCategory(
  categories: Category[],
  properties: Property[],
): MediaCategoryGroup[] {
  const groups: MediaCategoryGroup[] = [];

  for (const category of categories) {
    const inCategory = properties.filter((p) => p.categoryId === category.id);
    const entries = inCategory.map(toEntry);
    groups.push({
      id: category.id,
      name: category.name,
      description: category.description,
      cover: category.image || undefined,
      propertyCount: entries.length,
      imageCount: entries.reduce((sum, p) => sum + p.imageCount, 0),
      properties: entries,
    });
  }

  const uncategorized = properties.filter((p) => !p.categoryId);
  if (uncategorized.length > 0) {
    const entries = uncategorized.map(toEntry);
    groups.push({
      id: "uncategorized",
      name: "Uncategorized",
      description: "Listings without a property type.",
      propertyCount: entries.length,
      imageCount: entries.reduce((sum, p) => sum + p.imageCount, 0),
      properties: entries,
    });
  }

  return groups;
}
