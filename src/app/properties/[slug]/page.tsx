import Image from "next/image";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/site/ContactForm";
import { SiteFooter, SiteHeader } from "@/components/site/Shell";
import { getAgent, getCategory, getProperty } from "@/lib/db";
import { formatAddress, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = getProperty(slug);
  return { title: property?.title || "Property" };
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
  const category = property.categoryId ? getCategory(property.categoryId) : null;

  return (
    <>
      <SiteHeader />
      <main className="section-pad">
        <div className="container-wide grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <div className="mb-6 overflow-hidden rounded-[28px]">
              <Image
                src={property.images[0]}
                alt={property.title}
                width={1200}
                height={800}
                className="aspect-[16/10] w-full object-cover"
                priority
              />
            </div>
            {property.images.length > 1 ? (
              <div className="mb-8 grid grid-cols-3 gap-3">
                {property.images.slice(1).map((img) => (
                  <Image
                    key={img}
                    src={img}
                    alt=""
                    width={400}
                    height={300}
                    className="aspect-[4/3] rounded-2xl object-cover"
                  />
                ))}
              </div>
            ) : null}
            <p className="eyebrow mb-4">
              {property.listingType === "rent" ? "For rent" : "For sale"}
              {category ? ` · ${category.name}` : ""}
            </p>
            <h1 className="heading-xl mb-3">{property.title}</h1>
            <p className="mb-6 text-[#758696]">{formatAddress(property)}</p>
            <div className="mb-8 flex flex-wrap gap-6 text-[#0c0407]">
              <span>{property.sqft} sqft</span>
              <span>{property.bedrooms} beds</span>
              <span>{property.bathrooms} baths</span>
              <span>{property.parking} parking</span>
            </div>
            <p className="max-w-3xl text-lg leading-relaxed text-[#758696]">
              {property.description}
            </p>
          </div>
          <aside className="h-fit rounded-[24px] border border-[#e8e8e8] bg-[#f7f7f7] p-6">
            <p className="mb-1 text-sm uppercase tracking-wide text-[#758696]">Price</p>
            <p className="mb-6 text-4xl font-semibold tracking-tight text-[#0c0407]">
              {price.amount}
              {price.suffix ? (
                <span className="ml-1 text-base font-normal text-[#758696]">
                  {price.suffix}
                </span>
              ) : null}
            </p>
            {agent ? (
              <div className="mb-6 flex items-center gap-3 border-b border-[#e8e8e8] pb-6">
                <Image
                  src={agent.image}
                  alt={agent.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-[#0c0407]">{agent.name}</p>
                  <p className="text-sm text-[#758696]">{agent.title}</p>
                </div>
              </div>
            ) : null}
            <h2 className="mb-4 text-xl font-semibold text-[#0c0407]">
              Inquire about this property
            </h2>
            <ContactForm propertyId={property.id} />
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
