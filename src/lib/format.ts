import type { Property } from "./types";

export function formatPrice(property: Pick<Property, "price" | "listingType">) {
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  if (property.listingType === "rent") {
    return { amount, suffix: "/month" };
  }
  return { amount, suffix: "" };
}

export function formatAddress(
  property: Pick<Property, "address" | "city" | "state">,
) {
  return `${property.address}, ${property.city}, ${property.state}`;
}
