import {
  ACTIVE_STEPS,
  formatDate,
  formatDateTime,
  formatVND,
  STEP_LABELS,
  stepPeriod,
  type ActivityEntry,
  type AssetSection,
  type Campaign,
  type CampaignStep,
} from "@/lib/mock-data";
import { StageBadge } from "./CampaignCard";
import {
  Calendar,
  CheckCircle2,
  Download,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  Image as ImageIcon,
  MapPin,
  Store,
} from "lucide-react";

export function BrandLogo({ campaign }: { campaign: Campaign }) {
  const initials = campaign.brand
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: campaign.brandColor }}
    >
      {initials}
    </div>
  );
}

export function CampaignInfoCard({ campaign }: { campaign: Campaign }) {
  return (
    <div className="rounded bg-card p-4 shadow-card border border-border/70">
      <div className="flex gap-3">
        <BrandLogo campaign={campaign} />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{campaign.brand}</div>
          <h1 className="mt-1 text-lg font-bold leading-tight">{campaign.title}</h1>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <InfoLine icon={<Store className="h-4 w-4" />} value={campaign.retailer} />
        <InfoLine icon={<MapPin className="h-4 w-4" />} value={`${campaign.location}, ${campaign.city}`} />
        <InfoLine icon={<Calendar className="h-4 w-4" />} value={`${formatDate(campaign.productionStart)} - ${formatDate(campaign.reviewDeadline)}`} />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
        <div className="text-sm font-medium text-muted-foreground">Compensation</div>
        <div className="font-display text-lg font-bold text-primary">{formatVND(campaign.compensation)}</div>
      </div>
    </div>
  );
}

