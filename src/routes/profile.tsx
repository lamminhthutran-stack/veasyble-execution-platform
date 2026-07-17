import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { CheckCircle2, ChevronDown, ChevronRight, Clock3, Globe, ListChecks, LogOut, Shield, User } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "My Profile — Veasyble Executor" }],
  }),
  component: Profile,
});

function Profile() {
  const { profile, status, logout, updateProfile, activity, history } = useStore();
  const navigate = useNavigate();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const completed = history.length;
  const inProgress = activity.length;

  return (
    <AppShell title="My Profile">
      <div className="px-5 pt-4 pb-20">
        <div className="flex items-center gap-4 py-2">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-lg font-bold text-primary-foreground">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.fullName} className="h-full w-full object-cover" />
            ) : (
              profile.fullName.split(" ").map((p) => p[0]).join("").slice(0, 2)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold">{profile.fullName}</div>
            <div className="truncate text-xs text-muted-foreground">{profile.email}</div>
            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
              status === "active" ? "bg-emerald-100 text-emerald-700" : status === "paused" ? "bg-orange-100 text-orange-700" : "bg-secondary text-muted-foreground"
            }`}>{status}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <Stat icon={<Clock3 className="h-4 w-4" />} label="In progress" value={inProgress} />
          <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Completed" value={completed} />
          <Stat icon={<ListChecks className="h-4 w-4" />} label="Total" value={inProgress + completed} />
        </div>

        <h3 className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Settings</h3>
        <div className="divide-y divide-border/50">
          <SettingsLink to="/profile-info" icon={<User className="h-5 w-5" />} label="Personal Information" />

          <div className="relative">
            <button onClick={() => setLanguageOpen((open) => !open)} className="flex w-full items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Language</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                {profile.language} <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
            {languageOpen && (
              <div className="absolute right-0 top-12 z-20 w-44 rounded border border-border bg-card p-1 shadow-elevated">
                {["English", "Vietnamese"].map((language) => (
                  <button
                    key={language}
                    onClick={() => {
                      updateProfile({ language });
                      setLanguageOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded px-3 py-2 text-sm"
                  >
                    {language}
                    {profile.language === language && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <SettingsLink to="/profile-account" icon={<Shield className="h-5 w-5" />} label="Account Settings" />
        </div>

        <button onClick={() => setLogoutOpen(true)} className="mt-4 flex w-full items-center gap-3 py-4 text-left text-destructive">
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-semibold">Log out</span>
        </button>
      </div>

      {logoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded bg-card p-5">
            <h2 className="font-semibold">Log out?</h2>
            <p className="mt-2 text-sm text-muted-foreground">You will need to sign in again before using this device.</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setLogoutOpen(false)} className="h-11 rounded border border-border text-sm font-semibold">Cancel</button>
              <button onClick={() => { logout(); navigate({ to: "/login" }); }} className="h-11 rounded bg-primary text-sm font-semibold text-primary-foreground">Yes</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded border border-border/70 bg-card p-3 text-center shadow-card">
      <div className="mx-auto flex h-7 w-7 items-center justify-center text-muted-foreground">{icon}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function SettingsLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex w-full items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
