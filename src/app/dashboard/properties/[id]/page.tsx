import { notFound } from "next/navigation";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { PropertyForm } from "@/components/dashboard/PropertyForm";
import { getProperty, listAgents, listCategories, listMedia } from "@/lib/db";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = getProperty(id);
  if (!property) notFound();

  return (
    <DashboardFrame title={`Edit · ${property.title}`}>
      <PropertyForm
        property={property}
        categories={listCategories()}
        agents={listAgents()}
        mediaUrls={listMedia().map((m) => m.url)}
      />
    </DashboardFrame>
  );
}
