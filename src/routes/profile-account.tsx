import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { ArrowLeft, Trash2, Pause, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/profile-account")({
  head: () => ({
    meta: [{ title: "Account Settings — Veasyble Executor" }],
  }),
  component: ProfileAccount,
});

function ResponsiveConfirm({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  destructive = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  destructive?: boolean;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>
          {trigger}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pt-2">
            <Button variant={destructive ? "destructive" : "default"} onClick={() => { onConfirm(); onOpenChange(false); }}>{confirmText}</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => { onConfirm(); onOpenChange(false); }} className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ProfileAccount() {
  const { status, pause, resume, logout, activity } = useStore();
  const navigate = useNavigate();
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function handlePauseConfirm() {
    if (status === "paused") {
      resume();
      toast("Account resumed. Confirmation email sent.");
    } else {
      const r = pause();
      if (r.ok) {
        toast("Account paused. Confirmation email sent.");
      } else {
        toast(r.reason || "Unable to pause");
      }
    }
  }



  function handleDeleteConfirm() {
    if (activity.length > 0) {
      toast("Resolve in-progress campaigns before deleting.");
      return;
    }
    logout();
    toast("Account deleted. Confirmation email sent.");
    navigate({ to: "/login" });
  }

  return (
    <AppShell>
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center gap-3 h-14 px-5">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history && window.history.length > 1) {
                window.history.back();
              } else {
                navigate({ to: "/profile" });
              }
            }}
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">Account Settings</h1>
        </div>
      </header>

      <div className="px-5 pt-4 pb-20">

        <div className="space-y-4">
          <ResponsiveConfirm
            open={isPauseOpen}
            onOpenChange={setIsPauseOpen}
            title="Are you sure?"
            description={
              status === "paused" 
                ? "Do you want to resume your account and start receiving campaigns again?"
                : "Do you want to pause your account? You will temporarily stop receiving campaigns."
            }
            onConfirm={handlePauseConfirm}
            trigger={
              <button className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-border/60 shadow-sm">
                <div className="flex items-center gap-3">
                  {status === "paused" ? (
                    <Play className="h-5 w-5" />
                  ) : (
                    <Pause className="h-5 w-5" />
                  )}
                  <div className="text-left">
                    <div className="text-sm font-medium">{status === "paused" ? "Resume account" : "Pause account"}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{status === "paused" ? "Start receiving campaigns again" : "Temporarily stop receiving campaigns"}</div>
                  </div>
                </div>
              </button>
            }
          />

          <ResponsiveConfirm
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            title="Are you sure?"
            description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
            onConfirm={handleDeleteConfirm}
            confirmText="Delete Account"
            destructive={true}
            trigger={
              <button className="w-full flex items-center justify-between p-4 bg-destructive/5 rounded-2xl border border-destructive/20 shadow-sm text-destructive">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Delete account</div>
                    <div className="text-xs opacity-80 mt-0.5">Permanently remove all your data</div>
                  </div>
                </div>
              </button>
            }
          />
        </div>
      </div>
    </AppShell>
  );
}
