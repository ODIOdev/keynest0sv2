import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyDetailGallery } from "@/components/site/PropertyDetailGallery";
import { PropertyInquiryForm } from "@/components/site/PropertyInquiryForm";
import { PropertyLocationMap } from "@/components/site/PropertyLocationMap";
import { RealCostCalculator } from "@/components/site/RealCostCalculator";
import { SiteHeader } from "@/components/site/Shell";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getAgent, getCategory, getProperty, listTags } from "@/lib/db";
import { formatAddress, formatPrice } from "@/lib/format";
import { coordsForProperty } from "@/lib/geo";
import { displayTagsForProperty } from "@/lib/property-tags";

export const dynamic = "force-dynamic";

function daysOnMarket(createdAt: string) {
  const start = new Date(createdAt).getTime();
  if (!Number.isFinite(start)) return null;
  const days = Math.max(0, Math.floor((Date.now() - start) / 86_400_000));
  return days;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) return { title: "Property" };
  return {
    title: `${property.address}, ${property.city}, ${property.state} ${property.zip}`,
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) notFound();

  const price = formatPrice(property);
  const agent = property.agentId ? getAgent(property.agentId) : null;
  const category = property.categoryId
    ? getCategory(property.categoryId)
    : null;
  const tags = displayTagsForProperty(property, listTags());
  const coords = coordsForProperty(property);
  const address = formatAddress(property);
  const streetLine = property.address;
  const cityLine = [property.city, property.state, property.zip]
    .filter(Boolean)
    .join(", ");
  const statusLabel =
    property.status === "sold"
      ? "Sold"
      : property.status === "rented"
        ? "Rented"
        : property.listingType === "rent"
          ? "House for rent"
          : "House for sale";
  const days = daysOnMarket(property.createdAt);
  const pricePerSqft =
    property.sqft > 0
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(Math.round(property.price / property.sqft))
      : null;

  const facts = [
    { label: "Bedrooms", value: String(property.bedrooms) },
    { label: "Bathrooms", value: String(property.bathrooms) },
    {
      label: "Square feet",
      value: property.sqft
        ? property.sqft.toLocaleString("en-US")
        : "—",
    },
    {
      label: "Parking",
      value:
        property.parking > 0
          ? `${property.parking} ${property.parking === 1 ? "space" : "spaces"}`
          : "—",
    },
    {
      label: "Property type",
      value: category?.name || (property.listingType === "rent" ? "Rental" : "Home"),
    },
    {
      label: "Listing type",
      value: property.listingType === "rent" ? "For rent" : "For sale",
    },
    ...(pricePerSqft
      ? [{ label: "Price per sqft", value: pricePerSqft }]
      : []),
    ...(days != null
      ? [
          {
            label: "On KeyNestOS",
            value: days === 0 ? "Listed today" : `${days} days`,
          },
        ]
      : []),
    { label: "City", value: property.city || "—" },
    { label: "State", value: property.state || "—" },
    { label: "ZIP", value: property.zip || "—" },
    { label: "Status", value: property.status },
  ];

  return (
    <>
      <SiteHeader />
      <main className="pdp">
        <div className="pdp__top">
          <div className="container-wide pdp__top-inner">
            <Link href="/properties" className="pdp__back">
              ← Back to listings
            </Link>
            <div className="pdp__top-actions">
              <a href="#contact-agent" className="pdp__top-btn">
                Contact agent
              </a>
              {coords ? (
                <a href="#property-map" className="pdp__top-btn pdp__top-btn--ghost">
                  View on map
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="container-wide">
          <PropertyDetailGallery images={property.images} title={property.title} />
        </div>

        <div className="container-wide pdp__body">
          <div className="pdp__main">
            <p className="pdp__status">{statusLabel}</p>
            <div className="pdp__price-row">
              <p className="pdp__price">
                {price.amount}
                {price.suffix ? (
                  <span className="pdp__price-suffix">{price.suffix}</span>
                ) : null}
              </p>
              <ul className="pdp__keyfacts" aria-label="Key facts">
                <li>
                  <span className="pdp__keyfact-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M3 12.5V20h18v-7.5" />
                      <path d="M3 14h18" />
                      <path d="M5 14V9.5A1.5 1.5 0 0 1 6.5 8h3A1.5 1.5 0 0 1 11 9.5V14" />
                      <path d="M13 14V10a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v4" />
                      <path d="M2 20h20" />
                    </svg>
                  </span>
                  <span className="pdp__keyfact-body">
                    <strong>{property.bedrooms}</strong>
                    <span>Bed{property.bedrooms === 1 ? "" : "s"}</span>
                  </span>
                </li>
                <li>
                  <span className="pdp__keyfact-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M5 12V6.5A2.5 2.5 0 0 1 7.5 4h3A2.5 2.5 0 0 1 13 6.5V12" />
                      <path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3Z" />
                      <path d="M8 20v2M16 20v2" />
                    </svg>
                  </span>
                  <span className="pdp__keyfact-body">
                    <strong>{property.bathrooms}</strong>
                    <span>Bath{property.bathrooms === 1 ? "" : "s"}</span>
                  </span>
                </li>
                <li>
                  <span className="pdp__keyfact-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <rect x="4" y="4" width="16" height="16" rx="1.5" />
                      <path d="M4 10h16M10 4v16" />
                    </svg>
                  </span>
                  <span className="pdp__keyfact-body">
                    <strong>{property.sqft.toLocaleString("en-US")}</strong>
                    <span>Sqft</span>
                  </span>
                </li>
                {property.parking > 0 ? (
                  <li>
                    <span className="pdp__keyfact-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path d="M4 16.5 5.5 9.5A2 2 0 0 1 7.45 8h9.1a2 2 0 0 1 1.95 1.5L20 16.5" />
                        <path d="M6.5 16.5h11" />
                        <circle cx="7.5" cy="16.5" r="1.75" />
                        <circle cx="16.5" cy="16.5" r="1.75" />
                        <path d="M4 12.5h16" />
                      </svg>
                    </span>
                    <span className="pdp__keyfact-body">
                      <strong>{property.parking}</strong>
                      <span>Parking</span>
                    </span>
                  </li>
                ) : null}
              </ul>
            </div>

            <h1 className="pdp__address">
              <span className="pdp__address-street">{streetLine}</span>
              <span className="pdp__address-city">{cityLine}</span>
            </h1>

            {coords ? (
              <a href="#property-map" className="pdp__map-link">
                View on map
              </a>
            ) : null}

            {tags.length > 0 ? (
              <div className="pdp__tags" aria-label="Tags">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="property-card__tag"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : null}

            <dl className="pdp__snapshot">
              <div>
                <dt>Property type</dt>
                <dd>{category?.name || "Home"}</dd>
              </div>
              {days != null ? (
                <div>
                  <dt>On KeyNestOS</dt>
                  <dd>{days === 0 ? "Listed today" : `${days} days`}</dd>
                </div>
              ) : null}
              {pricePerSqft ? (
                <div>
                  <dt>Price per sqft</dt>
                  <dd>{pricePerSqft}</dd>
                </div>
              ) : null}
              <div>
                <dt>Parking</dt>
                <dd>
                  {property.parking > 0
                    ? `${property.parking} ${property.parking === 1 ? "space" : "spaces"}`
                    : "—"}
                </dd>
              </div>
            </dl>

            <section className="pdp-section" aria-labelledby="about-heading">
              <h2 id="about-heading" className="pdp-section__title">
                About this home
              </h2>
              <p className="pdp-section__copy">{property.description}</p>
            </section>

            {property.listingType === "sell" ? (
              <RealCostCalculator
                homePrice={property.price}
                state={property.state || "NY"}
              />
            ) : null}

            <section className="pdp-section" aria-labelledby="details-heading">
              <h2 id="details-heading" className="pdp-section__title">
                Property details
              </h2>
              <dl className="pdp-facts">
                {facts.map((fact) => (
                  <div key={fact.label} className="pdp-facts__row">
                    <dt>{fact.label}</dt>
                    <dd className="capitalize">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {coords ? (
              <section
                id="property-map"
                className="pdp-section pdp-section--map"
                aria-labelledby="map-heading"
              >
                <h2 id="map-heading" className="pdp-section__title">
                  Map
                </h2>
                <PropertyLocationMap
                  title={property.title}
                  address={address}
                  lat={coords.lat}
                  lng={coords.lng}
                />
              </section>
            ) : null}

            {agent ? (
              <section className="pdp-section" aria-labelledby="listed-heading">
                <h2 id="listed-heading" className="pdp-section__title">
                  Listed by
                </h2>
                <div className="pdp-listed">
                  <Image
                    src={agent.image}
                    alt={agent.name}
                    width={72}
                    height={72}
                    className="pdp-listed__photo"
                  />
                  <div>
                    <p className="pdp-listed__name">{agent.name}</p>
                    <p className="pdp-listed__title">{agent.title}</p>
                    {agent.phone ? (
                      <a href={`tel:${agent.phone}`} className="pdp-listed__link">
                        {agent.phone}
                      </a>
                    ) : null}
                    {agent.email ? (
                      <a
                        href={`mailto:${agent.email}`}
                        className="pdp-listed__link"
                      >
                        {agent.email}
                      </a>
                    ) : null}
                    {agent.bio ? (
                      <p className="pdp-listed__bio">{agent.bio}</p>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}
          </div>

          <aside className="pdp__rail" id="contact-agent">
            <div className="pdp-rail">
              <p className="pdp-rail__kicker">
                {property.listingType === "rent" ? "For rent" : "For sale"}
              </p>
              <p className="pdp-rail__price">
                {price.amount}
                {price.suffix ? (
                  <span className="pdp-rail__suffix">{price.suffix}</span>
                ) : null}
              </p>
              <p className="pdp-rail__address">{streetLine}</p>
              {agent ? (
                <div className="pdp-rail__agent">
                  <Image
                    src={agent.image}
                    alt=""
                    width={48}
                    height={48}
                    className="pdp-rail__agent-photo"
                  />
                  <div>
                    <p className="pdp-rail__agent-name">{agent.name}</p>
                    <p className="pdp-rail__agent-title">{agent.title}</p>
                  </div>
                </div>
              ) : null}
              <h2 className="pdp-rail__heading">Contact agent</h2>
              <PropertyInquiryForm
                propertyId={property.id}
                listingLabel={`${streetLine}, ${cityLine}`}
              />
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
