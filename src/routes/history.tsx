import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CampaignCard } from "@/components/CampaignCard";
import { useStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [{ title: "Activity History — Veasyble Executor" }],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { history } = useStore();
  const navigate = useNavigate();
  const sorted = [...history].sort((a, b) => (b.approvedAt ?? b.registeredAt).localeCompare(a.approvedAt ?? a.registeredAt));
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen bg-background pb-24 relative">
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60">
          <div className="flex items-center gap-4 h-14 px-5">
            <button onClick={() => navigate({ to: "/activity" })} className="flex h-9 w-9 items-center justify-center" aria-label="Back to Activity">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold tracking-tight">Activity History</h1>
          </div>
        </header>
      <div className="space-y-3 px-5 pt-4 pb-20">
        {sorted.length === 0 && (
          <div className="rounded border border-border/70 bg-card py-16 text-center text-sm text-muted-foreground">
            No completed campaigns yet.
          </div>
        )}
        {sorted.map((a) => (
          <CampaignCard key={a.campaignId} campaignId={a.campaignId} step="approved" href={`/activity/${a.campaignId}`} />
        ))}
      </div>
      </div>
    </div>
  );
}
