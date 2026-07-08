import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CAMPAIGNS, formatVND } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { ArrowLeft, MapPin, Calendar, DollarSign, Building2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/campaign/$id")({
  component: CampaignDetail,
});

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

  const stages = [
    { label: "Registered", date: c.windowStart },
    { label: "Printing & Production", date: c.productionStart },
    { label: "Execution in Progress", date: c.executionStart },
    { label: "Deadline", date: c.deadline },
  ];

  function onRegister() {
    register(c!.id);
    navigate({ to: "/activity" });
  }

  return (
    <div className="mx-auto max-w-md min-h-screen bg-background pb-32">
      <div className="relative text-white overflow-hidden" style={{ backgroundColor: c.brandColor }}>
        <button
          onClick={() => navigate({ to: "/marketplace" })}
          className="absolute top-4 left-4 h-9 w-9 rounded-full bg-black/25 backdrop-blur flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="px-5 pt-16 pb-8">
          <div className="text-sm opacity-90 font-medium">{c.brand}</div>
          <h1 className="mt-1 text-2xl font-bold leading-tight">{c.title}</h1>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-3 py-1.5 text-sm">
            <DollarSign className="h-4 w-4" /> {formatVND(c.compensation)}
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-card rounded-2xl shadow-card border border-border/60 p-4 space-y-3">
          <Info icon={<Building2 className="h-4 w-4" />} label="Retailer" value={c.retailer} />
          <Info icon={<MapPin className="h-4 w-4" />} label="Location" value={`${c.location}, ${c.city}`} />
          <Info icon={<Calendar className="h-4 w-4" />} label="Window" value={`${c.windowStart} → ${c.windowEnd}`} />
        </div>
      </div>

      <section className="px-5 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Campaign Brief</h2>
        <p className="mt-2 text-[15px] leading-relaxed">{c.brief}</p>
      </section>

      <section className="px-5 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Execution timeline</h2>
        <ol className="mt-3 relative border-l-2 border-border/70 pl-5 space-y-3">
          {stages.map((s, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
              <div className="text-sm font-medium">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.date}</div>
            </li>
          ))}
        </ol>
      </section>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/95 backdrop-blur-xl border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {alreadyRegistered ? (
          <button disabled className="w-full h-12 rounded-xl bg-muted text-muted-foreground font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="h-5 w-5" /> Already registered
          </button>
        ) : (
          <button
            onClick={onRegister}
            className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-card"
          >
            Register — auto-confirm
          </button>
        )}
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <div className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wide">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
