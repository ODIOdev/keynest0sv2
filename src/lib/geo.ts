import { formatPrice } from "@/lib/format";
import type { Property } from "@/lib/types";

export type MapPin = {
  id: string;
  slug: string;
  title: string;
  priceLabel: string;
  listingType: Property["listingType"];
  image: string;
  lat: number;
  lng: number;
};

/** Approximate city centers for map pins when explicit lat/lng are missing. */
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "new york": { lat: 40.758, lng: -73.9855 },
  "santa ana": { lat: 33.7455, lng: -117.8677 },
  inglewood: { lat: 33.9617, lng: -118.3531 },
  mesa: { lat: 33.4152, lng: -111.8315 },
  celina: { lat: 33.3248, lng: -96.7844 },
  "san jose": { lat: 37.3382, lng: -121.8863 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  miami: { lat: 25.7617, lng: -80.1918 },
  austin: { lat: 30.2672, lng: -97.7431 },
  denver: { lat: 39.7392, lng: -104.9903 },
};

function hashOffset(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const n = Math.abs(h);
  return {
    lat: ((n % 100) - 50) / 1200,
    lng: (((n / 100) | 0) % 100 - 50) / 1200,
  };
}

export function coordsForProperty(property: {
  id: string;
  city: string;
  lat?: number | null;
  lng?: number | null;
}): { lat: number; lng: number } | null {
  if (
    typeof property.lat === "number" &&
    typeof property.lng === "number" &&
    Number.isFinite(property.lat) &&
    Number.isFinite(property.lng)
  ) {
    return { lat: property.lat, lng: property.lng };
  }

  const base = CITY_COORDS[property.city.trim().toLowerCase()];
  if (!base) return null;
  const offset = hashOffset(property.id);
  return {
    lat: base.lat + offset.lat,
    lng: base.lng + offset.lng,
  };
}

export function propertiesToPins(properties: Property[]): MapPin[] {
  return properties
    .map((property) => {
      const coords = coordsForProperty(property);
      if (!coords) return null;
      const price = formatPrice(property);
      return {
        id: property.id,
        slug: property.slug,
        title: property.title,
        priceLabel: `${price.amount}${price.suffix}`,
        listingType: property.listingType,
        image: property.images[0] || "/placeholder-property.jpg",
        lat: coords.lat,
        lng: coords.lng,
      };
    })
    .filter((p): p is MapPin => Boolean(p));
}
