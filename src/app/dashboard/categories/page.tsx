import Link from "next/link";
import { CategoryCarousel } from "@/components/dashboard/CategoryCarousel";
import { CategoryUndoToast } from "@/components/dashboard/CategoryUndoToast";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { TagsManager } from "@/components/dashboard/TagsManager";
import { listCategories, listProperties, listTags } from "@/lib/db";

export default async function CategoriesAdminPage() {
  const categories = listCategories();
  const tags = listTags();
  const properties = listProperties();

  return (
    <DashboardFrame
      title="Categories"
      description="Property types, cover imagery, and tags that organize your catalog."
      action={
        <Link href="/dashboard/categories/new" className="btn-primary">
          Add category
        </Link>
      }
    >
      <div className="cat-page">
        <div className="cat-page__stats">
          <div className="cat-page__stat">
            <p className="cat-page__stat-value">{categories.length}</p>
            <p className="cat-page__stat-label">Categories</p>
          </div>
          <div className="cat-page__stat">
            <p className="cat-page__stat-value">{tags.length}</p>
            <p className="cat-page__stat-label">Platform tags</p>
          </div>
          <div className="cat-page__stat">
            <p className="cat-page__stat-value">
              {categories.filter((c) => c.image).length}
            </p>
            <p className="cat-page__stat-label">With cover art</p>
          </div>
        </div>

        <section className="cat-page__section">
          <header className="cat-page__section-head">
            <div>
              <h2 className="cat-page__section-title">Property categories</h2>
              <p className="cat-page__section-sub">
                Drag cards to organize how segments appear on the site.
              </p>
            </div>
          </header>

          {categories.length === 0 ? (
            <div className="cat-page__empty">
              <p>No categories yet.</p>
              <Link href="/dashboard/categories/new" className="btn-primary">
                Create your first category
              </Link>
            </div>
          ) : (
            <CategoryCarousel categories={categories} />
          )}
        </section>

        <section className="cat-page__section cat-page__section--tags">
          <header className="cat-page__section-head">
            <div>
              <h2 className="cat-page__section-title">Tags</h2>
              <p className="cat-page__section-sub">
                Lightweight labels for listings, leads, and campaigns.
              </p>
            </div>
          </header>
          <div className="cat-page__tags-panel">
            <TagsManager tags={tags} properties={properties} />
          </div>
        </section>
      </div>
      <CategoryUndoToast />
    </DashboardFrame>
  );
}
