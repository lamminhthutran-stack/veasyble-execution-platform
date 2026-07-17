import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CampaignCard } from "@/components/CampaignCard";
import { useStore } from "@/lib/store";
import { Clock3 } from "lucide-react";
import { useState } from "react";
import { STEP_LABELS, type CampaignStep } from "@/lib/mock-data";

export const Route = createFileRoute("/activity/")({
  head: () => ({
    meta: [
      { title: "Activity — Veasyble Executor" },
      { name: "description", content: "Track your in-progress campaign executions." },
    ],
  }),
  component: Activity,
});

const filters: Array<CampaignStep | "All"> = ["All", "registered", "printing", "execution", "review"];

function Activity() {
  const { activity } = useStore();
  const [selectedStage, setSelectedStage] = useState<CampaignStep | "All">("All");

  const filteredActivity = selectedStage === "All" ? activity : activity.filter((a) => a.step === selectedStage);

  return (
    <AppShell
      title="Activity"
      right={
        <Link to="/history" className="flex items-center gap-1 text-sm font-semibold text-primary">
          <Clock3 className="h-4 w-4" /> History
        </Link>
      }
    >
      <div className="px-5 pt-4">
        <div className="-mx-5 mb-1 flex items-center gap-2 overflow-x-auto px-5 pb-3">
          {filters.map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedStage === stage ? "bg-primary text-primary-foreground" : "border border-border/70 bg-card text-foreground shadow-sm"
              }`}
            >
              {stage === "All" ? "All" : STEP_LABELS[stage]}
            </button>
          ))}
        </div>

        <div className="space-y-3 pb-20">
          {activity.length === 0 && (
            <div className="rounded border border-border/70 bg-card py-12 text-center">
              <div className="text-sm text-muted-foreground">No in-progress campaigns.</div>
              <Link to="/marketplace" className="mt-3 inline-block text-sm font-semibold text-primary">
                Browse Explore
              </Link>
            </div>
          )}
          {activity.length > 0 && filteredActivity.length === 0 && (
            <div className="rounded border border-border/70 bg-card py-12 text-center text-sm text-muted-foreground">
              No campaigns in this stage.
            </div>
          )}
          {filteredActivity.map((a) => (
            <CampaignCard key={a.campaignId} campaignId={a.campaignId} step={a.step} href={`/activity/${a.campaignId}`} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
