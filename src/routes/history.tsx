import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CampaignCard } from "@/components/CampaignCard";
import { useStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [{ title: "History — Veasyble Executor" }],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { history } = useStore();
  const navigate = useNavigate();
  return (
    <AppShell
      title="History"
      right={
        <button onClick={() => navigate({ to: "/activity" })} className="text-sm text-primary font-semibold flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Activity
        </button>
      }
    >
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
