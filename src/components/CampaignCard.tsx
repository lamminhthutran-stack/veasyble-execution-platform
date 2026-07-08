import { CAMPAIGNS, formatVND, type CampaignStep, STEP_LABELS } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { MapPin, Calendar } from "lucide-react";

const stepColor: Record<CampaignStep, string> = {
  step1_registered: "bg-secondary text-secondary-foreground",
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
      className="block bg-card rounded-2xl shadow-card border border-border/60 overflow-hidden active:scale-[0.99] transition-transform"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: c.brandColor }}
          >
            {c.brand.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground font-medium">{c.brand} × {c.retailer}</div>
            <div className="font-semibold text-[15px] leading-snug mt-0.5 line-clamp-2">{c.title}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{c.location}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{c.windowStart.slice(5)}–{c.windowEnd.slice(5)}</span>
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
