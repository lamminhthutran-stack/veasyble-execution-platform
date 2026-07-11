import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore, resolveActivityStep } from "@/lib/store";
import { CAMPAIGNS, formatVND, STEP_LABELS } from "@/lib/mock-data";
import { TrendingUp, TrendingDown, Bell, Filter, MapPin, Store, ChevronRight } from "lucide-react";
import { CampaignCard } from "@/components/CampaignCard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Veasyble Executor" },
      { name: "description", content: "Your campaign snapshot and upcoming reminders." },
    ],
  }),
  component: Dashboard,
});

const stepColor = {
  step1_registered: "bg-[#EFF6FF] text-[#3B82F6]",
  step2_printing: "bg-[#FFF1E8] text-[#F97316]",
  step3_execution: "bg-[#FEE9E2] text-[#F56B3D]",
  step5_review: "bg-[#F3E8FF] text-[#9333EA]",
  approved: "bg-[#ECFDF5] text-[#10B981]",
  rejected: "bg-destructive/15 text-destructive",
};

const monthLabels: Record<string, string> = {
  "01": "Tháng 1",
  "02": "Tháng 2",
  "03": "Tháng 3",
  "04": "Tháng 4",
  "05": "Tháng 5",
  "06": "Tháng 6",
  "07": "Tháng 7",
  "08": "Tháng 8",
  "09": "Tháng 9",
  "10": "Tháng 10",
  "11": "Tháng 11",
  "12": "Tháng 12",
};


const CAMPAIGN_IMAGES: Record<string, string> = {
  "c-001": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300",
  "c-002": "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=300",
  "c-003": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300",
  "c-004": "https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=300",
  "c-005": "https://images.unsplash.com/photo-1582408921715-18e7806365c1?w=300",
  "c-006": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300",
  "c-007": "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=300",
  "c-008": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300",
  "c-009": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300",
  "c-010": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300",
  "c-011": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=300",
  "c-012": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300",
  "c-013": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300",
  "c-014": "https://images.unsplash.com/photo-1599490659213-e2b9527ec087?w=300",
  "c-015": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=300",
  "c-016": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300",
  "c-017": "https://images.unsplash.com/photo-1622543956221-a396e9b152e4?w=300",
  "c-018": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=300",
  "c-019": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=300",
  "c-020": "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=300",
  "c-021": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300",
};

function getRelativeDateLabel(dateStr: string) {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDay = new Date(target);
  targetDay.setHours(0, 0, 0, 0);

  const diffTime = targetDay.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const m = String(target.getMonth() + 1).padStart(2, "0");
  const d = String(target.getDate()).padStart(2, "0");
  const formattedDate = `${d}/${m}`;

  if (diffDays === 0) {
    return `Today (${formattedDate})`;
  } else if (diffDays === 1) {
    return `Tomorrow (${formattedDate})`;
  } else if (diffDays === -1) {
    return `Yesterday (${formattedDate})`;
  } else {
    return formattedDate;
  }
}

