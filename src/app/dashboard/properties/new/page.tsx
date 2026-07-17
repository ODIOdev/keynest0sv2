import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { PropertyForm } from "@/components/dashboard/PropertyForm";
import { listAgents, listCategories, listMedia } from "@/lib/db";

export default async function NewPropertyPage() {
  const categories = listCategories();
  const agents = listAgents();
  const mediaUrls = listMedia().map((m) => m.url);

  return (
    <DashboardFrame title="Add property">
      <PropertyForm
        categories={categories}
        agents={agents}
        mediaUrls={mediaUrls}
      />
    </DashboardFrame>
  );
}
