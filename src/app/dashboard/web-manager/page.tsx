import Link from "next/link";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import { WebManagerPanel } from "@/components/dashboard/WebManagerPanel";
import { getSettings } from "@/lib/db";

export const metadata = { title: "Web Manager" };
export const dynamic = "force-dynamic";

export default function WebManagerPage() {
  const settings = getSettings();

  return (
    <DashboardFrame
      title="Web Manager"
      description="Edit homepage sections — images, logos, headlines, and dialogs."
      action={
        <Link href="/" className="btn-secondary" target="_blank">
          Open website
        </Link>
      }
    >
      <WebManagerPanel initial={settings} />
    </DashboardFrame>
  );
}
