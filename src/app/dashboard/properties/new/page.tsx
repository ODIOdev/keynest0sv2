import Link from "next/link";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { PropertyForm } from "@/components/dashboard/PropertyForm";
import { listAgents, listCategories, listTags } from "@/lib/db";

export default async function NewPropertyPage() {
  const categories = listCategories();
  const agents = listAgents();
  const tags = listTags();

  return (
    <DashboardFrame
      title="Add property"
      description="Create a new listing for rent or sale."
      action={
        <div className="dash-top__actions">
          <Link href="/dashboard/properties" className="btn-secondary">
            Back
          </Link>
          <button
            type="submit"
            form="kn-property-form"
            className="btn-primary"
          >
            Publish property
          </button>
        </div>
      }
    >
      <PropertyForm
        categories={categories}
        agents={agents}
        tags={tags}
      />
    </DashboardFrame>
  );
}
