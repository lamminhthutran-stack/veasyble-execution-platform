import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CampaignCard, StageBadge } from "@/components/CampaignCard";
import { useStore } from "@/lib/store";
import {
  CAMPAIGNS,
  formatShortDate,
  formatVND,
  stageDeadline,
  STEP_LABELS,
  TODAY_ISO,
  type CampaignStep,
} from "@/lib/mock-data";
import { Bell, ChevronRight, Filter, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Home — Veasyble Executor" },
      { name: "description", content: "Your campaign snapshot and upcoming reminders." },
    ],
  }),
  component: Dashboard,
});

type TimelineFilter = "all" | "week" | "twoWeeks" | "month";

const filterLabels: Record<TimelineFilter, string> = {
  all: "All",
  week: "Within 1 Week",
  twoWeeks: "Within 2 Weeks",
  month: "Within 1 Month",
};

function Dashboard() {
  const { activity, history, profile, notifications } = useStore();
  const [filter, setFilter] = useState<TimelineFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const unread = notifications.filter((n) => n.unread).length;
  const completedThisMonth = history
    .filter((a) => a.approvedAt?.startsWith("2026-07"))
    .reduce((sum, a) => sum + (CAMPAIGNS.find((c) => c.id === a.campaignId)?.compensation ?? 0), 0);
  const projected =
    completedThisMonth +
    activity.reduce((sum, a) => sum + (CAMPAIGNS.find((c) => c.id === a.campaignId)?.compensation ?? 0), 0);

  const actionItems = activity.filter((entry) => {
    if (entry.step === "printing") return !entry.printingCompletedAt;
    if (entry.step === "execution") return !entry.proofSubmittedAt;
    return false;
  });

  const timeline = useMemo(() => {
    const today = new Date(TODAY_ISO);
    const maxDays = filter === "week" ? 7 : filter === "twoWeeks" ? 14 : filter === "month" ? 30 : Number.POSITIVE_INFINITY;
    return activity
      .flatMap((entry) => {
        const c = CAMPAIGNS.find((campaign) => campaign.id === entry.campaignId);
        if (!c) return [];
        const steps: CampaignStep[] = ["registered", "printing", "execution", "review"];
        return steps.map((step) => ({ entry, c, step, deadline: stageDeadline(c, step) }));
      })
      .filter((item) => {
        const diff = (new Date(item.deadline).getTime() - today.getTime()) / 86400000;
        return diff >= 0 && diff <= maxDays;
      })
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [activity, filter]);

  const grouped = timeline.reduce<Record<string, typeof timeline>>((acc, item) => {
    acc[item.deadline] = [...(acc[item.deadline] ?? []), item];
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="px-5 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Welcome back,</div>
            <h1 className="mt-0.5 text-2xl font-bold">{profile.fullName.split(" ")[0]}</h1>
          </div>
          <Link to="/notifications" className="relative flex h-10 w-10 items-center justify-center text-foreground">
            <Bell className="h-6 w-6 stroke-[2.2]" />
            {unread > 0 && (
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </Link>
        </div>

        <KpiPanel projected={formatVND(projected)} total={String(activity.length + history.length)} />
      </div>

      <section className="mt-7 px-5">
        <h2 className="text-lg font-semibold">In-progress Activities</h2>
        <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
          {actionItems.length === 0 ? (
            <div className="w-full rounded border border-border/70 bg-card p-4 text-sm text-muted-foreground">
              No campaign actions need your attention right now.
            </div>
          ) : (
            actionItems.map((entry) => (
              <CampaignCard
                key={entry.campaignId}
                campaignId={entry.campaignId}
                step={entry.step}
                href={`/activity/${entry.campaignId}`}
                mode="dashboard"
                compact
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-7 px-5 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Timeline</h2>
            <div className="relative">
              <button onClick={() => setFilterOpen((open) => !open)} className="flex h-8 w-8 items-center justify-center rounded bg-secondary">
                <Filter className="h-4 w-4" />
              </button>
              {filterOpen && (
                <div className="absolute left-0 top-9 z-20 w-44 rounded border border-border bg-card p-1 shadow-elevated">
                  {(Object.keys(filterLabels) as TimelineFilter[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setFilter(key);
                        setFilterOpen(false);
                      }}
                      className={`block w-full rounded px-3 py-2 text-left text-sm ${filter === key ? "bg-accent font-semibold text-primary" : ""}`}
                    >
                      {filterLabels[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Link to="/activity" className="text-sm font-semibold text-primary">View all</Link>
        </div>
        {timeline.length === 0 ? (
          <div className="mt-3 rounded border border-border/70 bg-card p-4 text-sm text-muted-foreground">
            No upcoming stage deadlines within this timeframe.
          </div>
        ) : (
          <ol className="mt-3 space-y-5">
            {Object.entries(grouped).map(([date, items]) => (
              <li key={date} className="relative grid grid-cols-[30%_70%]">
                <div className="absolute bottom-0 left-[30%] top-0 w-px -translate-x-1/2 bg-border" />
                <span className="absolute left-[30%] top-1.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-primary ring-4 ring-orange-100" />
                <div className="pr-4">
                  <div className="whitespace-nowrap text-[13px] font-semibold leading-5">{dateLabel(date)}</div>
                </div>
                <div className="space-y-2 pl-5">
                  {items.map((item) => (
                    <Link
                      key={`${item.c.id}-${item.step}`}
                      to="/activity/$id"
                      params={{ id: item.c.id }}
                      className="block h-[112px] overflow-hidden rounded border border-border/70 bg-card p-4 shadow-card"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="h-5 truncate text-sm font-semibold leading-5">{item.c.title}</div>
                          <div className="mt-1 truncate text-xs font-bold uppercase tracking-wide text-muted-foreground">{item.c.brand}</div>
                        </div>
                        <div className="shrink-0">
                          <StageBadge step={item.step} />
                        </div>
                      </div>
                      <div className="mt-3 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span className="min-w-0 truncate">{item.c.location}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </AppShell>
  );
}

function KpiPanel({ projected, total }: { projected: string; total: string }) {
  return (
    <div className="mt-6 grid grid-cols-[60%_40%] overflow-hidden rounded border border-border/80 bg-card shadow-card">
      <Link to="/earnings" className="group min-w-0 p-4 pr-2">
        <div className="text-xs font-bold tracking-wide text-foreground/80">Projected Earnings This Month</div>
        <div className="mt-3 flex min-w-0 items-center gap-1.5">
          <div className="min-w-0 truncate font-display text-xl font-bold leading-none text-primary">{projected}</div>
          <div className="shrink-0 text-xs font-bold text-success">↗ 17%</div>
          <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-foreground/80 transition-transform group-active:translate-x-0.5" />
        </div>
      </Link>
      <Link to="/activity" className="group min-w-0 border-l border-border/80 p-4 pl-5">
        <div className="text-xs font-bold tracking-wide text-foreground/80">Total Campaigns</div>
        <div className="mt-3 flex items-center gap-2">
          <div className="font-display text-xl font-bold leading-none text-primary">{total}</div>
          <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-foreground/80 transition-transform group-active:translate-x-0.5" />
        </div>
      </Link>
    </div>
  );
}

function dateLabel(date: string) {
  const today = new Date(TODAY_ISO);
  const target = new Date(date);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  const shortDate = formatShortDate(date);
  if (diff === 0) return `Today - ${shortDate}`;
  if (diff === 1) return `Tomorrow - ${shortDate}`;
  return shortDate;
}
