import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CampaignCard } from "@/components/CampaignCard";
import { CAMPAIGNS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Explore — Veasyble Executor" },
      { name: "description", content: "Browse and register for available retail campaigns." },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const [tab, setTab] = useState<"recommended" | "all">("recommended");
  const [q, setQ] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const { activity, history, status } = useStore();

  const takenIds = new Set([...activity, ...history].map((a) => a.campaignId));

  const list = useMemo(() => {
    return CAMPAIGNS.filter((c) => !takenIds.has(c.id))
      .filter((c) => (tab === "recommended" ? c.recommended && c.distanceKm <= 10 : true))
      .filter((c) => {
        const s = q.toLowerCase();
        return !s || c.title.toLowerCase().includes(s) || c.brand.toLowerCase().includes(s) || c.retailer.toLowerCase().includes(s);
      })
      .filter((c) => !location || c.location.toLowerCase().includes(location.toLowerCase()) || c.city.toLowerCase().includes(location.toLowerCase()))
      .filter((c) => {
        if (!dateRange) return true;
        if (dateRange === "week") return c.registrationDeadline <= "2026-07-24";
        if (dateRange === "month") return c.registrationDeadline <= "2026-08-17";
        return true;
      })
      .filter((c) => {
        if (!priceRange) return true;
        if (priceRange === "low") return c.compensation < 300000;
        if (priceRange === "mid") return c.compensation >= 300000 && c.compensation <= 500000;
        return c.compensation > 500000;
      });
  }, [tab, q, location, dateRange, priceRange, takenIds]);

  function clearAll() {
    setLocation("");
    setDateRange("");
    setPriceRange("");
  }

  return (
    <AppShell title="Explore">
      <div className="px-5 pt-4 pb-20">
        <div className="flex gap-2">
          <div className="flex h-11 flex-1 items-center gap-2 rounded border border-input bg-card px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <button onClick={() => setFiltersOpen(true)} className="flex h-11 w-11 items-center justify-center rounded border border-input bg-card">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex border-b border-border">
          {(["recommended", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative h-10 flex-1 text-sm font-semibold ${
                tab === t ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary" : "text-muted-foreground"
              }`}
            >
              {t === "recommended" ? "Recommended" : "All"}
            </button>
          ))}
        </div>

        {status === "paused" && (
          <div className="mt-4 rounded border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
            Your account is paused. You can browse campaigns, but registration is disabled until you resume.
          </div>
        )}

        <div className="mt-4 space-y-3">
          {list.map((c) => (
            <CampaignCard key={c.id} campaignId={c.id} href={`/campaign/${c.id}`} mode="explore" />
          ))}
          {list.length === 0 && (
            <div className="rounded border border-border/70 bg-card p-6 text-center text-sm text-muted-foreground">
              {tab === "recommended" ? (
                <>
                  No matching recommendations right now.{" "}
                  <button onClick={() => setTab("all")} className="font-semibold text-primary">View All.</button>
                </>
              ) : (
                "No campaigns match your search and filters."
              )}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 rounded-t bg-background p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Filter campaigns</h2>
              <button onClick={() => setFiltersOpen(false)} className="flex h-9 w-9 items-center justify-center rounded bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <Field label="Location" value={location} onChange={setLocation} placeholder="City, district, retailer…" />
              <Select label="Date range" value={dateRange} onChange={setDateRange} options={[["", "Any date"], ["week", "Within 1 week"], ["month", "Within 1 month"]]} />
              <Select label="Price range" value={priceRange} onChange={setPriceRange} options={[["", "Any price"], ["low", "Under 300.000đ"], ["mid", "300.000đ - 500.000đ"], ["high", "Over 500.000đ"]]} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button onClick={clearAll} className="h-11 rounded border border-border text-sm font-semibold">Clear all</button>
              <button onClick={() => setFiltersOpen(false)} className="h-11 rounded bg-primary text-sm font-semibold text-primary-foreground">Apply</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1.5 h-11 w-full rounded border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 h-11 w-full rounded border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
        {options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </label>
  );
}
