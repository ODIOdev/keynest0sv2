import {
  getDashboardAnalytics,
  listAgents,
  listCategories,
  listLeads,
  listProperties,
} from "@/lib/db";
import { getPropertyAnalytics } from "@/lib/property-analytics";
import { formatAddress, formatPrice } from "@/lib/format";

function pct(part: number, whole: number) {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}

function sumLast(values: number[], n: number) {
  return values.slice(-n).reduce((a, b) => a + b, 0);
}

export function getSiteAnalytics() {
  const dashboard = getDashboardAnalytics();
  const properties = listProperties();
  const leads = listLeads();
  const categories = listCategories();
  const agents = listAgents();

  const listingAnalytics = properties.map((property) =>
    getPropertyAnalytics(property, leads),
  );

  const webViews = listingAnalytics.reduce((sum, row) => sum + row.views, 0);
  const webSaves = listingAnalytics.reduce((sum, row) => sum + row.saves, 0);
  const webShares = listingAnalytics.reduce(
    (sum, row) => sum + row.shareClicks,
    0,
  );
  const webInquiries = listingAnalytics.reduce(
    (sum, row) => sum + row.inquiries,
    0,
  );
  const avgEngagement =
    listingAnalytics.length === 0
      ? 0
      : Math.round(
          listingAnalytics.reduce((sum, row) => sum + row.engagementScore, 0) /
            listingAnalytics.length,
        );
  const avgDaysOnMarket =
    listingAnalytics.length === 0
      ? 0
      : Math.round(
          listingAnalytics.reduce((sum, row) => sum + row.daysOnMarket, 0) /
            listingAnalytics.length,
        );

  const closedLeads = leads.filter((l) => l.status === "closed").length;

  const topListings = [...listingAnalytics]
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)
    .map((row) => {
      const property = properties.find((p) => p.id === row.propertyId)!;
      const price = formatPrice(property);
      return {
        id: row.propertyId,
        title: row.title,
        address: formatAddress(property),
        status: property.status,
        views: row.views,
        saves: row.saves,
        leads: row.leadsTotal,
        engagementScore: row.engagementScore,
        listingHealth: row.listingHealth,
        priceLabel: `${price.amount}${price.suffix}`,
      };
    });

  const attentionList = [...listingAnalytics]
    .filter(
      (row) =>
        row.listingHealth === "needs-attention" ||
        (row.views > 200 && row.leadsTotal === 0) ||
        row.daysOnMarket > 45,
    )
    .sort((a, b) => a.engagementScore - b.engagementScore)
    .slice(0, 6)
    .map((row) => {
      const reason =
        row.listingHealth === "needs-attention"
          ? "Low engagement score"
          : row.leadsTotal === 0 && row.views > 200
            ? "Traffic without leads"
            : "Long days on market";
      return {
        id: row.propertyId,
        title: row.title,
        address: row.addressLine,
        score: row.engagementScore,
        daysOnMarket: row.daysOnMarket,
        views: row.views,
        leads: row.leadsTotal,
        reason,
      };
    });

  const categoryCounts = new Map<string, number>();
  for (const property of properties) {
    const key = property.categoryId || "__none__";
    categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1);
  }
  const byCategory = [...categoryCounts.entries()]
    .map(([key, value]) => ({
      key,
      label:
        key === "__none__"
          ? "Uncategorized"
          : categories.find((c) => c.id === key)?.name || "Category",
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const dayMs = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const listingsTrend = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(today.getTime() - (13 - i) * dayMs);
    const next = new Date(day.getTime() + dayMs);
    const count = properties.filter((p) => {
      const t = new Date(p.createdAt).getTime();
      return t >= day.getTime() && t < next.getTime();
    }).length;
    return {
      label: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: count,
    };
  });

  const leadsTrend14 = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(today.getTime() - (13 - i) * dayMs);
    const next = new Date(day.getTime() + dayMs);
    const count = leads.filter((l) => {
      const t = new Date(l.createdAt).getTime();
      return t >= day.getTime() && t < next.getTime();
    }).length;
    return {
      label: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: count,
    };
  });

  const leadsRecent = sumLast(
    leadsTrend14.map((d) => d.value),
    7,
  );
  const leadsPrior = sumLast(
    leadsTrend14.map((d) => d.value).slice(0, 7),
    7,
  );
  const leadsWow =
    leadsPrior === 0
      ? leadsRecent > 0
        ? 100
        : 0
      : Math.round(((leadsRecent - leadsPrior) / leadsPrior) * 100);

  const agentLeadCounts = new Map<string, number>();
  for (const property of properties) {
    if (!property.agentId) continue;
    const linked = leads.filter((l) => l.propertyId === property.id).length;
    agentLeadCounts.set(
      property.agentId,
      (agentLeadCounts.get(property.agentId) || 0) + linked,
    );
  }
  const byAgent = agents
    .map((agent) => ({
      key: agent.id,
      label: agent.name,
      value: agentLeadCounts.get(agent.id) || 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const featuredCount = properties.filter((p) => p.featured).length;
  const draftCount = properties.filter((p) => p.status === "draft").length;
  const linkedLeadRate =
    properties.length === 0
      ? 0
      : Math.round(
          (properties.filter((p) =>
            leads.some((l) => l.propertyId === p.id),
          ).length /
            properties.length) *
            100,
        );

  const healthMix = [
    {
      key: "strong",
      label: "Strong",
      value: listingAnalytics.filter((r) => r.listingHealth === "strong").length,
      tone: "teal" as const,
    },
    {
      key: "steady",
      label: "Steady",
      value: listingAnalytics.filter((r) => r.listingHealth === "steady").length,
      tone: "sky" as const,
    },
    {
      key: "needs-attention",
      label: "Needs attention",
      value: listingAnalytics.filter((r) => r.listingHealth === "needs-attention")
        .length,
      tone: "coral" as const,
    },
  ];

  const viewToSave = pct(webSaves, webViews);
  const saveToInquiry = pct(webInquiries, webSaves);
  const inquiryToClose = pct(closedLeads, Math.max(webInquiries, leads.length));

  const funnel = [
    { key: "views", label: "Views", value: webViews, rate: 100, tone: "navy" },
    {
      key: "saves",
      label: "Saves",
      value: webSaves,
      rate: viewToSave,
      tone: "teal",
    },
    {
      key: "inquiries",
      label: "Inquiries",
      value: webInquiries,
      rate: saveToInquiry,
      tone: "amber",
    },
    {
      key: "closed",
      label: "Closed",
      value: closedLeads,
      rate: inquiryToClose,
      tone: "coral",
    },
  ] as const;

  const insights: string[] = [];
  if (attentionList.length > 0) {
    insights.push(
      `${attentionList.length} listing${attentionList.length === 1 ? "" : "s"} need a boost — refresh media or follow up on quiet traffic.`,
    );
  }
  if (draftCount > 0) {
    insights.push(
      `${draftCount} draft${draftCount === 1 ? "" : "s"} ready to publish could lift inventory visibility.`,
    );
  }
  if (leadsWow !== 0) {
    insights.push(
      `Lead volume is ${Math.abs(leadsWow)}% ${leadsWow > 0 ? "up" : "down"} vs the prior 7 days.`,
    );
  }
  if (viewToSave < 8 && webViews > 0) {
    insights.push(
      "Save rate is soft — tighten hero photos and price presentation on top listings.",
    );
  }
  if (insights.length === 0) {
    insights.push(
      "Pipeline looks steady. Keep featuring high-engagement listings on the homepage.",
    );
  }

  const generatedAt = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return {
    ...dashboard,
    webViews,
    webSaves,
    webShares,
    webInquiries,
    avgEngagement,
    avgDaysOnMarket,
    featuredCount,
    draftCount,
    linkedLeadRate,
    topListings,
    attentionList,
    byCategory,
    byAgent,
    listingsTrend,
    leadsTrend14,
    healthMix,
    funnel,
    viewToSave,
    saveToInquiry,
    inquiryToClose,
    leadsRecent,
    leadsWow,
    insights,
    generatedAt,
    pulseScore: Math.min(
      100,
      Math.round(
        avgEngagement * 0.45 +
          dashboard.pipelineRate * 0.25 +
          dashboard.publishRate * 0.15 +
          viewToSave * 0.15,
      ),
    ),
  };
}

export type SiteAnalytics = ReturnType<typeof getSiteAnalytics>;
