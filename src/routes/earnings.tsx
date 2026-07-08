import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { CAMPAIGNS, formatVND } from "@/lib/mock-data";
import { Download, CheckCircle2, Clock, CalendarIcon } from "lucide-react";
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

  const filteredActivity = activity.filter(a => a.registeredAt.startsWith(selectedMonth));
  const filteredHistory = history.filter(a => a.registeredAt.startsWith(selectedMonth));

  const pending = filteredActivity.reduce((s, a) => s + (CAMPAIGNS.find((c) => c.id === a.campaignId)?.compensation ?? 0), 0);
  const paid = filteredHistory.reduce((s, a) => s + (CAMPAIGNS.find((c) => c.id === a.campaignId)?.compensation ?? 0), 0);

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

        <div className="bg-gradient-hero text-foreground rounded-2xl p-5 shadow-elevated">
          <div className="text-foreground/80 text-xs font-semibold tracking-wider">Running Monthly Total</div>
          <div className="mt-1 text-3xl font-bold font-display">{formatVND(pending + paid)}</div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/40 rounded-xl p-3 backdrop-blur border border-white/20">
              <div className="text-foreground/80 text-[11px] tracking-wider">Pending</div>
              <div className="mt-1 font-bold">{formatVND(pending)}</div>
            </div>
            <div className="bg-white/40 rounded-xl p-3 backdrop-blur border border-white/20">
              <div className="text-foreground/80 text-[11px] tracking-wider">Paid</div>
              <div className="mt-1 font-bold">{formatVND(paid)}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="px-5 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground tracking-wide">Per-campaign Earnings</h2>
        <div className="mt-2 flex flex-col">
          {[...filteredHistory, ...filteredActivity].length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">
              No campaigns found for this month.
            </div>
          ) : (
            [...filteredHistory, ...filteredActivity].map((a) => {
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
                    <div className={`text-[10px] font-semibold ${paidRow ? "text-success" : "text-yellow-600 dark:text-yellow-500"}`}>
                      {paidRow ? "Paid" : "Pending"}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {currentPayoutCount > 0 && (
        <section className="px-5 mt-8 pb-20">
          <h2 className="text-sm font-semibold text-muted-foreground tracking-wide">Payout History</h2>
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
