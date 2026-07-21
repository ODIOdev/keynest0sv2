import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { AUTH } from "@/lib/auth-routes";
import { ArchivesSettingsPanel } from "@/components/dashboard/SettingsForms";
import { listProperties } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import type { Property } from "@/lib/types";

export const metadata = { title: "Archives · Settings" };

function toArchiveItem(p: Property) {
  const price = formatPrice(p);
  return {
    id: p.id,
    title: p.title,
    city: p.city,
    state: p.state,
    status: p.status,
    deletedAt: p.deletedAt,
    priceLabel: `${price.amount}${price.suffix}`,
    updatedAt: p.updatedAt,
  };
}

export default async function SettingsArchivesPage() {
  const user = await getUser();
  if (!user) redirect(AUTH.signIn);

  const deleted = listProperties({ deletedOnly: true })
    .sort((a, b) => (b.deletedAt || "").localeCompare(a.deletedAt || ""))
    .map(toArchiveItem);

  const drafts = listProperties({ status: "draft" }).map(toArchiveItem);

  const closed = listProperties()
    .filter((p) => p.status === "sold" || p.status === "rented")
    .map(toArchiveItem);

  return (
    <ArchivesSettingsPanel
      deleted={deleted}
      drafts={drafts}
      closed={closed}
    />
  );
}
