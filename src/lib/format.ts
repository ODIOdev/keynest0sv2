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
  property: Pick<Property, "address" | "city" | "state" | "zip">,
) {
  const cityState = [property.city, property.state].filter(Boolean).join(", ");
  const region = [cityState, property.zip].filter(Boolean).join(" ");
  return [property.address, region].filter(Boolean).join(", ");
}

/** Formats US phone input as (555) 000-0000 while typing. */
export function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Keep only digits for money inputs (no leading zeros). */
export function parseMoneyDigits(raw: string, maxDigits = 12) {
  return raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, maxDigits);
}

/** Display money digits with US thousands separators (no currency symbol). */
export function formatMoneyDigits(value: string) {
  if (!value) return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("en-US").format(n);
}
