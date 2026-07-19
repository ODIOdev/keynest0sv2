import Link from "next/link";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { CategoryForm } from "@/components/dashboard/CategoryForm";
import { listMedia } from "@/lib/db";

export default async function NewCategoryPage() {
  return (
    <DashboardFrame
      title="Add category"
      description="Create a category for organizing property listings."
      action={
        <Link href="/dashboard/categories" className="btn-secondary">
          Back
        </Link>
      }
    >
      <CategoryForm mediaUrls={listMedia().map((m) => m.url)} />
    </DashboardFrame>
  );
}
