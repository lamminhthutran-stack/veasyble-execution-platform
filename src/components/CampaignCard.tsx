import { CAMPAIGNS, formatVND, type CampaignStep, STEP_LABELS } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { MapPin, Calendar, Store } from "lucide-react";

function formatShortDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

const stepColor: Record<CampaignStep, string> = {
  step1_registered: "bg-[#EFF6FF] text-[#3B82F6] dark:bg-[#3B82F6]/10 dark:text-[#3B82F6]",
  step2_printing: "bg-[#FFF1E8] text-[#F97316] dark:bg-[#F97316]/10 dark:text-[#F97316]",
  step3_execution: "bg-[#FEE9E2] text-[#F56B3D] dark:bg-[#F56B3D]/10 dark:text-[#F56B3D]",
  step5_review: "bg-[#F3E8FF] text-[#9333EA] dark:bg-[#9333EA]/10 dark:text-[#9333EA]",
  approved: "bg-[#ECFDF5] text-[#10B981] dark:bg-[#10B981]/10 dark:text-[#10B981]",
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

  // Calculate days left to register relative to windowStart
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(c.windowStart + "T00:00:00");
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let daysLeftText = "";
  if (diffDays < 0) {
    daysLeftText = "Closed";
  } else if (diffDays === 0) {
    daysLeftText = "Register today";
  } else if (diffDays === 1) {
    daysLeftText = "1 day left";
  } else {
    daysLeftText = `${diffDays} days left`;
  }

  return (
    <Link
      to={href}
      className="block bg-card rounded-2xl border border-border/60 overflow-hidden active:scale-[0.99] transition-transform h-full"
    >
      <div className="p-4 flex gap-3 items-center h-full">
        {/* Left: 30% area for Brand Logo */}
        <div className="w-[30%] flex justify-center items-center shrink-0">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl shadow-sm border border-white/20 select-none"
            style={{ backgroundColor: c.brandColor }}
          >
            {c.brand.charAt(0)}
          </div>
        </div>

        {/* Right: 70% content area */}
        <div className="w-[70%] min-w-0 flex flex-col justify-between h-full">
          <div>
            <div className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase truncate">{c.brand}</div>
            <div className="font-semibold text-sm leading-snug mt-0.5 truncate" title={c.title}>{c.title}</div>
            
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="truncate">{formatShortDate(c.windowStart)} - {formatShortDate(c.windowEnd)}</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="truncate">{c.location}, {c.city}</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <Store className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="truncate">{c.retailer}</span>
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-2 border-t border-border/40 flex items-center justify-between gap-1.5">
            <span className="font-bold text-sm text-primary shrink-0">{formatVND(c.compensation)}</span>
            {step ? (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 truncate max-w-[120px] ${stepColor[step]}`}>
                {STEP_LABELS[step]}
              </span>
            ) : (
              <span className="text-[10px] text-amber-600 font-semibold shrink-0">
                {daysLeftText}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
