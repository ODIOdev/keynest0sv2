import Image from "next/image";
import Link from "next/link";
import type { Property, Tag } from "@/lib/types";
import { formatAddress, formatPrice } from "@/lib/format";
import { displayTagsForProperty } from "@/lib/property-tags";

export function PropertyCard({
  property,
  tags: allTags,
}: {
  property: Property;
  tags: Tag[];
}) {
  const price = formatPrice(property);
  const tags = displayTagsForProperty(property, allTags);

  return (
    <article className="property-card fade-up">
      <Link href={`/properties/${property.slug}`} className="media relative block">
        <Image
          src={property.images[0] || "/placeholder-property.jpg"}
          alt={property.title}
          width={800}
          height={600}
          className="h-full w-full object-cover"
        />
        <div className="property-card__tags">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <span
                key={tag.id}
                className="property-card__tag"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))
          ) : (
            <span className="property-card__tag property-card__tag--fallback">
              {property.listingType === "rent" ? "Rent" : "Buy"}
            </span>
          )}
        </div>
      </Link>
      <div className="space-y-2">
        <div className="flex items-end gap-1">
          <p className="text-2xl font-semibold tracking-tight text-[#0c0407]">
            {price.amount}
          </p>
          {price.suffix ? (
            <span className="pb-1 text-sm text-[#758696]">{price.suffix}</span>
          ) : null}
        </div>
        <Link href={`/properties/${property.slug}`}>
          <h3 className="text-xl font-semibold tracking-tight text-[#0c0407]">
            {property.title}
          </h3>
        </Link>
        <p className="text-sm text-[#758696]">{formatAddress(property)}</p>
        <div className="flex flex-wrap gap-4 pt-2 text-sm text-[#0c0407]">
          <span>{property.sqft} sqft</span>
          <span>{property.bedrooms} beds</span>
          <span>{property.bathrooms} baths</span>
          <span>{property.parking} parking</span>
        </div>
      </div>
    </article>
  );
}
