import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/lib/types";
import { formatAddress, formatPrice } from "@/lib/format";

export function PropertyCard({ property }: { property: Property }) {
  const price = formatPrice(property);
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
        <span className="badge absolute left-3 top-3 bg-white/95">
          {property.listingType === "rent" ? "Rent" : "Buy"}
        </span>
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