function InfoLine({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span>{value}</span>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold uppercase tracking-wide text-primary">{children}</h2>;
}

export function DescriptionSection({ campaign }: { campaign: Campaign }) {
  return (
    <section className="px-5 mt-6">
      <SectionTitle>Campaign Description</SectionTitle>
      <p className="mt-2 text-[15px] leading-relaxed text-foreground">{campaign.brief}</p>
    </section>
  );
}

export function PlannedTimeline({ campaign }: { campaign: Campaign }) {
  const rows: Array<{ step: CampaignStep; detail: string }> = [
    { step: "registered", detail: `Registration deadline: ${formatDate(campaign.registrationDeadline)}` },
    { step: "printing", detail: stepPeriod(campaign, "printing") },
    { step: "execution", detail: stepPeriod(campaign, "execution") },
    { step: "review", detail: stepPeriod(campaign, "review") },
  ];
  return (
    <section className="px-5 mt-6">
      <SectionTitle>Campaign Execution Timeline</SectionTitle>
      <ol className="mt-3 relative border-l-2 border-border/70 pl-5 space-y-4">
        {rows.map((row) => (
          <li key={row.step} className="relative">
            <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold">{STEP_LABELS[row.step]}</div>
              <StageBadge step={row.step} />
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">{row.detail}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function MediaSpaces({ campaign }: { campaign: Campaign }) {
  return (
    <section className="px-5 mt-6">
      <SectionTitle>Media Spaces</SectionTitle>
      <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
        {campaign.mediaSpaces.map((space) => (
          <article key={space.id} className="w-[280px] shrink-0 overflow-hidden rounded border border-border/70 bg-card shadow-card">
            <img src={space.showcase[0]} alt={space.name} className="h-32 w-full object-cover" />
            <div className="p-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-primary">{space.zone}</div>
              <div className="mt-1 text-sm font-semibold">{space.name}</div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div>Media Type: {space.type}</div>
                <div>Dimension: {space.dimension}</div>
                <div>{space.notes}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ProofsSection({ campaign, entry }: { campaign: Campaign; entry?: ActivityEntry }) {
  const proofs = entry?.proofs ?? [];
  return (
    <section className="px-5 mt-6">
      <SectionTitle>Media Space Proofs</SectionTitle>
      {proofs.length === 0 ? (
        <p className="mt-3 text-sm italic text-muted-foreground">
          {entry?.setupStartedAt
            ? "No proofs uploaded yet."
            : "No proofs uploaded yet. You can submit proofs once campaign execution starts."}
        </p>
      ) : (
        <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
          {proofs.map((proof) => {
            const space = campaign.mediaSpaces.find((item) => item.id === proof.mediaSpaceId);
            return (
              <article key={proof.mediaSpaceId} className="w-[280px] shrink-0 overflow-hidden rounded border border-border/70 bg-card shadow-card">
                <img src={proof.image} alt={space?.name ?? "Proof"} className="h-32 w-full object-cover" />
                <div className="p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-primary">{space?.zone}</div>
                  <div className="mt-1 text-sm font-semibold">{space?.name}</div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div>Media Type: {space?.type}</div>
                    <div>Dimension: {space?.dimension}</div>
                    <div>Notes: {proof.notes}</div>
                    <div>Proof Submitted On: {formatDateTime(proof.uploadedAt)}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function ExactTimeline({ entry }: { entry: ActivityEntry }) {
  const rows = [
    ["Registered On", entry.registeredAt],
    ["Printing Completed On", entry.printingCompletedAt],
    ["Setup Started On", entry.setupStartedAt],
    ["Proof Submitted On", entry.proofSubmittedAt],
    ["Approved On", entry.approvedAt],
    ["Paid On", entry.paidAt],
  ];
  return (
    <section className="px-5 mt-6">
      <SectionTitle>Executor's Exact Execution Timeline</SectionTitle>
      <div className="mt-3 rounded border border-border/70 bg-card p-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b border-border/50 py-2 last:border-0">
            <div className="text-xs font-medium text-muted-foreground">{label}</div>
            <div className="text-right text-xs font-semibold">{formatDateTime(value)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function fileIcon(type: string) {
  if (type.includes("Video")) return <FileVideo className="h-4 w-4" />;
  if (type.includes("Image")) return <FileImage className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

function sectionIcon(section: AssetSection["title"]) {
  if (section === "Campaign Creatives") return <ImageIcon className="h-4 w-4" />;
  if (section === "Campaign Explainer") return <FileText className="h-4 w-4" />;
  return <Folder className="h-4 w-4" />;
}

export function AssetsPanel({
  campaign,
  open,
  onClose,
}: {
  campaign: Campaign;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="absolute bottom-0 left-1/2 max-h-[88vh] w-full max-w-md -translate-x-1/2 overflow-y-auto rounded-t bg-background">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background p-4">
          <div className="flex items-center gap-2 font-semibold">
            <Folder className="h-5 w-5 text-primary" /> Campaign Assets
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded bg-secondary text-sm font-bold">X</button>
        </div>
        <div className="p-5">
          <button className="mb-5 flex h-11 w-full items-center justify-center gap-2 rounded bg-primary text-sm font-semibold text-primary-foreground">
            <Download className="h-4 w-4" /> Download All
          </button>
          <div className="space-y-6">
            {campaign.assets.map((section) => (
              <section key={section.title}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-primary">
                    {sectionIcon(section.title)} {section.title}
                  </h3>
                  <button className="text-xs font-semibold text-primary">Download All</button>
                </div>
                <div className="space-y-2">
                  {section.files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 rounded border border-border/70 bg-card p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded bg-secondary text-muted-foreground">
                        {fileIcon(file.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{file.name}</div>
                        <div className="text-xs text-muted-foreground">{file.type} • {file.size}</div>
                      </div>
                      <button className="flex h-9 w-9 items-center justify-center rounded bg-accent text-primary">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StepStatusIcon({ done, active }: { done: boolean; active: boolean }) {
  if (done) return <CheckCircle2 className="absolute -left-[29px] top-0 h-5 w-5 rounded-full bg-background text-success" />;
  return (
    <span
      className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full ring-4 ${
        active ? "bg-primary ring-primary/20" : "bg-border ring-background"
      }`}
    />
  );
}

export { ACTIVE_STEPS };