function Dashboard() {
  const { activity, profile, history, notifications } = useStore();
  const todayStr = new Date().toISOString().split("T")[0];
  
  // Dynamically resolve campaign steps based on date rules
  const resolvedActivity = activity.map(a => ({
    ...a,
    step: resolveActivityStep(a)
  }));

  const totalCampaignsCount = resolvedActivity.length + history.length;

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");

  const currentMonth = todayStr.substring(0, 7);
  const projected =
    resolvedActivity.filter(a => a.registeredAt.startsWith(currentMonth)).reduce((sum, a) => sum + (CAMPAIGNS.find((c) => c.id === a.campaignId)?.compensation ?? 0), 0) +
    history.filter(a => a.registeredAt.startsWith(currentMonth)).reduce((sum, a) => sum + (CAMPAIGNS.find((c) => c.id === a.campaignId)?.compensation ?? 0), 0);

  // Previous month calculations for comparison
  const prevMonthStr = (() => {
    const [y, m] = currentMonth.split("-").map(Number);
    const date = new Date(y, m - 2, 1);
    const py = date.getFullYear();
    const pm = String(date.getMonth() + 1).padStart(2, "0");
    return `${py}-${pm}`;
  })();

  const prevProjected =
    resolvedActivity.filter(a => a.registeredAt.startsWith(prevMonthStr)).reduce((sum, a) => sum + (CAMPAIGNS.find((c) => c.id === a.campaignId)?.compensation ?? 0), 0) +
    history.filter(a => a.registeredAt.startsWith(prevMonthStr)).reduce((sum, sum_a) => sum + (CAMPAIGNS.find((c) => c.id === sum_a.campaignId)?.compensation ?? 0), 0);

  let percentChange = 0;
  if (prevProjected > 0) {
    percentChange = ((projected - prevProjected) / prevProjected) * 100;
  }

  const inProgressCampaigns = resolvedActivity.filter((a) => {
    const c = CAMPAIGNS.find((x) => x.id === a.campaignId);
    if (!c) return false;
    return todayStr >= c.executionStart && a.step !== "approved" && a.step !== "step5_review" && !a.proofUploaded;
  });

  const reminders = resolvedActivity
    .filter((a) => a.step !== "approved" && a.step !== "step5_review" && !a.proofUploaded)
    .map((a) => ({ a, c: CAMPAIGNS.find((c) => c.id === a.campaignId)! }))
    .filter((x) => x.c)
    .sort((a, b) => a.c.deadline.localeCompare(b.c.deadline));

  const filteredReminders = reminders.filter(({ c }) => {
    if (timeFilter === "all") return true;
    const deadlineDate = new Date(c.deadline);
    const diffTime = deadlineDate.getTime() - new Date("2026-07-08").getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (timeFilter === "1week") return diffDays >= 0 && diffDays <= 7;
    if (timeFilter === "2weeks") return diffDays >= 0 && diffDays <= 14;
    if (timeFilter === "1month") return diffDays >= 0 && diffDays <= 30;
    return true;
  });

  const overdueCount = resolvedActivity.filter((a) => {
    if (a.step === "approved" || a.step === "step5_review" || a.proofUploaded) return false;
    const c = CAMPAIGNS.find((x) => x.id === a.campaignId);
    return c && todayStr > c.deadline;
  }).length;

  const unreadCount = notifications.filter(n => !n.read).length + overdueCount;

  return (
    <AppShell>
      <div className="bg-gradient-hero text-foreground px-5 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-sm">Welcome back,</div>
            <div className="text-2xl font-bold mt-0.5">{profile.fullName.split(" ")[0]}</div>
          </div>
          <Link to="/notifications" className="h-10 w-10 flex items-center justify-end text-foreground/80 hover:text-foreground active:scale-95 transition-transform relative">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-[-1px] right-[-3px] h-4 min-w-[16px] px-1 rounded-full bg-destructive flex items-center justify-center text-[9px] font-bold text-white leading-none border border-background">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>
        <div className="mt-6 bg-white/50 backdrop-blur rounded-2xl p-4 border border-border/60 flex items-center divide-x divide-border/60">
          {/* Left Column: Earnings */}
          <div className="w-[60%] pr-4 shrink-0">
            <div className="text-[11px] tracking-wider text-muted-foreground font-semibold leading-none">Projected Earnings This Month</div>
            <div className="mt-2 flex items-center justify-between leading-none">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-display text-primary">{formatVND(projected)}</span>
                {prevProjected > 0 && (
                  <span className={`text-[10px] font-bold select-none flex items-center gap-0.5 ${
                    percentChange >= 0 ? "text-success" : "text-destructive"
                  }`}>
                    {percentChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {percentChange.toFixed(0)}%
                  </span>
                )}
              </div>
              <Link to="/earnings" className="text-muted-foreground hover:text-foreground active:scale-95 transition-all">
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Total Campaigns */}
          <div className="w-[40%] pl-4 shrink-0">
            <div className="text-[11px] tracking-wider text-muted-foreground font-semibold leading-none">Total Campaigns</div>
            <div className="mt-2 flex items-center justify-between leading-none">
              <span className="text-2xl font-bold font-display text-primary">{totalCampaignsCount}</span>
              <Link to="/activity" className="text-muted-foreground hover:text-foreground active:scale-95 transition-all">
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="px-5 mt-6">
        <h2 className="text-lg font-semibold mb-3">In-progress Activities</h2>
        {inProgressCampaigns.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground py-6 italic">
            No printing or execution activities in progress.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
            {inProgressCampaigns.map((a) => (
              <div key={a.campaignId} className="w-[280px] shrink-0 snap-start">
                <CampaignCard
                  campaignId={a.campaignId}
                  step={a.step}
                  href={`/activity/${a.campaignId}`}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="px-5 mt-8 pb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <h2 className="text-lg font-semibold leading-none">Timeline</h2>

            <div className="relative flex items-center">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-1.5 rounded-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center ${timeFilter !== "all"
                  ? "text-[#F97316] bg-[#FFF1E8]"
                  : "text-muted-foreground bg-secondary"
                  }`}
              >
                <Filter className="h-4 w-4" />
              </button>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute left-0 top-9 z-50 w-44 bg-card border border-border/60 rounded-xl shadow-lg py-1.5 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setTimeFilter("all");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-secondary transition-colors cursor-pointer ${timeFilter === "all" ? "text-[#F97316] font-bold" : "text-foreground"
                        }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTimeFilter("1week");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-secondary transition-colors cursor-pointer ${timeFilter === "1week" ? "text-[#F97316] font-bold" : "text-[#1E293B]"
                        }`}
                    >
                      Within 1 Week
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTimeFilter("2weeks");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-secondary transition-colors cursor-pointer ${timeFilter === "2weeks" ? "text-[#F97316] font-bold" : "text-[#1E293B]"
                        }`}
                    >
                      Within 2 Weeks
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTimeFilter("1month");
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-secondary transition-colors cursor-pointer ${timeFilter === "1month" ? "text-[#F97316] font-bold" : "text-[#1E293B]"
                        }`}
                    >
                      Within 1 Month
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <Link to="/activity" className="text-sm text-primary font-medium leading-none">View all</Link>
        </div>

        <div>
          <ol className="mt-4 space-y-0">
            {filteredReminders.length === 0 && (
              <li className="text-sm text-muted-foreground px-5">No campaigns match the filter.</li>
            )}
            {filteredReminders.map(({ a, c }, idx) => {
              const isLast = idx === filteredReminders.length - 1;
              const imageUrl = CAMPAIGN_IMAGES[c.id] || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300";
              const dateLabel = getRelativeDateLabel(c.deadline);
              const parts = dateLabel.split(" ");
              const primaryLabel = parts[0];
              const secondaryLabel = parts[1] ? parts[1].replace(/[()]/g, "") : "";

              return (
                <li key={c.id} className="flex gap-1 relative">
                  {/* Left Column: Date (Left-aligned to start at the left page margin) */}
                  <div className="w-[38px] shrink-0 text-left pt-2.5 select-none">
                    <div className="text-xs font-semibold text-foreground leading-tight">
                      {primaryLabel}
                    </div>
                    {secondaryLabel && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-medium leading-none">
                        {secondaryLabel}
                      </div>
                    )}
                  </div>

                  {/* Center Column: Bullet & Connector Line */}
                  <div className="flex flex-col items-center shrink-0 w-4 relative">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F97316] ring-4 ring-[#F97316]/20 mt-3.5 z-10" />
                    <div className="w-[2px] absolute top-6 bottom-0 bg-border/70 left-1/2 -translate-x-1/2" />
                  </div>

                  {/* Right Column: Card */}
                  <div className="flex-1 min-w-0 pt-7 pb-6">
                    <Link
                      to="/activity/$id"
                      params={{ id: c.id }}
                      className="relative block bg-card rounded-2xl border border-border/60 cursor-pointer overflow-hidden shadow-sm"
                    >
                      {/* Status badge absolutely positioned hugging top-right corner */}
                      <span className={`absolute top-0 right-0 text-[10px] font-bold px-3 py-1.5 rounded-bl-xl shrink-0 z-10 ${stepColor[a.step] || "bg-secondary text-secondary-foreground"}`}>
                        {STEP_LABELS[a.step]}
                      </span>

                      <div className="flex h-36">
                        {/* Left: 40% Image */}
                        <div className="w-[40%] h-full shrink-0 relative overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={c.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5" />
                        </div>

                        {/* Right: 60% Content */}
                        <div className="w-[60%] p-3 flex flex-col justify-start min-w-0">
                          <div className="min-w-0 pr-16">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate mb-1">{c.brand}</div>
                            <h3 className="font-semibold text-sm leading-snug text-foreground mt-0.5 truncate" title={c.title}>
                              {c.title}
                            </h3>
                          </div>

                          <div className="space-y-1 text-xs text-muted-foreground mt-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                              <span className="truncate">{c.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Store className="h-3.5 w-3.5 shrink-0 opacity-70" />
                              <span className="truncate">{c.retailer}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </AppShell>
  );
}


