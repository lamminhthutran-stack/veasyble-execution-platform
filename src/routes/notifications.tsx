import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, AlertCircle, Info, BellRing, X } from "lucide-react";
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
  const { activity, notifications, markAsRead } = useStore();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [selectedNoti, setSelectedNoti] = useState<any | null>(null);

  const handleNotiClick = (n: any) => {
    setSelectedNoti(n);
    if (!n.id.startsWith("overdue-")) {
      markAsRead(n.id);
    }
  };

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
                onClick={() => handleNotiClick(n)}
                className="py-4 hover:bg-secondary/30 active:bg-secondary/40 transition-colors flex items-center justify-between gap-3.5 px-3 rounded-xl cursor-pointer mt-1 first:mt-0"
              >
                <div className="flex gap-3.5 min-w-0 flex-1">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-semibold text-[14px] leading-snug ${!n.read ? "text-foreground font-bold" : "text-muted-foreground font-medium"}`}>{n.title}</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-1">{n.message}</p>
                  </div>
                </div>

                {/* Right red dot for unread items */}
                {!n.read && (
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive shrink-0 ml-2 shadow-sm animate-pulse" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Notification Modal Pop-up Screen */}
      {selectedNoti && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border p-5 shadow-elevated space-y-4 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  selectedNoti.type === "success" 
                    ? "text-success bg-success/10" 
                    : selectedNoti.type === "warning" 
                      ? "text-destructive bg-destructive/10" 
                      : "text-primary bg-primary/10"
                }`}>
                  <BellRing className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">
                    {selectedNoti.type === "warning" ? "Admin / Alert" : "System Notification"}
                  </div>
                  <div className="text-xs font-medium text-foreground">{selectedNoti.time}</div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNoti(null)}
                className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-foreground leading-snug">{selectedNoti.title}</h3>
              
              <div className="text-xs text-muted-foreground leading-relaxed bg-secondary/35 rounded-xl p-3 border border-border/20">
                <span className="font-semibold text-foreground">Sender:</span> Veasyble Admin Operations
                <div className="mt-2 pt-2 border-t border-border/20">
                  <span className="font-semibold text-foreground">Issue / Message:</span>
                  <p className="mt-1 text-foreground/90 font-normal leading-relaxed">{selectedNoti.message}</p>
                </div>
              </div>
            </div>

            {(() => {
              let campaignId = "";
              if (selectedNoti.id.startsWith("overdue-")) {
                campaignId = selectedNoti.id.replace("overdue-", "");
              } else if (selectedNoti.id.startsWith("reject-")) {
                const cleaned = selectedNoti.id.replace("reject-", "");
                const lastIndex = cleaned.lastIndexOf("-");
                campaignId = lastIndex !== -1 ? cleaned.substring(0, lastIndex) : cleaned;
              } else if (selectedNoti.id.startsWith("approve-")) {
                const cleaned = selectedNoti.id.replace("approve-", "");
                const lastIndex = cleaned.lastIndexOf("-");
                campaignId = lastIndex !== -1 ? cleaned.substring(0, lastIndex) : cleaned;
              }

              const hasTarget = !!campaignId;
              const c = hasTarget ? CAMPAIGNS.find((x) => x.id === campaignId) : null;
              const buttonText = c ? `Go to ${c.brand} Details` : "Go to Campaign Details";

              return (
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setSelectedNoti(null)}
                    className="flex-1 h-10 rounded-xl bg-secondary text-foreground text-xs font-semibold flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                  >
                    Close
                  </button>
                  {hasTarget ? (
                    <button
                      onClick={() => {
                        setSelectedNoti(null);
                        navigate({ to: `/activity/${campaignId}` });
                      }}
                      className="flex-1 h-10 rounded-xl bg-gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all shadow-card"
                    >
                      {buttonText}
                    </button>
                  ) : null}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
