import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CAMPAIGNS, formatVND, STEP_LABELS, type CampaignStep } from "@/lib/mock-data";
import { useStore, resolveActivityStep } from "@/lib/store";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  Camera,
  Printer,
  Play,
  FolderOpen,
  Download,
  FileText,
  Video,
  Image,
  Folder,
  X,
  Loader2
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/activity/$id")({
  component: ActivityDetail,
});

const flow: CampaignStep[] = [
  "step1_registered",
  "step2_printing",
  "step3_execution",
  "step5_review",
];

interface MediaSpace {
  id: string;
  name: string;
  location: string;
  requirement: string;
  images: string[];
}

function getMediaSpaces(brand: string, retailer: string): MediaSpace[] {
  return [
    {
      id: "ms-1",
      name: `Hanging Ceiling Banner (${brand} Ad)`,
      location: "Central Aisle Ceiling",
      requirement: `Hang the double-sided printed advertising banner from the ceiling mounts. Ensure it is aligned vertically and clearly visible from both ends of the main walkway.`,
      images: [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400",
      ],
    },
    {
      id: "ms-2",
      name: `Store Entrance Lightbox (${brand} Ad)`,
      location: "Main Entrance Foyer",
      requirement: `Insert the backlit film advertisement poster into the storefront lightbox display frame at ${retailer}. Verify that the lighting is even with no wrinkles.`,
      images: [
        "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400",
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400",
      ],
    },
  ];
}

