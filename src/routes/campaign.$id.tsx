import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CAMPAIGNS, formatVND, type Campaign } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { ArrowLeft, MapPin, Calendar, CheckCircle2, Store } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/campaign/$id")({
  component: CampaignDetail,
});

const CAMPAIGN_COVER_IMAGES: Record<string, string> = {
  "c-001": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600",
  "c-002": "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=600",
  "c-003": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600",
  "c-004": "https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=600",
  "c-005": "https://images.unsplash.com/photo-1582408921715-18e7806365c1?w=600",
  "c-006": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600",
  "c-007": "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=600",
  "c-008": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600",
  "c-009": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
  "c-010": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600",
  "c-011": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600",
  "c-012": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600",
  "c-013": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600",
  "c-014": "https://images.unsplash.com/photo-1599490659213-e2b9527ec087?w=600",
  "c-015": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600",
  "c-016": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600",
  "c-017": "https://images.unsplash.com/photo-1622543956221-a396e9b152e4?w=600",
  "c-018": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600",
  "c-019": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600",
  "c-020": "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=600",
  "c-021": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600",
};

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

function CampaignDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const c = CAMPAIGNS.find((x) => x.id === id);
  const { activity, history, register } = useStore();
  const alreadyRegistered = [...activity, ...history].some((a) => a.campaignId === id);

  if (!c) {
    return (
      <div className="p-6">
        <p>Campaign not found.</p>
        <Link to="/marketplace" className="text-primary">Back to marketplace</Link>
      </div>
    );
  }

  const regEnd = addDays(c.productionStart, -1);
  const printEnd = addDays(c.executionStart, -1);
  const execEnd = addDays(c.deadline, -1);

  const stages = [
    { label: "Registered", date: getPeriodString(c.windowStart, regEnd) },
    { label: "Printing & Production", date: getPeriodString(c.productionStart, printEnd) },
    { label: "Execution in Progress", date: getPeriodString(c.executionStart, execEnd) },
    { label: "Under Review", date: formatDate(c.deadline) },
  ];

  const coverUrl = CAMPAIGN_COVER_IMAGES[c.id] || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600";
  const mediaSpaces = getMediaSpaces(c.brand, c.retailer);

  function onRegister() {
    register(c!.id);
    navigate({ to: "/activity", search: { tab: "step1_registered" } as any });
  }

  return (
    <AppShell>
      <div className="pb-36 bg-background">
        {/* Cover Image Block */}
      <div className="relative w-full h-56 text-white overflow-hidden">
        <img
          src={coverUrl}
          alt={c.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />
        <button
          onClick={() => navigate({ to: "/marketplace" })}
          className="absolute top-4 left-4 h-9 w-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center cursor-pointer active:scale-95 transition-transform z-20 text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Main Campaign Info Card (Overlap mt-12, Split 3:7) */}
      <div className="px-5 -mt-12 relative z-10">
        <div className="bg-card rounded-2xl border border-border/60 p-4 flex items-center gap-4 shadow-card">
          {/* Left: 30% area for Brand Logo (centered vertically & horizontally) */}
          <div className="w-[30%] flex justify-center items-center shrink-0">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-extrabold text-5xl shadow-sm border border-white/20 select-none"
              style={{ backgroundColor: c.brandColor }}
            >
              {c.brand.charAt(0)}
            </div>
          </div>

          {/* Right: 70% content area */}
          <div className="w-[70%] space-y-2.5 min-w-0">
            <div>
              <div className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">{c.brand}</div>
              <h1 className="font-bold text-base text-foreground leading-snug mt-0.5" title={c.title}>
                {c.title}
              </h1>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 shrink-0 opacity-70" />
                <span>{c.retailer}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 opacity-70" />
                <span className="truncate">{c.location}, {c.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 opacity-70" />
                <span>{formatDate(c.windowStart)} → {formatDate(c.windowEnd)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Compensation</span>
              <span className="text-lg font-bold font-display text-primary">{formatVND(c.compensation)}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="px-5 mt-6">
        <h2 className="text-[17px] font-bold text-primary mb-3">Campaign Description</h2>
        <p className="text-[14px] text-muted-foreground leading-relaxed">{c.brief}</p>
      </section>

      {/* Timeline Section */}
      <section className="px-5 mt-6">
        <h2 className="text-[17px] font-bold text-primary mb-3">Campaign Execution Timeline</h2>
        <ol className="relative border-l-2 border-border/70 pl-5 ml-1.5 space-y-4">
          {stages.map((s, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
              <div className="text-sm font-semibold text-foreground">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.date}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* Media Spaces Section */}
      <section className="px-5 mt-6 pb-12">
        <h2 className="text-[17px] font-bold text-primary mb-3">Media Spaces</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
          {mediaSpaces.map((ms) => (
            <div key={ms.id} className="w-[85%] shrink-0 snap-start bg-card rounded-2xl border border-border/60 p-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="font-semibold text-sm text-foreground truncate">{ms.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Location: <span className="font-medium text-foreground">{ms.location}</span></div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">{ms.requirement}</p>
              </div>

              <div className="mt-4">
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">Retailer Reference Photos</div>
                <div className="grid grid-cols-2 gap-2">
                  {ms.images.map((imgUrl, idx) => (
                    <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-muted border border-border/40">
                      <img
                        src={imgUrl}
                        alt={`${ms.name} ref ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fixed Bottom Register Footer */}
      <div className="fixed bottom-[60px] left-1/2 -translate-x-1/2 w-full max-w-md bg-background/95 backdrop-blur-xl border-t border-border p-4 z-30">
        {alreadyRegistered ? (
          <button disabled className="w-full h-12 rounded-xl bg-muted text-muted-foreground font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="h-5 w-5" /> Already registered
          </button>
        ) : (
          <button
            onClick={onRegister}
            className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-card cursor-pointer active:scale-[0.99] transition-transform"
          >
            Register
          </button>
        )}
      </div>
      </div>
    </AppShell>
  );
}
