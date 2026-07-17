import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { isAuthenticated } from "@/lib/auth";

export async function requireAdmin() {
  if (!(await isAuthenticated())) {
    redirect("/dashboard/login");
  }
}

export async function DashboardFrame({
  children,
  title,
  action,
}: {
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="dash-shell">
      <DashboardNav />
      <div className="dash-main">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-[#0c0407]">
            {title}
          </h1>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}
