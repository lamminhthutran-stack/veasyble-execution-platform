import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { CAMPAIGNS, formatVND, STEP_LABELS } from "@/lib/mock-data";
import { TrendingUp, Clock, CheckCircle2, ListChecks, Bell } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Veasyble Executor" },
      { name: "description", content: "Your campaign snapshot and upcoming reminders." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { activity, history, profile } = useStore();
  const inProgress = activity.length;
  const completed = history.length;
  const total = inProgress + completed;
  const projected =
    activity.reduce((sum, a) => sum + (CAMPAIGNS.find((c) => c.id === a.campaignId)?.compensation ?? 0), 0);

  const reminders = activity
    .map((a) => ({ a, c: CAMPAIGNS.find((c) => c.id === a.campaignId)! }))
    .filter((x) => x.c)
    .sort((a, b) => a.c.deadline.localeCompare(b.c.deadline));

  return (
    <AppShell>
      <div className="bg-gradient-hero text-white px-5 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/80 text-sm">Welcome back</div>
            <div className="text-2xl font-bold mt-0.5">{profile.fullName.split(" ")[0]}</div>
          </div>
          <button className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center backdrop-blur">
            <Bell className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 bg-white/12 backdrop-blur rounded-2xl p-4 border border-white/15">
          <div className="text-xs uppercase tracking-wider text-white/80 font-semibold">Projected monthly earnings</div>
          <div className="mt-1 text-3xl font-bold font-display">{formatVND(projected)}</div>
          <Link to="/earnings" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white/90">
            <TrendingUp className="h-4 w-4" /> View earnings
          </Link>
        </div>
      </div>

      <section className="px-5 mt-6">
        <div className="grid grid-cols-3 gap-3">
          <Kpi icon={<Clock className="h-4 w-4" />} value={inProgress} label="In progress" />
          <Kpi icon={<CheckCircle2 className="h-4 w-4" />} value={completed} label="Completed" />
          <Kpi icon={<ListChecks className="h-4 w-4" />} value={total} label="Total" />
        </div>
      </section>

      <section className="px-5 mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Timeline</h2>
          <Link to="/activity" className="text-sm text-primary font-medium">View all</Link>
        </div>
        <ol className="mt-3 relative border-l-2 border-border/70 pl-5 space-y-4">
          {reminders.length === 0 && (
            <li className="text-sm text-muted-foreground">No upcoming campaigns. Browse the marketplace to register.</li>
          )}
          {reminders.map(({ a, c }) => (
            <li key={c.id} className="relative">
              <span className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
              <div className="bg-card rounded-xl border border-border/60 p-3 shadow-card">
                <div className="text-xs text-muted-foreground">Deadline {c.deadline.slice(5)} • {STEP_LABELS[a.step]}</div>
                <div className="mt-0.5 font-medium text-sm">{c.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.retailer} • {c.location}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </AppShell>
  );
}

function Kpi({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border/60 p-3 shadow-card">
      <div className="text-muted-foreground">{icon}</div>
      <div className="mt-1 text-2xl font-bold font-display">{value}</div>
      <div className="text-[11px] text-muted-foreground font-medium">{label}</div>
    </div>
  );
}
