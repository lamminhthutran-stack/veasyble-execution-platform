import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { CAMPAIGNS, formatVND } from "@/lib/mock-data";
import { Download, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/earnings")({
  head: () => ({
    meta: [{ title: "Earnings — Veasyble Executor" }, { name: "description", content: "Track your earnings and payout history." }],
  }),
  component: Earnings,
});

function Earnings() {
  const { activity, history } = useStore();

  const pending = activity.reduce((s, a) => s + (CAMPAIGNS.find((c) => c.id === a.campaignId)?.compensation ?? 0), 0);
  const paid = history.reduce((s, a) => s + (CAMPAIGNS.find((c) => c.id === a.campaignId)?.compensation ?? 0), 0);

  const payouts = [
    { id: "P-2606", date: "2026-06-30", amount: paid, status: "paid" as const, count: history.length },
    { id: "P-2607", date: "2026-07-31", amount: pending, status: "pending" as const, count: activity.length },
  ];

  return (
    <AppShell title="Earnings & Payout">
      <div className="px-5 pt-4">
        <div className="bg-gradient-hero text-white rounded-2xl p-5 shadow-elevated">
          <div className="text-white/80 text-xs uppercase font-semibold tracking-wider">Running monthly total</div>
          <div className="mt-1 text-3xl font-bold font-display">{formatVND(pending + paid)}</div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/12 rounded-xl p-3 backdrop-blur">
              <div className="text-white/80 text-[11px] uppercase tracking-wider">Pending</div>
              <div className="mt-1 font-bold">{formatVND(pending)}</div>
            </div>
            <div className="bg-white/12 rounded-xl p-3 backdrop-blur">
              <div className="text-white/80 text-[11px] uppercase tracking-wider">Paid</div>
              <div className="mt-1 font-bold">{formatVND(paid)}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="px-5 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Per-campaign earnings</h2>
        <div className="mt-3 space-y-2">
          {[...history, ...activity].map((a) => {
            const c = CAMPAIGNS.find((x) => x.id === a.campaignId);
            if (!c) return null;
            const paidRow = a.step === "approved";
            return (
              <div key={a.campaignId} className="bg-card rounded-xl border border-border/60 p-3 shadow-card flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: c.brandColor }}>
                  {c.brand.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.retailer}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{formatVND(c.compensation)}</div>
                  <div className={`text-[10px] font-semibold uppercase ${paidRow ? "text-success" : "text-muted-foreground"}`}>
                    {paidRow ? "Paid" : "Pending"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 mt-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Payout history</h2>
        <div className="mt-3 space-y-2">
          {payouts.map((p) => (
            <div key={p.id} className="bg-card rounded-xl border border-border/60 p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">{p.date} • {p.count} campaign{p.count !== 1 ? "s" : ""}</div>
                  <div className="mt-0.5 font-semibold">Batch {p.id}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-display">{formatVND(p.amount)}</div>
                  <div className={`text-[11px] font-semibold flex items-center gap-1 justify-end ${p.status === "paid" ? "text-success" : "text-warning-foreground"}`}>
                    {p.status === "paid" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {p.status}
                  </div>
                </div>
              </div>
              {p.status === "paid" && (
                <button className="mt-3 w-full h-10 rounded-lg bg-secondary text-sm font-medium flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" /> Download invoice
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
