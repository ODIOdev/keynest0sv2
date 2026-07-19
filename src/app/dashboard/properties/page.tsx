import Link from "next/link";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { PropertiesInventory } from "@/components/dashboard/PropertiesInventory";
import { listCategories, listProperties, listTags } from "@/lib/db";

export default async function PropertiesAdminPage() {
  const properties = listProperties();
  const categories = listCategories();
  const tags = listTags();

  return (
    <DashboardFrame
      title="Properties"
      description="Manage inventory, pricing, and publication status."
      action={
        <Link href="/dashboard/properties/new" className="btn-primary">
          Add property
        </Link>
      }
    >
      <PropertiesInventory
        properties={properties}
        categories={categories}
        tags={tags}
      />
    </DashboardFrame>
  );
}
