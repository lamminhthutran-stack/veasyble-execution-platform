import {
  CAMPAIGNS,
  daysLeft,
  formatDate,
  formatVND,
  STEP_LABELS,
  stepPeriod,
  type CampaignStep,
} from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { Calendar, ChevronRight, MapPin, Store } from "lucide-react";

const stepColor: Record<CampaignStep, string> = {
  registered: "bg-sky-100 text-sky-700",
  printing: "bg-orange-100 text-orange-700",
  execution: "bg-orange-100 text-orange-700",
  review: "bg-violet-100 text-violet-700",
  approved: "bg-emerald-100 text-emerald-700",
};

export function StageBadge({ step }: { step: CampaignStep }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${stepColor[step]}`}>
      {STEP_LABELS[step]}
    </span>
  );
}

function Logo({ brand, color }: { brand: string; color: string }) {
  const initials = brand
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export function CampaignCard({
  campaignId,
  step,
  href,
  mode = "activity",
  compact = false,
}: {
  campaignId: string;
  step?: CampaignStep;
  href: string;
  mode?: "activity" | "explore" | "dashboard";
  compact?: boolean;
}) {
  const c = CAMPAIGNS.find((x) => x.id === campaignId);
  if (!c) return null;
  const dateLabel = step ? stepPeriod(c, step).replace("Period: ", "").replace("Registration deadline: ", "") : `${formatDate(c.registrationOpen)} - ${formatDate(c.registrationDeadline)}`;

  return (
    <Link
      to={href}
      className={`block rounded border border-border/70 bg-card shadow-card transition-transform active:scale-[0.99] ${
        compact ? "w-[300px] shrink-0" : "w-full"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Logo brand={c.brand} color={c.brandColor} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="truncate text-xs font-bold uppercase tracking-wide text-muted-foreground">{c.brand}</div>
              {step && <StageBadge step={step} />}
              {mode === "explore" && (
                <span className="shrink-0 rounded-full bg-orange-100 px-2 py-1 text-[11px] font-semibold text-orange-700">
                  {daysLeft(c.registrationDeadline)} days left
                </span>
              )}
            </div>
            <div className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug">{c.title}</div>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" />
            <span className="truncate">{dateLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
            <span className="truncate">{c.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Store className="h-3.5 w-3.5 shrink-0 opacity-70" />
            <span className="truncate">{c.retailer}</span>
          </div>
        </div>

        <div className="mt-3 border-t border-border/50 pt-3 flex items-center justify-between gap-3">
          <div className="font-display text-base font-bold text-primary">{formatVND(c.compensation)}</div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}
