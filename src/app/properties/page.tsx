import Link from "next/link";
import { PropertyCard } from "@/components/site/PropertyCard";
import { SiteFooter, SiteHeader } from "@/components/site/Shell";
import { listCategories, listProperties } from "@/lib/db";
import type { Property } from "@/lib/types";

export const metadata = { title: "Properties" };
export const dynamic = "force-dynamic";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    type?: string;
    q?: string;
    beds?: string;
    baths?: string;
  }>;
}) {
  const {
    category: categorySlug,
    type,
    q,
    beds,
    baths,
  } = await searchParams;
  const categories = listCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  const listingType =
    type === "rent" || type === "sell" ? (type as Property["listingType"]) : undefined;
  const bedCount = beds ? Number(beds) : undefined;
  const bathCount = baths ? Number(baths) : undefined;

  const properties = listProperties({
    status: "published",
    categoryId: category?.id,
    listingType,
    q: q?.trim() || undefined,
    beds: Number.isFinite(bedCount) ? bedCount : undefined,
    baths: Number.isFinite(bathCount) ? bathCount : undefined,
  });

  const title = category
    ? category.name
    : listingType === "rent"
      ? "Homes for rent"
      : listingType === "sell"
        ? "Homes for sale"
        : q
          ? `Results for “${q}”`
          : "All properties";

  return (
    <>
      <SiteHeader />
      <main className="section-pad">
        <div className="container-wide">
          <h1 className="heading-xl mb-8">{title}</h1>
          <div className="mb-10 flex flex-wrap gap-3">
            <Link
              href="/properties"
              className={`rounded-full border px-4 py-2 text-sm ${
                !category && !listingType ? "bg-[#0c0407] text-white" : "border-[#e8e8e8]"
              }`}
            >
              All
            </Link>
            <Link
              href="/properties?type=sell"
              className={`rounded-full border px-4 py-2 text-sm ${
                listingType === "sell" ? "bg-[#0c0407] text-white" : "border-[#e8e8e8]"
              }`}
            >
              Buy
            </Link>
            <Link
              href="/properties?type=rent"
              className={`rounded-full border px-4 py-2 text-sm ${
                listingType === "rent" ? "bg-[#0c0407] text-white" : "border-[#e8e8e8]"
              }`}
            >
              Rent
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/properties?category=${c.slug}`}
                className={`rounded-full border px-4 py-2 text-sm ${
                  category?.id === c.id
                    ? "bg-[#0c0407] text-white"
                    : "border-[#e8e8e8]"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          {properties.length === 0 ? (
            <p className="mt-8 text-[#758696]">No properties matched your search.</p>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
