import Image from "next/image";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { DeleteMediaButton } from "@/components/dashboard/DeleteButtons";
import { MediaUploader } from "@/components/dashboard/MediaUploader";
import { listMedia } from "@/lib/db";

export default async function MediaPage() {
  const media = listMedia();

  return (
    <DashboardFrame title="Image upload portal">
      <div className="mb-8">
        <MediaUploader />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {media.map((asset) => (
          <article key={asset.id} className="overflow-hidden rounded-3xl bg-white">
            <Image
              src={asset.url}
              alt={asset.alt || asset.filename}
              width={400}
              height={300}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="space-y-1 p-4 text-sm">
              <p className="font-medium">{asset.filename}</p>
              <p className="break-all text-[#758696]">{asset.url}</p>
              <DeleteMediaButton id={asset.id} />
            </div>
          </article>
        ))}
      </div>
    </DashboardFrame>
  );
}
