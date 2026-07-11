import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
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
  return (
    <AppShell>
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center gap-3 h-14 px-5">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history && window.history.length > 1) {
                window.history.back();
              } else {
                navigate({ to: "/activity" });
              }
            }}
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">Activity History</h1>
        </div>
      </header>

      <div className="px-5 pt-4 space-y-3">
        {history.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-16">No completed campaigns yet.</div>
        )}
        {history.map((a) => (
          <CampaignCard key={a.campaignId} campaignId={a.campaignId} step={a.step} href={`/activity/${a.campaignId}`} />
        ))}
      </div>
    </AppShell>
  );
}
