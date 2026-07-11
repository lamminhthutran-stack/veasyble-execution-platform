import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CampaignCard } from "@/components/CampaignCard";
import { useStore, stepOrder, resolveActivityStep } from "@/lib/store";
import { History } from "lucide-react";
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

function Activity() {
  const { activity } = useStore();
  
  // Dynamically resolve current campaign steps based on date rules
  const resolvedActivity = activity.map(a => ({
    ...a,
    step: resolveActivityStep(a)
  }));

  const [selectedStage, setSelectedStage] = useState<CampaignStep | "All">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "step1_registered") {
        return "step1_registered";
      }
    }
    return "All";
  });

  const availableStages = stepOrder;

  const filteredActivity = selectedStage === "All" 
    ? resolvedActivity 
    : resolvedActivity.filter(a => a.step === selectedStage);

  return (
    <AppShell
      title="Activity"
      right={
        <Link to="/history" className="flex items-center gap-1 text-sm text-primary font-semibold">
          <History className="h-4 w-4" /> History
        </Link>
      }
    >
      <div className="px-5 pt-4">
        {/* Filter Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-1 -mx-5 px-5">
          <button 
            onClick={() => setSelectedStage("All")}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedStage === "All" ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border/60 shadow-sm hover:bg-muted"}`}
          >
            All
          </button>
          {availableStages.map(stage => (
            <button 
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedStage === stage ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border/60 shadow-sm hover:bg-muted"}`}
            >
              {STEP_LABELS[stage]}
            </button>
          ))}
        </div>

        <div className="space-y-3 pb-20">
          {resolvedActivity.length === 0 && (
            <div className="text-center py-16">
              <div className="text-sm text-muted-foreground">No in-progress campaigns.</div>
              <Link to="/marketplace" className="inline-block mt-3 text-primary font-semibold text-sm">
                Browse the marketplace →
              </Link>
            </div>
          )}
          {resolvedActivity.length > 0 && filteredActivity.length === 0 && (
            <div className="text-center py-16">
              <div className="text-sm text-muted-foreground">No campaigns in this stage.</div>
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
