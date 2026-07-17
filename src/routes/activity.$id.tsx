import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CAMPAIGNS,
  formatDate,
  STEP_LABELS,
  stepPeriod,
  type CampaignStep,
  type Proof,
} from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import {
  ACTIVE_STEPS,
  AssetsPanel,
  CampaignInfoCard,
  DescriptionSection,
  ExactTimeline,
  MediaSpaces,
  ProofsSection,
  SectionTitle,
  StepStatusIcon,
} from "@/components/CampaignSections";
import { ArrowLeft, Camera, Folder, Printer, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/activity/$id")({
  component: ActivityDetail,
});

function ActivityDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { activity, history, completePrinting, startSetup, saveProofDraft, submitProof } = useStore();
  const entry = [...activity, ...history].find((a) => a.campaignId === id);
  const campaign = CAMPAIGNS.find((x) => x.id === id);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [proofOpen, setProofOpen] = useState(false);

  const proofCount = entry?.proofs?.length ?? 0;
  const allProofsReady = Boolean(campaign && proofCount >= campaign.mediaSpaces.length);

  if (!campaign || !entry) {
    return <div className="p-6">Not found.</div>;
  }

  function addProof(spaceId: string) {
    const proof: Proof = {
      mediaSpaceId: spaceId,
      notes: "Photo proof added from mobile upload draft.",
      uploadedAt: new Date().toISOString(),
      image: campaign!.mediaSpaces.find((space) => space.id === spaceId)?.showcase[0] ?? campaign!.heroImage,
    };
    saveProofDraft(campaign!.id, proof);
  }

  return (
    <div className="mx-auto max-w-md min-h-screen bg-background pb-36">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <button onClick={() => navigate({ to: history.includes(entry) ? "/history" : "/activity" })} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{campaign.brand} x {campaign.retailer}</div>
            <div className="truncate text-sm font-semibold">{campaign.title}</div>
          </div>
        </div>
      </header>

      <div className="relative h-52 overflow-hidden">
        <img src={campaign.heroImage} alt={campaign.title} className="h-full w-full object-cover" />
      </div>
      <div className="relative z-10 -mt-10 px-5">
        <CampaignInfoCard campaign={campaign} />
      </div>

      <DescriptionSection campaign={campaign} />
      <ExecutionSteps campaignId={campaign.id} onOpenAssets={() => setAssetsOpen(true)} />
      <MediaSpaces campaign={campaign} />
      <ProofsSection campaign={campaign} entry={entry} />
      {entry.step === "approved" && <ExactTimeline entry={entry} />}

      {entry.step !== "approved" && (
        <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 space-y-2 border-t border-border bg-background/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
          {entry.step === "registered" && (
            <div className="rounded bg-secondary p-3 text-center text-sm font-medium text-muted-foreground">
              Printing & Production starts {formatDate(campaign.productionStart)}
            </div>
          )}
          {entry.step === "printing" && (
            <button
              onClick={() => {
                completePrinting(campaign.id);
                toast("Printing & Production marked complete.");
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded bg-primary font-semibold text-primary-foreground"
            >
              <Printer className="h-5 w-5" /> Complete Print and Production
            </button>
          )}
          {entry.step === "execution" && !entry.setupStartedAt && (
            <button
              onClick={() => {
                startSetup(campaign.id);
                toast("Setup start time recorded.");
              }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded bg-primary font-semibold text-primary-foreground"
            >
              <Camera className="h-5 w-5" /> Start Setting Up Campaign
            </button>
          )}
          {entry.step === "execution" && entry.setupStartedAt && (
            <button
              onClick={() => setProofOpen(true)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded border border-primary text-sm font-semibold text-primary"
            >
              <Upload className="h-4 w-4" /> {entry.rejectionReason ? "Resubmit proof" : "Upload photo proofs"}
            </button>
          )}
          {entry.step === "review" && (
            <div className="rounded bg-violet-50 p-3 text-center text-sm font-medium text-violet-700">
              Under review. No executor action is required.
            </div>
          )}
        </div>
      )}

      <AssetsPanel campaign={campaign} open={assetsOpen} onClose={() => setAssetsOpen(false)} />

      {proofOpen && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute bottom-0 left-1/2 max-h-[88vh] w-full max-w-md -translate-x-1/2 overflow-y-auto rounded-t bg-background p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Upload Photo Proof</h2>
              <button onClick={() => setProofOpen(false)} className="h-9 w-9 rounded bg-secondary text-sm font-bold">X</button>
            </div>
            <div className="mt-4 space-y-3">
              {campaign.mediaSpaces.map((space) => {
                const proof = entry.proofs?.find((p) => p.mediaSpaceId === space.id);
                return (
                  <div key={space.id} className="rounded border border-border/70 bg-card p-3">
                    <div className="text-sm font-semibold">{space.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{space.zone} • {space.type}</div>
                    {proof && <div className="mt-2 text-xs font-semibold text-success">Draft proof saved</div>}
                    <button onClick={() => addProof(space.id)} className="mt-3 h-10 w-full rounded bg-secondary text-sm font-semibold">
                      {proof ? "Replace proof" : "Add proof"}
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              disabled={!allProofsReady}
              onClick={() => {
                setProofOpen(false);
                submitProof(campaign.id);
                toast("Proof submitted for admin review.");
              }}
              className="mt-5 h-12 w-full rounded bg-primary font-semibold text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
            >
              Submit Proof & Complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExecutionSteps({ campaignId, onOpenAssets }: { campaignId: string; onOpenAssets: () => void }) {
  const { activity, history } = useStore();
  const entry = [...activity, ...history].find((a) => a.campaignId === campaignId);
  const campaign = CAMPAIGNS.find((item) => item.id === campaignId);
  const rows = useMemo(() => ACTIVE_STEPS, []);

  if (!entry || !campaign) return null;
  const currentIndex = rows.indexOf(entry.step === "approved" ? "review" : entry.step);

  return (
    <section className="px-5 mt-6">
      <SectionTitle>Execution Steps</SectionTitle>
      <ol className="mt-3 relative border-l-2 border-border/70 pl-5 space-y-5">
        {rows.map((step, index) => {
          const done = entry.step === "approved" || index < currentIndex || isExplicitlyDone(step, entry);
          const active = entry.step !== "approved" && step === entry.step;
          return (
            <li key={step} className="relative">
              <StepStatusIcon done={done} active={active} />
              <div className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>{STEP_LABELS[step]}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{done ? doneLabel(step, entry) : stepPeriod(campaign, step)}</div>
              {active && step === "printing" && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-muted-foreground">Print resources and prepare for production setup.</p>
                  <AssetButton onClick={onOpenAssets}>Access Campaign Assets</AssetButton>
                </div>
              )}
              {active && step === "execution" && (
                <div className="mt-2 space-y-2">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Camera className="h-3.5 w-3.5" /> Go to the retailer and start execution setup.
                  </p>
                  <AssetButton onClick={onOpenAssets}>View Campaign Assets</AssetButton>
                </div>
              )}
              {entry.rejectionReason && step === "execution" && (
                <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <div className="font-semibold">Rejected proof reason</div>
                  <div className="mt-1">{entry.rejectionReason}</div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function AssetButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex h-9 items-center gap-2 rounded border border-border bg-card px-3 text-xs font-semibold text-primary">
      <Folder className="h-4 w-4" /> {children}
    </button>
  );
}

function isExplicitlyDone(step: CampaignStep, entry: { printingCompletedAt?: string; setupStartedAt?: string; proofSubmittedAt?: string }) {
  if (step === "registered") return true;
  if (step === "printing") return Boolean(entry.printingCompletedAt);
  if (step === "execution") return Boolean(entry.proofSubmittedAt);
  return false;
}

function doneLabel(step: CampaignStep, entry: { registeredAt: string; printingCompletedAt?: string; setupStartedAt?: string; proofSubmittedAt?: string; approvedAt?: string }) {
  if (step === "registered") return `Registered on ${formatDate(entry.registeredAt)}`;
  if (step === "printing") return `Printing completed on ${formatDate(entry.printingCompletedAt ?? entry.registeredAt)}`;
  if (step === "execution") return `Proof submitted on ${formatDate(entry.proofSubmittedAt ?? entry.setupStartedAt ?? entry.registeredAt)}`;
  if (step === "review" && entry.approvedAt) return `Approved on ${formatDate(entry.approvedAt)}`;
  return "Completed";
}
