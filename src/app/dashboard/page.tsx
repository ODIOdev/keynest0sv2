import Link from "next/link";
import { DashboardFrame } from "@/components/dashboard/DashboardFrame";
import {
  BarChart,
  DonutChart,
  Pipeline,
  ProgressRing,
  Sparkline,
  StatCard,
} from "@/components/dashboard/Infographics";
import { getDashboardAnalytics, listLeads, listProperties } from "@/lib/db";

export default async function DashboardHomePage() {
  const analytics = getDashboardAnalytics();
  const leads = listLeads().slice(0, 6);
  const properties = listProperties().slice(0, 6);

  return (
    <DashboardFrame
      title="Overview"
      description="Pipeline health, listing mix, and recent CRM activity."
      action={
        <div className="dash-actions">
          <Link href="/dashboard/leads" className="btn-secondary">
            Open leads
          </Link>
          <Link href="/dashboard/properties/new" className="btn-primary">
            Add property
          </Link>
        </div>
      }
    >
      <div className="dash-grid dash-grid--stats">
        <StatCard
          label="Properties"
          value={analytics.properties}
          hint={`${analytics.published} published`}
          tone="accent"
        />
        <StatCard
          label="New leads"
          value={analytics.newLeads}
          hint={`${analytics.leads} total in CRM`}
          tone="warn"
        />
        <StatCard
          label="Media library"
          value={analytics.media}
          hint={`${analytics.categories} categories`}
        />
        <StatCard
          label="Agents"
          value={analytics.agents}
          hint="Active roster"
          tone="success"
        />
      </div>

      <div className="dash-grid dash-grid--hero">
        <section className="dash-panel dash-panel--pad">
          <div className="dash-panel__head dash-panel__head--perf">
            <div>
              <h2 className="dash-panel__title">Performance</h2>
              <p className="dash-panel__sub">Publication and close rates</p>
            </div>
            <div className="dash-rings dash-rings--compact">
              <ProgressRing
                value={analytics.pipelineRate}
                max={100}
                label="Pipeline"
                sublabel={`${analytics.pipelineActive} active`}
                size={72}
              />
              <ProgressRing
                value={analytics.published}
                max={Math.max(analytics.properties, 1)}
                label="Published"
                sublabel={`${analytics.published}/${analytics.properties}`}
                size={72}
              />
              <ProgressRing
                value={analytics.closeRate}
                max={100}
                label="Close rate"
                sublabel={`${analytics.closeRate}%`}
                size={72}
              />
            </div>
          </div>
          <Sparkline
            title="Leads · last 7 days"
            values={analytics.leadsTrend.map((d) => d.value)}
            labels={analytics.leadsTrend.map((d) => d.label)}
          />
        </section>

        <section className="dash-panel dash-panel--pad">
          <DonutChart
            title="Lead status mix"
            items={analytics.leadsByStatus}
            empty="No leads yet — inquiries will appear here."
          />
        </section>
      </div>

      <div className="dash-grid dash-grid--charts">
        <section className="dash-panel dash-panel--pad">
          <BarChart
            title="Listing type"
            items={analytics.listingTypes}
            empty="Add properties to see rent vs sale mix."
          />
        </section>
        <section className="dash-panel dash-panel--pad">
          <Pipeline
            title="Lead pipeline"
            items={analytics.leadsByStatus.filter((s) => s.key !== "lost")}
          />
        </section>
        <section className="dash-panel dash-panel--pad">
          <BarChart
            title="Property status"
            items={analytics.propertyStatuses}
            empty="No listings yet."
          />
        </section>
      </div>

      <div className="dash-grid dash-grid--lists">
        <section className="dash-panel">
          <div className="dash-panel__head dash-panel__head--pad">
            <div>
              <h2 className="dash-panel__title">Recent leads</h2>
              <p className="dash-panel__sub">Newest inquiries in the CRM</p>
            </div>
            <Link href="/dashboard/leads" className="dash-link">
              View all
            </Link>
          </div>
          <ul className="dash-feed">
            {leads.length === 0 ? (
              <li className="dash-empty dash-empty--pad">No leads yet.</li>
            ) : (
              leads.map((lead) => (
                <li key={lead.id} className="dash-feed__item">
                  <div className="dash-feed__avatar" aria-hidden>
                    {lead.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="dash-feed__body">
                    <div className="dash-feed__row">
                      <p className="dash-feed__title">{lead.name}</p>
                      <span className={`dash-badge dash-badge--${lead.status}`}>
                        {lead.status}
                      </span>
                    </div>
                    <p className="dash-feed__meta">{lead.message}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="dash-panel">
          <div className="dash-panel__head dash-panel__head--pad">
            <div>
              <h2 className="dash-panel__title">Latest listings</h2>
              <p className="dash-panel__sub">Most recently updated inventory</p>
            </div>
            <Link href="/dashboard/properties" className="dash-link">
              Manage
            </Link>
          </div>
          <ul className="dash-feed">
            {properties.length === 0 ? (
              <li className="dash-empty dash-empty--pad">No properties yet.</li>
            ) : (
              properties.map((property) => (
                <li key={property.id} className="dash-feed__item">
                  <div className="dash-feed__body">
                    <div className="dash-feed__row">
                      <p className="dash-feed__title">{property.title}</p>
                      <span
                        className={`dash-badge dash-badge--${property.status}`}
                      >
                        {property.status}
                      </span>
                    </div>
                    <p className="dash-feed__meta">
                      {property.listingType === "rent" ? "For rent" : "For sale"}{" "}
                      · ${property.price.toLocaleString()}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </DashboardFrame>
  );
}
