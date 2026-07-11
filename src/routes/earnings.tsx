import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore, resolveActivityStep } from "@/lib/store";
import { CAMPAIGNS, formatVND } from "@/lib/mock-data";
import { Download, CheckCircle2, Clock, CalendarIcon, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/earnings")({
  head: () => ({
    meta: [{ title: "Earnings — Veasyble Executor" }, { name: "description", content: "Track your earnings and payout history." }],
  }),
  component: Earnings,
});

function Earnings() {
  const { activity, history } = useStore();
  const [selectedMonth, setSelectedMonth] = useState("2026-07");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_progress" | "pending" | "paid">("all");

  const filteredActivity = activity.filter(a => a.registeredAt.startsWith(selectedMonth));
  const filteredHistory = history.filter(a => a.registeredAt.startsWith(selectedMonth));

  const resolvedFilteredActivity = filteredActivity.map(a => ({
    ...a,
    step: resolveActivityStep(a)
  }));

  const allCampaigns = [
    ...filteredHistory.map(a => ({ ...a, step: "approved" as const })),
    ...resolvedFilteredActivity
  ];

  const displayedCampaigns = allCampaigns.filter((a) => {
    const isPaid = a.step === "approved" && a.registeredAt.startsWith("2026-06");
    const isPending = a.step === "step5_review" || (a.step === "approved" && !isPaid);

    if (statusFilter === "all") return true;
    if (statusFilter === "paid") return isPaid;
    if (statusFilter === "pending") return isPending;
    if (statusFilter === "in_progress") {
      return a.step !== "approved" && a.step !== "step5_review";
    }
    return true;
  });

  const pending = 
    resolvedFilteredActivity.filter(a => a.step === "step5_review").reduce((s, a) => s + (CAMPAIGNS.find((c) => c.id === a.campaignId)?.compensation ?? 0), 0) +
    filteredHistory.filter(a => a.registeredAt.startsWith("2026-07")).reduce((s, a) => s + (CAMPAIGNS.find((c) => c.id === a.campaignId)?.compensation ?? 0), 0);

  const paid = filteredHistory.filter(a => !a.registeredAt.startsWith("2026-07")).reduce((s, a) => s + (CAMPAIGNS.find((c) => c.id === a.campaignId)?.compensation ?? 0), 0);

  function getPreviousMonth(monthStr: string) {
    const [y, m] = monthStr.split("-").map(Number);
    const date = new Date(y, m - 2, 1);
    const py = date.getFullYear();
    const pm = String(date.getMonth() + 1).padStart(2, "0");
    return `${py}-${pm}`;
  }

  function getProjectedForMonth(monthStr: string, activityList: any[], historyList: any[]) {
    const actSum = activityList
      .filter(a => a.registeredAt.startsWith(monthStr))
      .map(a => ({ ...a, step: resolveActivityStep(a) }))
      .reduce((s, a) => s + (CAMPAIGNS.find(c => c.id === a.campaignId)?.compensation ?? 0), 0);
    const histSum = historyList
      .filter(a => a.registeredAt.startsWith(monthStr))
      .reduce((s, a) => s + (CAMPAIGNS.find(c => c.id === a.campaignId)?.compensation ?? 0), 0);
    return actSum + histSum;
  }

  const prevMonthStr = getPreviousMonth(selectedMonth);
  const thisMonthProjected = getProjectedForMonth(selectedMonth, activity, history);
  const prevMonthProjected = getProjectedForMonth(prevMonthStr, activity, history);

  let percentChange = 0;
  if (prevMonthProjected > 0) {
    percentChange = ((thisMonthProjected - prevMonthProjected) / prevMonthProjected) * 100;
  }

  const allPayouts = [
    { id: "P-2606", date: "2026-06-30", month: "2026-06", amount: 1620000, status: "paid" as const, count: 3 },
    { id: "P-2607", date: "2026-07-31", month: "2026-07", amount: 540000, status: "pending" as const, count: 2 },
  ];

  // If we dynamically calculate payouts based on history, we can match the month. 
  // Let's just generate a payout card for the selected month to keep it simple.
  const currentPayoutAmount = paid + pending;
  const currentPayoutStatus = selectedMonth < "2026-07" ? "paid" : "pending";
  const currentPayoutCount = filteredHistory.length + filteredActivity.length;

  return (
    <AppShell title="Earnings & Payout">
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Select Month</h2>
          <div className="relative">
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-card border border-border/60 text-sm font-medium rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        {/* 2x2 layout containing the 4 monthly metrics separated by vertical divider borders */}
        <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-card text-sm">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-border/40">
            {/* 1. Projected Earnings */}
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-muted-foreground leading-none">Projected Earnings</div>
              <div className="flex flex-col mt-1">
                <span className="text-[16px] font-bold font-display text-primary leading-none">
                  {formatVND(thisMonthProjected)}
                </span>
                {prevMonthProjected > 0 && (
                  <span className={`text-[9px] font-bold mt-0.5 leading-none select-none flex items-center gap-0.5 ${
                    percentChange >= 0 ? "text-success" : "text-destructive"
                  }`}>
                    {percentChange >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                    {percentChange.toFixed(0)}% vs last month
                  </span>
                )}
              </div>
            </div>

            {/* 2. Running Monthly Total */}
            <div className="space-y-1 pl-4 border-l border-border/40">
              <div className="text-[10px] font-semibold text-muted-foreground leading-none">Running Monthly Total</div>
              <div className="text-[16px] font-bold font-display text-primary mt-1">
                {formatVND(pending + paid)}
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4 pt-3">
            {/* 3. Pending */}
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-muted-foreground leading-none">Pending</div>
              <div className="text-[16px] font-bold font-display text-primary mt-1">
                {formatVND(pending)}
              </div>
            </div>

            {/* 4. Paid */}
            <div className="space-y-1 pl-4 border-l border-border/40">
              <div className="text-[10px] font-semibold text-muted-foreground leading-none">Paid</div>
              <div className="text-[16px] font-bold font-display text-primary mt-1">
                {formatVND(paid)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Per-campaign Earnings</h2>
            <div className="relative h-7 w-7 flex items-center justify-center rounded-lg bg-secondary/80 hover:bg-secondary active:scale-95 transition-transform cursor-pointer">
              <Filter className="h-4 w-4 text-foreground/80" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                <option value="all">All</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          {statusFilter !== "all" && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
              {statusFilter === "in_progress" ? "In Progress" : statusFilter}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-col">
          {displayedCampaigns.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">
              No campaigns found matching filter.
            </div>
          ) : (
            displayedCampaigns.map((a) => {
              const c = CAMPAIGNS.find((x) => x.id === a.campaignId);
              if (!c) return null;
              const paidRow = a.step === "approved";
              return (
                <div key={a.campaignId} className="py-3 flex items-center gap-3 border-b border-border/40 last:border-0">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: c.brandColor }}>
                    {c.brand.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.retailer}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{formatVND(c.compensation)}</div>
                    {(() => {
                      const isPaid = a.step === "approved" && a.registeredAt.startsWith("2026-06");
                      const isPending = a.step === "step5_review" || a.proofUploaded || (a.step === "approved" && !isPaid);
                      return (
                        <div className={`text-[10px] font-semibold ${
                          isPaid 
                            ? "text-success" 
                            : isPending 
                              ? "text-amber-600" 
                              : "text-muted-foreground"
                        }`}>
                          {isPaid ? "Paid" : isPending ? "Pending" : "In Progress"}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {currentPayoutCount > 0 && (
        <section className="px-5 mt-8 pb-20">
          <h2 className="text-lg font-semibold text-foreground">Payout History</h2>
          <div className="mt-2 flex flex-col">
            <div className="py-4 border-b border-border/40 last:border-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">End of {selectedMonth} • {currentPayoutCount} campaign{currentPayoutCount !== 1 ? "s" : ""}</div>
                  <div className="mt-0.5 font-semibold">Batch P-{selectedMonth.replace("-", "").slice(2)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-display">{formatVND(currentPayoutAmount)}</div>
                  <div className={`text-[11px] font-semibold flex items-center gap-1 justify-end ${currentPayoutStatus === "paid" ? "text-success" : "text-yellow-600 dark:text-yellow-500"}`}>
                    {currentPayoutStatus === "paid" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {currentPayoutStatus === "paid" ? "Paid" : "Pending"}
                  </div>
                </div>
              </div>
              {currentPayoutStatus === "paid" && (
                <button className="mt-3 w-full h-10 rounded-lg bg-secondary text-sm font-medium flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" /> Download invoice
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </AppShell>
  );
}
