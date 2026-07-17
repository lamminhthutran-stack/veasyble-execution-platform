import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CAMPAIGNS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import {
  CampaignInfoCard,
  DescriptionSection,
  MediaSpaces,
  PlannedTimeline,
} from "@/components/CampaignSections";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/campaign/$id")({
  component: CampaignDetail,
});

function CampaignDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const campaign = CAMPAIGNS.find((x) => x.id === id);
  const { activity, history, register, status } = useStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const alreadyRegistered = [...activity, ...history].some((a) => a.campaignId === id);

  if (!campaign) {
    return (
      <div className="p-6">
        <p>Campaign not found.</p>
        <Link to="/marketplace" className="text-primary">Back to Explore</Link>
      </div>
    );
  }

  function onConfirmRegister() {
    const result = register(campaign!.id);
    setConfirmOpen(false);
    if (!result.ok) {
      toast(result.message);
      return;
    }
    toast(result.message);
    navigate({ to: "/activity" });
  }

  return (
    <div className="mx-auto max-w-md min-h-screen bg-background pb-32">
      <div className="relative h-64 overflow-hidden">
        <img src={campaign.heroImage} alt={campaign.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/25" />
        <button
          onClick={() => navigate({ to: "/marketplace" })}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur"
          aria-label="Back to Explore"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="relative z-10 -mt-10 px-5">
        <CampaignInfoCard campaign={campaign} />
      </div>

      <DescriptionSection campaign={campaign} />
      <PlannedTimeline campaign={campaign} />
      <MediaSpaces campaign={campaign} />

      <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-border bg-background/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
        {alreadyRegistered ? (
          <button disabled className="flex h-12 w-full items-center justify-center gap-2 rounded bg-muted font-semibold text-muted-foreground">
            <CheckCircle2 className="h-5 w-5" /> Already registered
          </button>
        ) : (
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={status === "paused" || status === "deactivated"}
            className="h-12 w-full rounded bg-primary font-semibold text-primary-foreground shadow-card disabled:bg-muted disabled:text-muted-foreground"
          >
            Register
          </button>
        )}
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center">
          <div className="w-full max-w-md rounded bg-card p-5 shadow-elevated">
            <h2 className="text-lg font-semibold">Are you sure you want to register for this campaign?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You cannot cancel or unregister after committing, so please confirm before continuing.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmOpen(false)} className="h-11 rounded border border-border text-sm font-semibold">
                Cancel
              </button>
              <button onClick={onConfirmRegister} className="h-11 rounded bg-primary text-sm font-semibold text-primary-foreground">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
