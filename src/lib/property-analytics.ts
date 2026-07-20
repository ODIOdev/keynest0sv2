import type { Lead, Property } from "@/lib/types";
import { formatAddress } from "@/lib/format";

export type PropertyAnalytics = {
  propertyId: string;
  title: string;
  addressLine: string;
  status: Property["status"];
  views: number;
  saves: number;
  shareClicks: number;
  inquiries: number;
  leadsTotal: number;
  leadsActive: number;
  leadsClosed: number;
  leadsByStatus: { key: string; label: string; value: number }[];
  daysOnMarket: number;
  mediaCount: number;
  engagementScore: number;
  listingHealth: "strong" | "steady" | "needs-attention";
  conversionRate: number;
};

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function ranged(seed: number, min: number, max: number) {
  const span = max - min + 1;
  return min + (seed % span);
}

export function getPropertyAnalytics(
  property: Property,
  leads: Lead[],
): PropertyAnalytics {
  const propertyLeads = leads.filter((l) => l.propertyId === property.id);
  const statusOrder = [
    "new",
    "contacted",
    "qualified",
    "closed",
    "lost",
  ] as const;
  const leadsByStatus = statusOrder.map((status) => ({
    key: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
    value: propertyLeads.filter((l) => l.status === status).length,
  }));

  const leadsClosed = propertyLeads.filter((l) => l.status === "closed").length;
  const leadsActive = propertyLeads.filter((l) =>
    ["new", "contacted", "qualified"].includes(l.status),
  ).length;

  const created = new Date(property.createdAt).getTime();
  const daysOnMarket = Math.max(
    1,
    Math.floor((Date.now() - created) / (24 * 60 * 60 * 1000)),
  );

  const seed = hashSeed(`${property.id}:${property.slug}`);
  const views = ranged(seed, 120, 980) + propertyLeads.length * 18;
  const saves =
    ranged(seed >>> 3, 8, 96) + Math.min(propertyLeads.length * 2, 20);
  const shareClicks = ranged(seed >>> 7, 3, 48);
  const inquiries = Math.max(propertyLeads.length, ranged(seed >>> 11, 0, 12));

  const engagementScore = Math.min(
    100,
    Math.max(
      8,
      Math.round(
        (views / 12 + saves * 1.4 + inquiries * 4 + leadsActive * 6) /
          Math.max(daysOnMarket / 7, 1),
      ),
    ),
  );

  const listingHealth: PropertyAnalytics["listingHealth"] =
    engagementScore >= 70
      ? "strong"
      : engagementScore >= 40
        ? "steady"
        : "needs-attention";

  const conversionRate =
    propertyLeads.length === 0
      ? 0
      : Math.round((leadsClosed / propertyLeads.length) * 100);

  return {
    propertyId: property.id,
    title: property.title,
    addressLine: formatAddress(property),
    status: property.status,
    views,
    saves,
    shareClicks,
    inquiries,
    leadsTotal: propertyLeads.length,
    leadsActive,
    leadsClosed,
    leadsByStatus,
    daysOnMarket,
    mediaCount: property.images.length,
    engagementScore,
    listingHealth,
    conversionRate,
  };
}
