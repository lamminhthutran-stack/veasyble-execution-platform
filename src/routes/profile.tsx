import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { ChevronRight, LogOut, Pause, Play, Trash2, User, Globe, CreditCard } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "My Profile — Veasyble Executor" }],
  }),
  component: Profile,
});

function Profile() {
  const { profile, status, pause, resume, logout, activity } = useStore();
  const navigate = useNavigate();
  const [msg, setMsg] = useState<string | null>(null);

  function togglePause() {
    if (status === "paused") {
      resume();
      setMsg("Account resumed. Confirmation email sent.");
    } else {
      const r = pause();
      setMsg(r.ok ? "Account paused. Confirmation email sent." : r.reason || "Unable to pause");
    }
    setTimeout(() => setMsg(null), 3500);
  }

  function onDelete() {
    if (activity.length > 0) {
      setMsg("Resolve in-progress campaigns before deleting.");
      setTimeout(() => setMsg(null), 3500);
      return;
    }
    if (confirm("Delete account? This action cannot be undone.")) {
      logout();
      navigate({ to: "/login" });
    }
  }

  return (
    <AppShell title="My Profile">
      <div className="px-5 pt-4">
        <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-card flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            {profile.fullName.split(" ").map((p) => p[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold">{profile.fullName}</div>
            <div className="text-xs text-muted-foreground truncate">{profile.email}</div>
            <span className={`mt-1 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              status === "active" ? "bg-success/15 text-success" : status === "paused" ? "bg-warning/25 text-warning-foreground" : "bg-secondary text-muted-foreground"
            }`}>{status}</span>
          </div>
        </div>

        {msg && (
          <div className="mt-3 rounded-xl bg-accent text-accent-foreground text-sm px-4 py-3">{msg}</div>
        )}
      </div>

      <Section title="Personal information" icon={<User className="h-4 w-4" />}>
        <Row label="Full name" value={profile.fullName} />
        <Row label="Phone" value={profile.phone} />
        <Row label="Personal email" value={profile.personalEmail} />
        <Row label="ID number" value={profile.idNumber} />
        <Row label="Address" value={profile.address} />
      </Section>

      <Section title="Payout method" icon={<CreditCard className="h-4 w-4" />}>
        <Row label="Bank account" value={profile.bank} />
      </Section>

      <Section title="Preferences" icon={<Globe className="h-4 w-4" />}>
        <Row label="Language" value={profile.language} />
      </Section>

      <section className="px-5 mt-6">
        <h3 className="text-xs uppercase font-semibold text-muted-foreground tracking-wide mb-2">Account</h3>
        <div className="bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden">
          <button onClick={togglePause} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/60 transition-colors">
            {status === "paused" ? <Play className="h-4 w-4 text-primary" /> : <Pause className="h-4 w-4 text-warning-foreground" />}
            <span className="flex-1 text-left text-sm font-medium">{status === "paused" ? "Resume account" : "Pause account"}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="border-t border-border" />
          <button onClick={() => { logout(); navigate({ to: "/login" }); }} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/60 transition-colors">
            <LogOut className="h-4 w-4" />
            <span className="flex-1 text-left text-sm font-medium">Log out</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="border-t border-border" />
          <button onClick={onDelete} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-destructive/10 transition-colors text-destructive">
            <Trash2 className="h-4 w-4" />
            <span className="flex-1 text-left text-sm font-medium">Delete account</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </AppShell>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="px-5 mt-6">
      <h3 className="text-xs uppercase font-semibold text-muted-foreground tracking-wide mb-2 flex items-center gap-1.5">
        {icon} {title}
      </h3>
      <div className="bg-card rounded-2xl border border-border/60 shadow-card divide-y divide-border">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}
