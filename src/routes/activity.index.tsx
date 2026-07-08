import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CampaignCard } from "@/components/CampaignCard";
import { useStore } from "@/lib/store";
import { History } from "lucide-react";

export const Route = createFileRoute("/activity/")({
  head: () => ({
    meta: [
      { title: "Activity — Veasyble Executor" },
      { name: "description", content: "Track your in-progress campaign executions." },
    ],
  }),
  component: Activity,
});

function Activity() {
  const { activity } = useStore();
  return (
    <AppShell
      title="Activity"
      right={
        <Link to="/history" className="flex items-center gap-1 text-sm text-primary font-semibold">
          <History className="h-4 w-4" /> History
        </Link>
      }
    >
      <div className="px-5 pt-4 space-y-3">
        {activity.length === 0 && (
          <div className="text-center py-16">
            <div className="text-sm text-muted-foreground">No in-progress campaigns.</div>
            <Link to="/marketplace" className="inline-block mt-3 text-primary font-semibold text-sm">
              Browse the marketplace →
            </Link>
          </div>
        )}
        {activity.map((a) => (
          <CampaignCard key={a.campaignId} campaignId={a.campaignId} step={a.step} href={`/activity/${a.campaignId}`} />
        ))}
      </div>
    </AppShell>
  );
}
