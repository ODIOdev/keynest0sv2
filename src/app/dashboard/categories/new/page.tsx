import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { CategoryForm } from "@/components/dashboard/CategoryForm";
import { listMedia } from "@/lib/db";

export default async function NewCategoryPage() {
  return (
    <DashboardFrame title="Add category">
      <CategoryForm mediaUrls={listMedia().map((m) => m.url)} />
    </DashboardFrame>
  );
}
