import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { CAMPAIGNS, formatVND } from "@/lib/mock-data";
import { CalendarIcon, Check, CheckCircle2, Clock, Download, Filter } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/earnings")({
  head: () => ({
    meta: [{ title: "Earnings & Payout — Veasyble Executor" }, { name: "description", content: "Track your earnings and payout history." }],
  }),
  component: Earnings,
});

type EarnStatus = "All" | "In Progress" | "Pending" | "Paid";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function Earnings() {
  const { activity, history } = useStore();
  const [selectedMonth, setSelectedMonth] = useState("2026-07");
  const [monthOpen, setMonthOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<EarnStatus>("All");

  const rows = useMemo(() => {
    const activeRows = activity
      .filter((a) => a.registeredAt.startsWith(selectedMonth))
      .map((entry) => ({ entry, status: "In Progress" as EarnStatus }));
    const historyRows = history
      .filter((a) => (a.approvedAt ?? a.registeredAt).startsWith(selectedMonth))
      .map((entry) => ({ entry, status: entry.paidAt ? ("Paid" as EarnStatus) : ("Pending" as EarnStatus) }));
    return [...historyRows, ...activeRows].filter((row) => statusFilter === "All" || row.status === statusFilter);
  }, [activity, history, selectedMonth, statusFilter]);

  const allMonthRows = useMemo(() => {
    const activeRows = activity
      .filter((a) => a.registeredAt.startsWith(selectedMonth))
      .map((entry) => ({ entry, status: "In Progress" as EarnStatus }));
    const historyRows = history
      .filter((a) => (a.approvedAt ?? a.registeredAt).startsWith(selectedMonth))
      .map((entry) => ({ entry, status: entry.paidAt ? ("Paid" as EarnStatus) : ("Pending" as EarnStatus) }));
    return [...historyRows, ...activeRows];
  }, [activity, history, selectedMonth]);

  const totals = allMonthRows.reduce(
    (acc, row) => {
      const amount = CAMPAIGNS.find((c) => c.id === row.entry.campaignId)?.compensation ?? 0;
      acc.projected += amount;
      if (row.status === "In Progress") acc.running += amount;
      if (row.status === "Pending") acc.pending += amount;
      if (row.status === "Paid") acc.paid += amount;
      return acc;
    },
    { projected: 0, running: 0, pending: 0, paid: 0 },
  );

  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(`${selectedMonth}-01T00:00:00`));
  const batchId = `P-${selectedMonth.replace("-", "").slice(2)}`;
  const batchStatus = selectedMonth < "2026-07" ? "Paid" : "Pending";

  return (
    <AppShell title="Earnings & Payout">
      <div className="px-5 pt-4 pb-20">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold">Select Month</h2>
          <div className="relative">
            <button onClick={() => setMonthOpen((open) => !open)} className="flex h-12 min-w-44 items-center justify-between gap-3 rounded border border-border bg-card px-4 text-sm font-semibold shadow-sm">
              <span>{monthLabel}</span>
              <CalendarIcon className="h-4 w-4" />
            </button>
            {monthOpen && (
              <div className="absolute right-0 top-12 z-20 w-72 rounded border border-border bg-card p-4 shadow-elevated">
                <div className="text-center font-semibold">2026</div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {months.map((month, index) => {
                    const value = `2026-${String(index + 1).padStart(2, "0")}`;
                    return (
                      <button
                        key={month}
                        onClick={() => {
                          setSelectedMonth(value);
                          setMonthOpen(false);
                        }}
                        className={`h-9 rounded text-sm font-semibold ${selectedMonth === value ? "bg-blue-600 text-white" : "bg-secondary"}`}
                      >
                        {month}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex justify-between text-sm font-semibold text-primary">
                  <button onClick={() => setSelectedMonth("2026-07")}>This month</button>
                  <button onClick={() => setMonthOpen(false)}>Clear</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[20px] border border-border/80 bg-card shadow-card">
          <div className="grid grid-cols-2">
            <Metric label="Projected Earnings" value={formatVND(totals.projected)} sub="↗ 17% vs last month" className="border-b border-r border-border/60" />
            <Metric label="Running Monthly Total" value={formatVND(totals.running)} className="border-b border-border/60" />
            <Metric label="Pending" value={formatVND(totals.pending)} className="border-r border-border/60" />
            <Metric label="Paid" value={formatVND(totals.paid)} />
          </div>
        </div>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">Per-campaign Earnings</h2>
            <div className="relative">
              <button onClick={() => setFilterOpen((open) => !open)} className="flex h-8 w-8 items-center justify-center rounded bg-secondary">
                <Filter className="h-4 w-4" />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-9 z-20 w-40 rounded border border-border bg-card p-1 shadow-elevated">
                  {(["All", "In Progress", "Pending", "Paid"] as EarnStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setFilterOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm"
                    >
                      {status}
                      {statusFilter === status && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mt-2">
            {rows.length === 0 ? (
              <div className="rounded border border-border/70 bg-card p-6 text-center text-sm text-muted-foreground">
                No campaigns found for this month.
              </div>
            ) : (
              rows.map(({ entry, status }) => {
                const c = CAMPAIGNS.find((x) => x.id === entry.campaignId);
                if (!c) return null;
                return (
                  <div key={`${entry.campaignId}-${status}`} className="flex items-center gap-3 border-b border-border/50 py-3 last:border-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded text-xs font-bold text-white" style={{ backgroundColor: c.brandColor }}>
                      {c.brand.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.retailer}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{formatVND(c.compensation)}</div>
                      <div className={`text-[11px] font-semibold ${status === "Paid" ? "text-success" : status === "Pending" ? "text-primary" : "text-foreground"}`}>{status}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {allMonthRows.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-muted-foreground">Payout History</h2>
            <div className="mt-2 rounded border border-border/70 bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">End of {selectedMonth} • {allMonthRows.length} campaigns</div>
                  <div className="mt-0.5 font-semibold">Batch {batchId}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold">{formatVND(totals.pending + totals.paid)}</div>
                  <div className={`flex items-center justify-end gap-1 text-[11px] font-semibold ${batchStatus === "Paid" ? "text-success" : "text-primary"}`}>
                    {batchStatus === "Paid" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />} {batchStatus}
                  </div>
                </div>
              </div>
              {batchStatus === "Paid" && (
                <button className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded bg-secondary text-sm font-semibold">
                  <Download className="h-4 w-4" /> Download invoice
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function Metric({ label, value, sub, className = "" }: { label: string; value: string; sub?: string; className?: string }) {
  return (
    <div className={`min-h-[110px] bg-card p-4 ${className}`}>
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg font-bold text-primary">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] font-semibold text-success">{sub}</div>}
    </div>
  );
}
