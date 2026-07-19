import Link from "next/link";
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
    <DashboardFrame
      title={`Edit · ${category.name}`}
      description="Update category name, description, and cover image."
      action={
        <Link href="/dashboard/categories" className="btn-secondary">
          Back
        </Link>
      }
    >
      <CategoryForm
        category={category}
        mediaUrls={listMedia().map((m) => m.url)}
      />
    </DashboardFrame>
  );
}
