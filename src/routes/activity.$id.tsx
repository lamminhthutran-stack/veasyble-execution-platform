import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CAMPAIGNS, formatVND, STEP_LABELS, type CampaignStep } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, Camera } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/activity/$id")({
  component: ActivityDetail,
});

const flow: CampaignStep[] = [
  "step1_registered",
  "step2_printing",
  "step3_execution",
  "step4_completed",
  "step5_review",
];

function ActivityDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { activity, history, advanceStep, submitProof, approve, reject } = useStore();
  const entry = [...activity, ...history].find((a) => a.campaignId === id);
  const c = CAMPAIGNS.find((x) => x.id === id);
  const [confirmingReject, setConfirmingReject] = useState(false);

  if (!c || !entry) {
    return <div className="p-6">Not found.</div>;
  }

  const currentIndex = flow.indexOf(entry.step === "approved" ? "step5_review" : entry.step);

  return (
    <div className="mx-auto max-w-md min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center gap-3 h-14 px-4">
          <button onClick={() => navigate({ to: "/activity" })} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{c.brand} × {c.retailer}</div>
            <div className="font-semibold text-sm truncate">{c.title}</div>
          </div>
        </div>
      </header>

      <div className="px-5 pt-5">
        <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Compensation</div>
              <div className="text-2xl font-bold font-display text-primary">{formatVND(c.compensation)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Deadline</div>
              <div className="text-sm font-semibold">{c.deadline}</div>
            </div>
          </div>
        </div>

        {entry.rejectionReason && (
          <div className="mt-4 rounded-2xl bg-destructive/10 border border-destructive/30 p-4">
            <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
              <AlertCircle className="h-4 w-4" /> Proof rejected
            </div>
            <p className="text-sm mt-1 text-destructive/90">{entry.rejectionReason}</p>
            <p className="text-xs mt-2 text-muted-foreground">Resubmit before the campaign deadline.</p>
          </div>
        )}
      </div>

      <section className="px-5 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Execution steps</h2>
        <ol className="relative border-l-2 border-border/70 pl-5 space-y-4">
          {flow.map((s, i) => {
            const done = i < currentIndex || entry.step === "approved";
            const active = i === currentIndex && entry.step !== "approved";
            return (
              <li key={s} className="relative">
                <span
                  className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-4 ${
                    done ? "bg-success ring-success/20" : active ? "bg-primary ring-primary/25 animate-pulse" : "bg-border ring-transparent"
                  }`}
                />
                <div className={`text-sm font-semibold ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                  Step {i + 1}: {STEP_LABELS[s]}
                </div>
                {active && <StepAction step={s} campaignId={c.id} />}
              </li>
            );
          })}
        </ol>
      </section>

      {entry.step !== "approved" && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/95 backdrop-blur-xl border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2">
          {entry.step === "step2_printing" && (
            <button
              onClick={() => advanceStep(c.id, "step3_execution")}
              className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-card"
            >
              Mark start execution
            </button>
          )}
          {entry.step === "step3_execution" && (
            <button
              onClick={() => submitProof(c.id)}
              className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-card flex items-center justify-center gap-2"
            >
              <Upload className="h-5 w-5" /> Upload proof & complete
            </button>
          )}
          {entry.step === "step4_completed" && entry.rejectionReason && (
            <button
              onClick={() => submitProof(c.id)}
              className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-card flex items-center justify-center gap-2"
            >
              <Upload className="h-5 w-5" /> Resubmit proof
            </button>
          )}
          {entry.step === "step5_review" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">Simulating admin review:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => approve(c.id)}
                  className="h-11 rounded-xl bg-success text-success-foreground font-semibold flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => setConfirmingReject(true)}
                  className="h-11 rounded-xl bg-destructive/10 text-destructive font-semibold border border-destructive/30"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
          {entry.step === "step1_registered" && (
            <button
              onClick={() => advanceStep(c.id, "step2_printing")}
              className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-card"
            >
              Advance to production
            </button>
          )}
        </div>
      )}

      {confirmingReject && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-card rounded-2xl p-5">
            <h3 className="font-semibold">Reject proof</h3>
            <p className="text-sm text-muted-foreground mt-1">Simulated admin rejection reason:</p>
            <div className="mt-3 rounded-xl border border-input p-3 text-sm">
              Product facings do not match the planogram — please re-align and reshoot.
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setConfirmingReject(false)} className="flex-1 h-11 rounded-xl bg-secondary font-semibold">
                Cancel
              </button>
              <button
                onClick={() => {
                  reject(c.id, "Product facings do not match the planogram — please re-align and reshoot.");
                  setConfirmingReject(false);
                }}
                className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground font-semibold"
              >
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepAction({ step, campaignId }: { step: CampaignStep; campaignId: string }) {
  if (step === "step3_execution") {
    return (
      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
        <Camera className="h-3.5 w-3.5" /> Take photo proof at the store when done.
      </p>
    );
  }
  if (step === "step5_review") {
    return <p className="text-xs text-muted-foreground mt-1">Admin is reviewing your submission.</p>;
  }
  return null;
}
