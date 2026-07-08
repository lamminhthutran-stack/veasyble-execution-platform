import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CampaignCard } from "@/components/CampaignCard";
import { CAMPAIGNS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — Veasyble Executor" },
      { name: "description", content: "Browse and register for available retail campaigns." },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const [tab, setTab] = useState<"recommended" | "all">("recommended");
  const [q, setQ] = useState("");
  const { activity, history } = useStore();

  const takenIds = new Set([...activity, ...history].map((a) => a.campaignId));

  const list = useMemo(() => {
    return CAMPAIGNS.filter((c) => !takenIds.has(c.id))
      .filter((c) => (tab === "recommended" ? c.recommended : true))
      .filter((c) => {
        const s = q.toLowerCase();
        return !s || c.title.toLowerCase().includes(s) || c.brand.toLowerCase().includes(s) || c.retailer.toLowerCase().includes(s);
      });
  }, [tab, q, takenIds]);

  return (
    <AppShell title="Marketplace">
      <div className="px-5 pt-4">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 h-11 rounded-xl bg-card border border-input px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search brand, retailer, campaign…"
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <button className="h-11 w-11 rounded-xl bg-card border border-input flex items-center justify-center">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 bg-secondary rounded-xl p-1">
          {(["recommended", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`h-9 rounded-lg text-sm font-semibold capitalize transition-colors ${
                tab === t ? "bg-card shadow-card text-foreground" : "text-muted-foreground"
              }`}
            >
              {t === "recommended" ? "Recommended" : "All"}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {list.map((c) => (
            <CampaignCard key={c.id} campaignId={c.id} href={`/campaign/${c.id}`} />
          ))}
          {list.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-12">No campaigns match your search.</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
