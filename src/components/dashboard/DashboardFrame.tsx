import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { getProfile, requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export { requireAdmin };

export async function DashboardFrame({
  children,
  title,
  description,
  action,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  await requireAdmin();
  const profile = await getProfile();
  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding/account");
  }

  return (
    <div className="dash-shell">
      <DashboardNav />
      <div className="dash-main">
        <header className="dash-top">
          <div className="dash-top__copy">
            <p className="dash-top__kicker">KeyNestOS</p>
            <h1 className="dash-top__title">{title}</h1>
            {description ? (
              <p className="dash-top__desc">{description}</p>
            ) : null}
          </div>
          {action ? <div className="dash-top__action">{action}</div> : null}
        </header>
        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}
