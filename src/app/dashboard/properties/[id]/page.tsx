import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { PropertyForm } from "@/components/dashboard/PropertyForm";
import {
  getProperty,
  listAgents,
  listCategories,
  listTags,
} from "@/lib/db";

export default async function EditPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const property = getProperty(id);
  if (!property) notFound();

  const backHref =
    from === "media" ? "/dashboard/media" : "/dashboard/properties";
  const backLabel = from === "media" ? "Back to media" : "Back";

  return (
    <DashboardFrame
      title={`Edit · ${property.title}`}
      description="Update listing details, media, and publication status."
      action={
        <div className="dash-top__actions">
          <Link href={backHref} className="btn-secondary">
            {backLabel}
          </Link>
          <button
            type="submit"
            form="kn-property-form"
            className="btn-primary"
          >
            Update property
          </button>
        </div>
      }
    >
      <PropertyForm
        property={property}
        categories={listCategories()}
        agents={listAgents()}
        tags={listTags()}
      />
    </DashboardFrame>
  );
}
