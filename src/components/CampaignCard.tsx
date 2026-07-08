import { CAMPAIGNS, formatVND, type CampaignStep, STEP_LABELS } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { MapPin, Calendar, Store } from "lucide-react";

function formatShortDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

const stepColor: Record<CampaignStep, string> = {
  step1_registered: "bg-blue-500/15 text-blue-600 dark:text-blue-500",
  step2_printing: "bg-warning/20 text-warning-foreground",
  step3_execution: "bg-primary/15 text-primary",
  step4_completed: "bg-primary/15 text-primary",
  step5_review: "bg-accent text-accent-foreground",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
};

export function CampaignCard({
  campaignId,
  step,
  href,
}: {
  campaignId: string;
  step?: CampaignStep;
  href: string;
}) {
  const c = CAMPAIGNS.find((x) => x.id === campaignId);
  if (!c) return null;
  return (
    <Link
      to={href}
      className="block bg-card rounded shadow-card border border-border/60 overflow-hidden active:scale-[0.99] transition-transform"
    >
      <div className="p-4">
        <div className="flex flex-col mb-3">
          <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{c.brand}</div>
          <div className="font-semibold text-[15px] leading-snug mt-1">{c.title}</div>
        </div>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" />{formatShortDate(c.windowStart)} - {formatShortDate(c.windowEnd)}</div>
          <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />{c.location}</div>
          <div className="flex items-center gap-1.5"><Store className="h-3.5 w-3.5 shrink-0 opacity-70" />{c.retailer}</div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="font-display font-bold text-primary">{formatVND(c.compensation)}</div>
          {step && (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${stepColor[step]}`}>
              {STEP_LABELS[step]}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
