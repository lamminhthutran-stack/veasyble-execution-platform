import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AlertCircle, ArrowLeft, CheckCircle2, Info } from "lucide-react";
import { useState } from "react";
import type { Notification } from "@/lib/mock-data";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [{ title: "Notifications — Veasyble Executor" }],
  }),
  component: Notifications,
});

function Notifications() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead } = useStore();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [selected, setSelected] = useState<Notification | null>(null);
  const unread = notifications.filter((item) => item.unread);
  const list = tab === "all" ? notifications : unread;

  function openNotification(notification: Notification) {
    markNotificationRead(notification.id);
    setSelected(notification);
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-10">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <button onClick={() => navigate({ to: "/dashboard" })} className="flex h-9 w-9 items-center justify-center rounded bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-semibold">Notifications</h1>
        </div>
      </header>

      <div className="px-5 pt-4">
        <div className="flex border-b border-border">
          <button onClick={() => setTab("all")} className={`relative h-10 flex-1 text-sm font-semibold ${tab === "all" ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary" : "text-muted-foreground"}`}>
            All ({notifications.length})
          </button>
          <button onClick={() => setTab("unread")} className={`relative h-10 flex-1 text-sm font-semibold ${tab === "unread" ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary" : "text-muted-foreground"}`}>
            Unread ({unread.length})
          </button>
        </div>

        <div className="mt-3 divide-y divide-border/60">
          {list.map((notification) => (
            <button key={notification.id} onClick={() => openNotification(notification)} className="flex w-full items-center gap-3 py-4 text-left">
              <NotificationIcon type={notification.type} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-semibold">{notification.title}</div>
                  <div className="shrink-0 text-[11px] text-muted-foreground">{relativeTime(notification.sentAt)}</div>
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{notification.message}</div>
              </div>
              {notification.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />}
            </button>
          ))}
          {list.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No notifications in this tab.</div>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded bg-card p-5">
            <div className="flex items-start gap-3">
              <NotificationIcon type={selected.type} />
              <div>
                <h2 className="font-semibold">{selected.title}</h2>
                <div className="mt-1 text-xs text-muted-foreground">{selected.sender} • {relativeTime(selected.sentAt)}</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed">{selected.message}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setSelected(null)} className="h-11 rounded border border-border text-sm font-semibold">
                Cancel
              </button>
              <button
                onClick={() => {
                  setSelected(null);
                  if (selected.campaignId) navigate({ to: `/activity/${selected.campaignId}` });
                }}
                className="h-11 rounded bg-primary text-sm font-semibold text-primary-foreground"
              >
                View Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationIcon({ type }: { type: Notification["type"] }) {
  if (type === "approved") {
    return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-5 w-5" /></span>;
  }
  if (type === "rejected") {
    return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700"><AlertCircle className="h-5 w-5" /></span>;
  }
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700"><Info className="h-5 w-5" /></span>;
}

function relativeTime(sentAt: string) {
  const sent = new Date(sentAt).getTime();
  const now = new Date("2026-07-17T10:00:00").getTime();
  const hours = Math.max(0, Math.round((now - sent) / 3600000));
  if (hours === 0) return "Just now";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