const MOCK_PROOFS = [
  { url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400", type: "image" as const },
  { url: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400", type: "image" as const },
  { url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400", type: "image" as const },
  { url: "https://assets.mixkit.co/videos/preview/mixkit-animation-of-a-sale-tag-41130-large.mp4", type: "video" as const }
];

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00");
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function getPeriodString(start: string, end: string) {
  if (start >= end) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function getStepStatus(
  step: string,
  entry: any,
  c: any,
  todayStr: string
): "completed" | "in-progress" | "pending" {
  if (entry.step === "approved") {
    return "completed";
  }

  if (step === "step1_registered") {
    return "completed";
  }

  if (step === "step2_printing") {
    if (entry.printingDone || entry.step === "step3_execution" || entry.step === "step5_review") {
      return "completed";
    }
    if (todayStr >= c.productionStart) {
      return "in-progress";
    }
    return "pending";
  }

  if (step === "step3_execution") {
    if (entry.step === "step5_review") {
      return "completed";
    }
    if (todayStr >= c.executionStart) {
      return "in-progress";
    }
    return "pending";
  }

  if (step === "step5_review") {
    if (entry.step === "step5_review") {
      return "in-progress";
    }
    return "pending";
  }

  return "pending";
}

function TimelineDateRow({ label, date, highlight }: { label: string; date: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${highlight ? "text-primary" : "text-foreground"}`}>{date}</span>
    </div>
  );
}

function formatDateTime(dateStrOrIso: string) {
  const date = new Date(dateStrOrIso);
  if (isNaN(date.getTime())) {
    const [y, m, d] = dateStrOrIso.split("-");
    return `${d}/${m}/${y} 09:30`;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hrs = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  return `${d}/${m}/${y} ${hrs}:${mins}`;
}

function ActivityDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { activity, history, completePrinting, startExecution, submitProof, approve, reject } = useStore();
  const entry = [...activity, ...history].find((a) => a.campaignId === id);
  const c = CAMPAIGNS.find((x) => x.id === id);
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [adminRejectionReason, setAdminRejectionReason] = useState("Product facings do not match the planogram — please re-align and reshoot.");
  const [showAssets, setShowAssets] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Pop-up upload screen modal state
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Proof upload state per media space
  const [proofs, setProofs] = useState<Record<string, Array<{ id: string; url: string; type: "image" | "video" }>>>({});

  if (!c || !entry) {
    return <div className="p-6">Not found.</div>;
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const resolvedStep = resolveActivityStep(entry);
  const mediaSpaces = getMediaSpaces(c.brand, c.retailer);

  // Validate that each media space has at least one proof item uploaded
  const isUploadComplete = mediaSpaces.every(ms => (proofs[ms.id] || []).length >= 1);

  function handleAddProof(mediaSpaceId: string) {
    const randomMockItem = MOCK_PROOFS[Math.floor(Math.random() * MOCK_PROOFS.length)];
    
    const newProof = {
      id: Math.random().toString(),
      url: randomMockItem.url,
      type: randomMockItem.type
    };

    setProofs(prev => ({
      ...prev,
      [mediaSpaceId]: [...(prev[mediaSpaceId] || []), newProof]
    }));
  }

  function handleRemoveProof(mediaSpaceId: string, proofId: string) {
    setProofs(prev => ({
      ...prev,
      [mediaSpaceId]: (prev[mediaSpaceId] || []).filter(p => p.id !== proofId)
    }));
  }

  function triggerDownload(fileName: string) {
    setDownloadingFile(fileName);
    setDownloadProgress(0);
    
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setDownloadProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setDownloadingFile(null);
        }, 400);
      }
    }, 150);
  }

  return (
    <div className="mx-auto max-w-md min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center gap-3 h-14 px-4">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history && window.history.length > 1) {
                window.history.back();
              } else {
                navigate({ to: "/activity" });
              }
            }}
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-sm truncate text-foreground">{c.title}</h1>
          </div>
        </div>
      </header>

      <div className="px-5 pt-5">
        <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-semibold tracking-wide">Compensation</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-bold font-display text-primary">{formatVND(c.compensation)}</span>
                {(entry.step === "approved" || entry.step === "step5_review") && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full select-none ${
                    entry.step === "approved" 
                      ? "bg-success/15 text-success border border-success/20" 
                      : "bg-amber-500/15 text-amber-600 border border-amber-500/20"
                  }`}>
                    {entry.step === "approved" ? "Paid" : "Pending"}
                  </span>
                )}
              </div>
            </div>
            {entry.step !== "approved" && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground font-semibold tracking-wide">Deadline</div>
                <div className="text-sm font-semibold mt-1">{formatDate(c.deadline)}</div>
              </div>
            )}
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

      {/* Execution steps timeline vertical list */}
      <section className="px-5 mt-6">
        <h2 className="text-xs font-bold text-primary mb-4">Execution Steps</h2>
        <div className="flex flex-col">
          {flow.map((s, idx) => {
            const status = getStepStatus(s, entry, c, todayStr);
            const isLast = idx === flow.length - 1;

            // Determine connector line color based on the next step status
            let lineColorClass = "bg-border/60";
            if (!isLast) {
              const nextStep = flow[idx + 1];
              const nextStatus = getStepStatus(nextStep, entry, c, todayStr);
              if (nextStatus === "completed") {
                lineColorClass = "bg-emerald-500";
              } else if (nextStatus === "in-progress") {
                lineColorClass = "bg-gradient-to-b from-emerald-500 to-amber-500";
              }
            }

            return (
              <div key={s} className="flex gap-4 min-h-[70px] last:min-h-0">
                {/* Left timeline indicator */}
                <div className="flex flex-col items-center shrink-0 w-6">
                  {status === "completed" ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  ) : status === "in-progress" ? (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0 ring-4 ring-amber-500/20 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-secondary border border-border text-muted-foreground flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/35" />
                    </div>
                  )}
                  {!isLast && <div className={`w-[2px] grow ${lineColorClass} my-1`} />}
                </div>

                {/* Right content */}
                <div className="pb-5">
                  <div className={`text-sm font-semibold leading-tight ${
                    status === "completed" ? "text-foreground" : status === "in-progress" ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {STEP_LABELS[s]}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {s === "step1_registered" && `Registered on ${formatDate(entry.registeredAt.split("T")[0])}`}
                    {s === "step2_printing" && `Period: ${getPeriodString(c.productionStart, addDays(c.executionStart, -1))}`}
                    {s === "step3_execution" && `Period: ${getPeriodString(c.executionStart, addDays(c.deadline, -1))}`}
                    {s === "step5_review" && `Review deadline: ${formatDate(c.deadline)}`}
                  </div>
                  {status === "in-progress" && <StepAction step={s} entry={entry} onAccessAssets={() => setShowAssets(true)} />}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Completed Campaign Detailed Information Blocks */}
      {entry.step === "approved" && (
        <>
          {/* Campaign Description */}
          <section className="px-5 mt-4">
            <div className="bg-card rounded-2xl border border-border/60 p-4 space-y-2 shadow-sm">
              <h3 className="font-bold text-sm text-foreground">Campaign Description</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.brief}</p>
            </div>
          </section>

          {/* Campaign Execution Timeline */}
          <section className="px-5 mt-4">
            <div className="bg-card rounded-2xl border border-border/60 p-4 space-y-3 shadow-sm">
              <h3 className="font-bold text-sm text-foreground border-b border-border/40 pb-2">Campaign Execution Timeline</h3>
              <div className="space-y-2">
                <TimelineDateRow label="Registration Period" date={getPeriodString(c.windowStart, addDays(c.productionStart, -1))} />
                <TimelineDateRow label="Printing & Production" date={getPeriodString(c.productionStart, addDays(c.executionStart, -1))} />
                <TimelineDateRow label="Execution Period" date={getPeriodString(c.executionStart, addDays(c.deadline, -1))} />
                <TimelineDateRow label="Under Review" date={formatDate(c.deadline)} />
              </div>
            </div>
          </section>

          {/* Executor's Exact Execution Timeline */}
          <section className="px-5 mt-4">
            <div className="bg-card rounded-2xl border border-border/60 p-4 space-y-3 shadow-sm">
              <h3 className="font-bold text-sm text-foreground border-b border-border/40 pb-2">Executor's Exact Execution Timeline</h3>
              <div className="space-y-2">
                <TimelineDateRow label="Registered On" date={formatDateTime(entry.registeredAt)} />
                <TimelineDateRow label="Printing Completed On" date={formatDateTime(c.productionStart + "T10:45:00")} />
                <TimelineDateRow label="Setup Started On" date={formatDateTime(c.executionStart + "T14:20:00")} />
                <TimelineDateRow label="Proof Submitted On" date={formatDateTime(addDays(c.executionStart, 1) + "T16:15:00")} />
                <TimelineDateRow label="Approved On" date={formatDateTime(addDays(c.executionStart, 2) + "T11:05:00")} />
                <TimelineDateRow label="Paid On" date={formatDateTime(addDays(c.executionStart, 2) + "T14:30:00")} highlight />
              </div>
            </div>
          </section>
        </>
      )}

      {/* Read-Only Submitted Proofs Section (Visible at the bottom ONLY after submitting proof) */}
      {(resolvedStep === "step5_review" || entry.step === "approved") && (
        <section className="px-5 mt-4">
          <div className="bg-card rounded-2xl border border-border/60 p-4 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-foreground border-b border-border/40 pb-2">Media Space Proofs</h3>
            <div className="space-y-4">
              {mediaSpaces.map((ms) => {
                // Read from state, if page is reloaded fallback to demo visual items
                const msProofs = proofs[ms.id] || [
                  { id: "demo-p1", url: MOCK_PROOFS[0].url, type: "image" as const },
                  { id: "demo-p2", url: MOCK_PROOFS[1].url, type: "image" as const },
                  { id: "demo-p3", url: MOCK_PROOFS[3].url, type: "video" as const }
                ];

                return (
                  <div key={ms.id} className="space-y-2">
                    <div className="text-xs font-bold text-foreground leading-snug">{ms.name}</div>
                    <div className="grid grid-cols-4 gap-2">
                      {msProofs.map((p) => (
                        <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden border border-border/50 bg-secondary">
                          {p.type === "image" ? (
                            <img src={p.url} className="w-full h-full object-cover" />
                          ) : (
                            <video src={p.url} className="w-full h-full object-cover" controls />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic footer buttons based on tracking status flow */}
      {entry.step !== "approved" && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/95 backdrop-blur-xl border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2 z-30">
          {resolvedStep === "step1_registered" && (
            <button
              disabled
              className="w-full h-12 rounded-xl bg-muted text-muted-foreground font-semibold flex flex-col items-center justify-center leading-none"
            >
              <span className="text-[13px] font-bold">Registered</span>
              <span className="text-[10px] mt-0.5 font-normal opacity-85">
                {STEP_LABELS["step2_printing"]} starts {formatDate(c.productionStart)}
              </span>
            </button>
          )}

          {resolvedStep === "step2_printing" && (
            !entry.printingDone ? (
              <button
                onClick={() => completePrinting(c.id)}
                className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-card flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <Printer className="h-5 w-5" /> Complete Print and Production
              </button>
            ) : (
              <button
                disabled
                className="w-full h-12 rounded-xl bg-muted text-muted-foreground font-semibold flex flex-col items-center justify-center leading-none"
              >
                <span className="text-[13px] font-bold">Printing Done</span>
                <span className="text-[10px] mt-0.5 font-normal opacity-85">
                  {STEP_LABELS["step3_execution"]} starts {formatDate(c.executionStart)}
                </span>
              </button>
            )
          )}

          {resolvedStep === "step3_execution" && (
            !entry.executionStarted ? (
              <button
                onClick={() => startExecution(c.id)}
                className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-card flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <Play className="h-4 w-4 fill-current" /> Start Setting Up Campaign
              </button>
            ) : (
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-card flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <Upload className="h-5 w-5" /> {entry.rejectionReason ? "Resubmit proof" : "Upload proof & complete"}
              </button>
            )
          )}

          {resolvedStep === "step5_review" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">Simulating admin review:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConfirmingReject(true)}
                  className="h-11 rounded-xl bg-destructive/10 text-destructive font-semibold border border-destructive/30 cursor-pointer active:scale-[0.99] transition-transform"
                >
                  Reject
                </button>
                <button
                  onClick={() => approve(c.id)}
                  className="h-11 rounded-xl bg-success text-success-foreground font-semibold flex items-center justify-center cursor-pointer active:scale-[0.99] transition-transform"
                >
                  Approve
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pop-up Modal screen for Uploading Proof */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto pb-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary animate-pulse" />
                <h3 className="font-bold text-base text-foreground">Upload Photo Proof</h3>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Media Space Upload Blocks */}
            <div className="space-y-5">
              {mediaSpaces.map((ms) => {
                const msProofs = proofs[ms.id] || [];
                const hasProof = msProofs.length >= 1;

                return (
                  <div key={ms.id} className="space-y-2 border-b border-border/30 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-foreground leading-snug">{ms.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{ms.location}</div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 select-none ${
                        hasProof ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                      }`}>
                        {hasProof ? "Completed" : "Required"}
                      </span>
                    </div>

                    {/* Proof Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      {msProofs.map((p) => (
                        <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden border border-border/50 bg-secondary group">
                          {p.type === "image" ? (
                            <img src={p.url} className="w-full h-full object-cover" />
                          ) : (
                            <video src={p.url} className="w-full h-full object-cover" muted />
                          )}
                          <button
                            onClick={() => handleRemoveProof(ms.id, p.id)}
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      {/* Add Proof Block */}
                      <button
                        onClick={() => handleAddProof(ms.id)}
                        className="aspect-square rounded-xl border border-dashed border-border/80 hover:border-primary/50 bg-secondary/20 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-all cursor-pointer"
                      >
                        <Camera className="h-5.5 w-5.5" />
                        <span className="text-[8px] mt-1 font-bold">Add Proof</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions Footer */}
            <div className="mt-6 space-y-1.5 border-t border-border/40 pt-4">
              <button
                onClick={() => {
                  if (isUploadComplete) {
                    submitProof(c.id);
                    setShowUploadModal(false);
                  }
                }}
                disabled={!isUploadComplete}
                className={`w-full h-12 rounded-xl font-semibold shadow-card flex items-center justify-center gap-2 transition-all ${
                  isUploadComplete
                    ? "bg-gradient-primary text-primary-foreground cursor-pointer active:scale-[0.99] transition-transform"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-85"
                }`}
              >
                <Upload className="h-5 w-5" /> Submit Proof & Complete
              </button>
              {!isUploadComplete && (
                <p className="text-[9px] text-destructive font-semibold text-center leading-tight">
                  * Please upload at least 1 proof item for each media space to submit.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campaign Assets Modal/Drawer Sheet */}
      {showAssets && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">Campaign Assets</h3>
              </div>
              <button 
                onClick={() => setShowAssets(false)}
                className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Asset Categories */}
            <div className="space-y-6">
              {/* 1. Campaign Creatives */}
              <div>
                <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                  <Image className="h-3.5 w-3.5" /> Campaign Creatives
                </h4>
                <div className="space-y-2">
                  <AssetFile name="banner_horizontal.pdf" type="PDF Document" size="12.4 MB" onDownload={() => triggerDownload("banner_horizontal.pdf")} />
                  <AssetFile name="wobbler_print_ready.pdf" type="PDF Document" size="4.8 MB" onDownload={() => triggerDownload("wobbler_print_ready.pdf")} />
                  <AssetFile name="brand_logo_highres.png" type="Image" size="1.2 MB" onDownload={() => triggerDownload("brand_logo_highres.png")} />
                  <AssetFile name="promo_explainer_anim.mp4" type="Video" size="24.5 MB" onDownload={() => triggerDownload("promo_explainer_anim.mp4")} />
                </div>
              </div>

              {/* 2. Campaign Explainer */}
              <div>
                <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Campaign Explainer
                </h4>
                <div className="space-y-2">
                  <AssetFile name="setup_guidelines.pdf" type="Static PDF" size="3.2 MB" onDownload={() => triggerDownload("setup_guidelines.pdf")} />
                  <AssetFile name="reference_setup_walkthrough.mp4" type="Video File" size="18.0 MB" onDownload={() => triggerDownload("reference_setup_walkthrough.mp4")} />
                </div>
              </div>

              {/* 3. Additional Assets */}
              <div>
                <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                  <Folder className="h-3.5 w-3.5" /> Additional Assets
                </h4>
                <div className="space-y-2">
                  <AssetFile name="retailer_store_list.xlsx" type="Spreadsheet" size="150 KB" onDownload={() => triggerDownload("retailer_store_list.xlsx")} />
                  <AssetFile name="safety_guidelines.pdf" type="PDF Document" size="850 KB" onDownload={() => triggerDownload("safety_guidelines.pdf")} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Downloading indicator toast */}
      {downloadingFile && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-64 bg-card rounded-2xl p-5 shadow-xl border border-border flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
            <div className="text-xs font-semibold text-foreground truncate w-full text-center">Downloading {downloadingFile}</div>
            <div className="w-full bg-secondary h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary h-full transition-all duration-200" style={{ width: `${downloadProgress}%` }} />
            </div>
            <div className="text-[10px] text-muted-foreground mt-1.5">{downloadProgress}%</div>
          </div>
        </div>
      )}

      {confirmingReject && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-card rounded-2xl p-5 shadow-xl">
            <h3 className="font-semibold text-foreground">Reject proof</h3>
            <p className="text-sm text-muted-foreground mt-1">Type simulated admin rejection reason:</p>
            <textarea
              value={adminRejectionReason}
              onChange={(e) => setAdminRejectionReason(e.target.value)}
              className="mt-3 w-full h-24 rounded-xl border border-input p-3 text-sm text-foreground bg-secondary/35 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
              placeholder="Enter rejection reason..."
            />
            <div className="mt-4 flex gap-2">
              <button onClick={() => setConfirmingReject(false)} className="flex-1 h-11 rounded-xl bg-secondary font-semibold text-foreground cursor-pointer">
                Cancel
              </button>
              <button
                onClick={() => {
                  reject(c.id, adminRejectionReason);
                  setConfirmingReject(false);
                }}
                className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground font-semibold cursor-pointer"
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

function AssetFile({ name, type, size, onDownload }: { name: string; type: string; size: string; onDownload: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-secondary/30 hover:bg-secondary/60 transition-colors">
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="text-primary mt-0.5 shrink-0">
          {type.includes("PDF") || type.includes("Static") ? (
            <FileText className="h-4 w-4" />
          ) : type.includes("Video") ? (
            <Video className="h-4 w-4" />
          ) : type.includes("Image") ? (
            <Image className="h-4 w-4" />
          ) : (
            <Folder className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground truncate" title={name}>{name}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{type} • {size}</div>
        </div>
      </div>
      <button
        onClick={onDownload}
        className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center cursor-pointer hover:bg-primary/20 active:scale-90 transition-all shrink-0 ml-2 animate-pulse"
        title="Download"
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
}

function StepAction({ step, entry, onAccessAssets }: { step: CampaignStep; entry: any; onAccessAssets: () => void }) {
  if (step === "step1_registered") {
    return <p className="text-xs text-muted-foreground mt-1">Waiting for production approval...</p>;
  }
  if (step === "step2_printing") {
    if (entry.printingDone) {
      return (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-success font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Printing & Production marked done!
          </p>
          <button
            onClick={onAccessAssets}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 cursor-pointer active:scale-95 transition-all"
          >
            <FolderOpen className="h-3.5 w-3.5" /> View Campaign Assets
          </button>
        </div>
      );
    }
    return (
      <div className="mt-2 space-y-2">
        <p className="text-xs text-muted-foreground">Print POSM resources and prepare for production setup.</p>
        <button
          onClick={onAccessAssets}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 cursor-pointer active:scale-95 transition-all"
        >
          <FolderOpen className="h-3.5 w-3.5" /> Access Campaign Assets
        </button>
      </div>
    );
  }
  if (step === "step3_execution") {
    return (
      <div className="mt-2 space-y-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Camera className="h-3.5 w-3.5" /> {entry.executionStarted ? "Take photo proof of the completed setup and submit." : "Go to the store and start execution setup."}
        </p>
        <button
          onClick={onAccessAssets}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 cursor-pointer active:scale-95 transition-all"
        >
          <FolderOpen className="h-3.5 w-3.5" /> View Campaign Assets
        </button>
      </div>
    );
  }
  if (step === "step5_review") {
    return <p className="text-xs text-muted-foreground mt-1">Admin is reviewing your submission.</p>;
  }
  return null;
}
