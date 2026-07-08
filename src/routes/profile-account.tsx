import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/profile-account")({
  head: () => ({
    meta: [{ title: "Account Settings — Veasyble Executor" }],
  }),
  component: ProfileAccount,
});

function ProfileAccount() {
  const { status, pause, resume, logout, activity } = useStore();
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
    <AppShell title="Account Settings">
      <div className="px-5 pt-4 pb-20">
        <button onClick={() => navigate({ to: "/profile" })} className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </button>

        {msg && (
          <div className="mb-4 rounded-xl bg-accent text-accent-foreground text-sm px-4 py-3">{msg}</div>
        )}

        <div className="space-y-4">
          <button onClick={togglePause} className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xl">{status === "paused" ? "▶️" : "⏸️"}</span>
              <div className="text-left">
                <div className="text-sm font-medium">{status === "paused" ? "Resume account" : "Pause account"}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{status === "paused" ? "Start receiving campaigns again" : "Temporarily stop receiving campaigns"}</div>
              </div>
            </div>
          </button>

          <button onClick={onDelete} className="w-full flex items-center justify-between p-4 bg-destructive/5 rounded-2xl border border-destructive/20 shadow-sm text-destructive">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5" />
              <div className="text-left">
                <div className="text-sm font-medium">Delete account</div>
                <div className="text-xs opacity-80 mt-0.5">Permanently remove all your data</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
