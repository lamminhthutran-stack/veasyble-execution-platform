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
    <AppShell
      title="Marketplace"
      right={
        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end ml-4">
          <div className="flex-1 flex items-center gap-1.5 h-9 rounded-lg bg-secondary border border-border/40 px-2 max-w-[320px] min-w-0">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-xs focus:outline-none placeholder:text-muted-foreground min-w-0 text-foreground"
            />
          </div>
          <button className="h-9 w-9 rounded-lg bg-secondary border border-border/40 flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all">
            <SlidersHorizontal className="h-3.5 w-3.5 text-foreground" />
          </button>
        </div>
      }
    >
      <div className="px-5 pt-3.5">
        <div className="grid grid-cols-2">
          {(["recommended", "all"] as const).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-2 text-sm font-semibold capitalize transition-all cursor-pointer border-b-2 text-center ${
                  active
                    ? "text-primary border-primary font-bold"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {t === "recommended" ? "Recommended" : "All"}
              </button>
            );
          })}
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
