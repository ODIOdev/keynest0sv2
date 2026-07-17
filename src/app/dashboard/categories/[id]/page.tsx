import { notFound } from "next/navigation";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { CategoryForm } from "@/components/dashboard/CategoryForm";
import { getCategory, listMedia } from "@/lib/db";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = getCategory(id);
  if (!category) notFound();

  return (
    <DashboardFrame title={`Edit · ${category.name}`}>
      <CategoryForm
        category={category}
        mediaUrls={listMedia().map((m) => m.url)}
      />
    </DashboardFrame>
  );
}
