"use client";

import Image from "next/image";
import Link from "next/link";
import { DeletePropertyButton } from "@/components/dashboard/DeleteButtons";
import { PropertyAnalyticsButton } from "@/components/dashboard/PropertyAnalyticsOverlay";
import { formatAddress, formatPrice } from "@/lib/format";
import type { PropertyAnalytics } from "@/lib/property-analytics";
import { displayTagsForProperty } from "@/lib/property-tags";
import type { Property, Tag } from "@/lib/types";

export function DashboardPropertyCard({
  property,
  tags: allTags,
  analytics,
}: {
  property: Property;
  tags: Tag[];
  analytics: PropertyAnalytics;
}) {
  const price = formatPrice(property);
  const image = property.images[0] || "/placeholder-property.jpg";
  const tags = displayTagsForProperty(property, allTags);

  return (
    <article className="dash-property-card">
      <div className="dash-property-card__media">
        <Image
          src={image}
          alt={property.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
        <div className="dash-property-card__badges">
          <span className={`dash-badge dash-badge--${property.status}`}>
            {property.status}
          </span>
          {property.featured ? (
            <span className="dash-property-card__featured">Featured</span>
          ) : null}
        </div>
        <div className="dash-property-card__tags">
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
      </div>

      <div className="dash-property-card__body">
        <div className="dash-property-card__price">
          <span>{price.amount}</span>
          {price.suffix ? (
            <span className="dash-property-card__suffix">{price.suffix}</span>
          ) : null}
        </div>
        <h3 className="dash-property-card__title">{property.title}</h3>
        <p className="dash-property-card__address">{formatAddress(property)}</p>
        <p className="dash-property-card__meta">
          <span>{property.sqft.toLocaleString()} sqft</span>
          <span>{property.bedrooms} beds</span>
          <span>{property.bathrooms} baths</span>
        </p>
      </div>

      <div className="dash-property-card__actions">
        <Link
          href={`/dashboard/properties/${property.id}`}
          className="dash-property-card__btn"
        >
          Edit
        </Link>
        <PropertyAnalyticsButton analytics={analytics} />
        <DeletePropertyButton
          id={property.id}
          className="dash-property-card__btn dash-property-card__btn--danger"
        />
      </div>
    </article>
  );
}
