import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { MediaByCategory } from "@/components/dashboard/MediaByCategory";
import { MediaUploader } from "@/components/dashboard/MediaUploader";
import { groupMediaByCategory } from "@/lib/media-by-category";
import { listCategories, listMedia, listProperties } from "@/lib/db";

export default async function MediaPage() {
  const media = listMedia();
  const categories = listCategories();
  const properties = listProperties();
  const recent = media.slice(0, 12);
  const groups = groupMediaByCategory(categories, properties);

  return (
    <DashboardFrame
      title="Media"
      description="Manage listing photos by property type. Open a listing to add or remove images."
    >
      <MediaUploader recent={recent} />
      <MediaByCategory groups={groups} />
    </DashboardFrame>
  );
}
