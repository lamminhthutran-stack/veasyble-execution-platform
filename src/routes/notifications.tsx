import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, AlertCircle, Info, BellRing } from "lucide-react";
import { useStore } from "@/lib/store";
import { CAMPAIGNS } from "@/lib/mock-data";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [{ title: "Notifications — Veasyble Executor" }],
  }),
  component: NotificationsPage,
});

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function NotificationsPage() {
  const navigate = useNavigate();
  const { activity, notifications, markAllAsRead } = useStore();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  // Mark all notifications as read when leaving the screen
  useEffect(() => {
    return () => {
      markAllAsRead();
    };
  }, [markAllAsRead]);

  const todayStr = new Date().toISOString().split("T")[0];
  
  // Dynamically generate warnings for overdue activities not marked done
  const overdueNotifications = activity
    .filter((a) => a.step !== "approved" && a.step !== "step5_review" && !a.proofUploaded)
    .map((a) => {
      const c = CAMPAIGNS.find((x) => x.id === a.campaignId);
      return { a, c };
    })
    .filter(({ c }) => c && todayStr > c.deadline)
    .map(({ c }) => ({
      id: `overdue-${c!.id}`,
      type: "warning" as const,
      title: "Overdue Deadline Warning",
      message: `The deadline for campaign '${c!.title}' was ${formatDate(c!.deadline)}. Please complete POSM setup and submit proof immediately!`,
      time: "Just now",
      read: false,
    }));

  const allNotifications = [...overdueNotifications, ...notifications];
  const unreadCount = allNotifications.filter((n) => !n.read).length;
  
  const displayedNotifications = activeTab === "all" 
    ? allNotifications 
    : allNotifications.filter((n) => !n.read);

  return (
    <div className="mx-auto max-w-md min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center gap-3 h-14 px-4">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history && window.history.length > 1) {
                window.history.back();
              } else {
                navigate({ to: "/dashboard" });
              }
            }}
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold tracking-tight">Notifications</h1>
        </div>

        {/* Tab switch buttons for All and Unread */}
        <div className="flex border-t border-border/40 px-4 bg-background">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
              activeTab === "all" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
          >
            All ({allNotifications.length})
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
              activeTab === "unread" ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </header>

      <div className="px-5 pt-2 divide-y divide-border/60">
        {displayedNotifications.length === 0 ? (
          <div className="text-center py-20">
            <BellRing className="h-10 w-10 text-muted-foreground mx-auto opacity-40 mb-3" />
            <p className="text-sm text-muted-foreground">No notifications here.</p>
          </div>
        ) : (
          displayedNotifications.map((n) => {
            const Icon =
              n.type === "success"
                ? CheckCircle2
                : n.type === "warning"
                  ? AlertCircle
                  : Info;
            const iconColor =
              n.type === "success"
                ? "text-success bg-success/10"
                : n.type === "warning"
                  ? "text-destructive bg-destructive/10"
                  : "text-primary bg-primary/10";

            return (
              <div
                key={n.id}
                className="py-4 active:bg-secondary/10 transition-colors flex items-center justify-between gap-3.5"
              >
                <div className="flex gap-3.5 min-w-0 flex-1">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[14px] leading-snug">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                  </div>
                </div>

                {/* Right red dot for unread items */}
                {!n.read && (
                  <span className="h-2 w-2 rounded-full bg-destructive shrink-0 ml-2 shadow-sm animate-pulse" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
