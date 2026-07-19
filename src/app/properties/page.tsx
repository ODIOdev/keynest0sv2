import { PropertiesMapHero } from "@/components/site/PropertiesMapHero";
import { PropertyResults } from "@/components/site/PropertyResults";
import { SiteFooter, SiteHeader } from "@/components/site/Shell";
import { listCategories, listProperties, listTags } from "@/lib/db";
import { propertiesToPins } from "@/lib/geo";
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
    sqft?: string;
    psf?: string;
    lat?: string;
    lng?: string;
  }>;
}) {
  const {
    category: categorySlug,
    type,
    q,
    beds,
    baths,
    sqft,
    psf,
    lat: latParam,
    lng: lngParam,
  } = await searchParams;
  const categories = listCategories();
  const tags = listTags();
  const category = categories.find((c) => c.slug === categorySlug);
  const listingType =
    type === "rent" || type === "sell" ? (type as Property["listingType"]) : undefined;
  const bedCount = beds ? Number(beds) : undefined;
  const bathCount = baths ? Number(baths) : undefined;
  const sqftCount = sqft ? Number(sqft) : undefined;
  const psfCount = psf ? Number(psf) : undefined;
  const focusLat = latParam ? Number(latParam) : NaN;
  const focusLng = lngParam ? Number(lngParam) : NaN;
  const mapFocus =
    Number.isFinite(focusLat) && Number.isFinite(focusLng)
      ? { lat: focusLat, lng: focusLng, label: q?.trim() || "Search location" }
      : null;

  const properties = listProperties({
    status: "published",
    categoryId: category?.id,
    listingType,
    q: q?.trim() || undefined,
    beds: Number.isFinite(bedCount) ? bedCount : undefined,
    baths: Number.isFinite(bathCount) ? bathCount : undefined,
    sqft: Number.isFinite(sqftCount) ? sqftCount : undefined,
    psf: Number.isFinite(psfCount) ? psfCount : undefined,
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

  const pins = propertiesToPins(properties);

  return (
    <>
      <SiteHeader />
      <main>
        <PropertiesMapHero pins={pins} focus={mapFocus} />

        <div className="properties-page__list">
          <div className="container-wide">
            <h1 className="heading-xl mb-8">{title}</h1>
            <PropertyResults
              properties={properties}
              categories={categories}
              tags={tags}
              syncUrlType
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
