import Link from "next/link";
import Image from "next/image";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { DeleteCategoryButton } from "@/components/dashboard/DeleteButtons";
import { listCategories } from "@/lib/db";

export default async function CategoriesAdminPage() {
  const categories = listCategories();

  return (
    <DashboardFrame
      title="Property categories"
      action={
        <Link href="/dashboard/categories/new" className="btn-primary">
          Add category
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <article key={category.id} className="overflow-hidden rounded-3xl bg-white">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                width={600}
                height={360}
                className="aspect-[16/10] w-full object-cover"
              />
            ) : null}
            <div className="space-y-2 p-5">
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <p className="text-sm text-[#758696]">{category.description}</p>
              <div className="flex gap-3 pt-2">
                <Link
                  href={`/dashboard/categories/${category.id}`}
                  className="text-sm underline"
                >
                  Edit
                </Link>
                <DeleteCategoryButton id={category.id} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </DashboardFrame>
  );
}
