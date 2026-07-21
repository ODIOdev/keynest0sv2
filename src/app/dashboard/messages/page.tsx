import Link from "next/link";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";

export const metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <DashboardFrame
      title="Messages"
      description="Inbox for site chat and agent conversations."
      action={
        <Link href="/dashboard/leads" className="btn-secondary">
          View leads
        </Link>
      }
    >
      <div className="dash-empty">
        <h2 className="dash-empty__title">No messages yet</h2>
        <p className="dash-empty__copy">
          New chat and contact threads will show up here as people reach out.
        </p>
      </div>
    </DashboardFrame>
  );
}
