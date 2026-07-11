import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { ChevronRight, LogOut, User, Globe, Shield, Clock, CheckCircle2, ListChecks } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "My Profile — Veasyble Executor" }],
  }),
  component: Profile,
});

function Profile() {
  const { profile, status, logout, updateProfile, activity, history } = useStore();
  const navigate = useNavigate();

  const inProgress = activity.length;
  const completed = history.length;
  const total = inProgress + completed;



  return (
    <AppShell title="My Profile">
      <div className="px-5 pt-4">
        <div className="flex items-center gap-4 py-2">
          <div className="h-14 w-14 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.fullName} className="w-full h-full object-cover" />
            ) : (
              profile.fullName.split(" ").map((p) => p[0]).join("").slice(0, 2)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-lg">{profile.fullName}</div>
            <div className="text-xs text-muted-foreground truncate">{profile.email}</div>
            <span className={`mt-1 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              status === "active" ? "bg-success/15 text-success" : status === "paused" ? "bg-warning/25 text-warning-foreground" : "bg-secondary text-muted-foreground"
            }`}>{status}</span>
          </div>
        </div>
      </div>

      <section className="px-5 mt-4">
        <div className="grid grid-cols-3 gap-3">
          <Kpi icon={<Clock className="h-5 w-5" />} value={inProgress} label="In progress" />
          <Kpi icon={<CheckCircle2 className="h-5 w-5" />} value={completed} label="Completed" />
          <Kpi icon={<ListChecks className="h-5 w-5" />} value={total} label="Total" />
        </div>
      </section>


      <div className="px-5 mt-6 flex flex-col gap-1 pb-20">
        <h3 className="text-lg font-semibold text-foreground mb-3 mt-4">Settings</h3>
        
        <Link to="/profile-info" className="w-full flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Personal Information</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div className="border-t border-border/40" />

        <div className="w-full flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Language</span>
          </div>
          <select 
            className="text-sm font-medium bg-transparent border-none focus:ring-0 outline-none cursor-pointer"
            value={profile.language}
            onChange={(e) => updateProfile({ language: e.target.value })}
          >
            <option value="English">English</option>
            <option value="Vietnamese">Vietnamese</option>
          </select>
        </div>
        <div className="border-t border-border/40" />

        <Link to="/profile-account" className="w-full flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Account Settings</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <div className="border-t border-border/40" />

        <button onClick={() => { logout(); navigate({ to: "/login" }); }} className="w-full flex items-center justify-between py-4 mt-2 text-destructive">
          <div className="flex items-center gap-3">
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Log out</span>
          </div>
        </button>
      </div>
    </AppShell>
  );
}

function Kpi({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-card flex flex-col items-start">
      <div className="text-muted-foreground mb-4">{icon}</div>
      <div className="text-3xl font-bold font-display text-foreground leading-none">{value}</div>
      <div className="text-[11px] text-muted-foreground font-medium mt-1.5">{label}</div>
    </div>
  );
}
