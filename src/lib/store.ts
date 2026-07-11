import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type ActivityEntry,
  type CampaignStep,
  CAMPAIGNS,
  INITIAL_ACTIVITY,
  INITIAL_HISTORY,
  formatVND,
} from "./mock-data";

type AccountStatus = "pending" | "active" | "paused" | "deactivated" | "deleted";

type Profile = {
  fullName: string;
  phone: string;
  email: string;
  personalEmail: string;
  idNumber: string;
  bank: string;
  address: string;
  city: string;
  ward: string;
  language: string;
  avatar?: string;
};

export interface NotificationItem {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

type State = {
  isAuthed: boolean;
  status: AccountStatus;
  profile: Profile;
  activity: ActivityEntry[];
  history: ActivityEntry[];
  notifications: NotificationItem[];
  login: () => void;
  logout: () => void;
  register: (campaignId: string) => void;
  advanceStep: (campaignId: string, to: CampaignStep) => void;
  completePrinting: (campaignId: string) => void;
  startExecution: (campaignId: string) => void;
  submitProof: (campaignId: string) => void;
  approve: (campaignId: string) => void;
  reject: (campaignId: string, reason: string) => void;
  pause: () => { ok: boolean; reason?: string };
  resume: () => void;
  updateProfile: (p: Partial<Profile>) => void;
  markAllAsRead: () => void;
};

const stepOrder: CampaignStep[] = [
  "step1_registered",
  "step2_printing",
  "step3_execution",
  "step5_review",
];

export function resolveActivityStep(a: ActivityEntry): CampaignStep {
  if (a.step === "approved") return "approved";
  if (a.step === "step5_review" || a.proofUploaded) return "step5_review";
  
  const c = CAMPAIGNS.find((x) => x.id === a.campaignId);
  if (!c) return a.step;
  
  const todayStr = new Date().toISOString().split("T")[0];
  
  // Can only enter step 3 (Execution) if step 2 (Printing) is complete
  if (a.printingDone && todayStr >= c.executionStart) {
    return "step3_execution";
  }
  
  // Can enter step 2 (Printing) if production date reached
  if (todayStr >= c.productionStart) {
    return "step2_printing";
  }
  
  return a.step;
}

function startingStepFor(campaignId: string): CampaignStep {
  const c = CAMPAIGNS.find((x) => x.id === campaignId);
  if (!c) return "step1_registered";
  const todayStr = new Date().toISOString().split("T")[0];
  if (todayStr >= c.executionStart) return "step3_execution";
  if (todayStr >= c.productionStart) return "step2_printing";
  return "step1_registered";
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      isAuthed: false,
      status: "active",
      profile: {
        fullName: "Linh Nguyen",
        phone: "+84 90 123 4567",
        email: "linh.nguyen@veasyble.com",
        personalEmail: "linh.nguyen@gmail.com",
        idNumber: "079xxxxxxxx",
        bank: "VCB • •••• 4821",
        address: "42 Nguyen Hue, District 1, HCMC",
        city: "Ho Chi Minh City",
        ward: "Phường Bến Nghé, Quận 1",
        language: "English",
        avatar: "/profile_avatar_demo.png",
      },
      activity: INITIAL_ACTIVITY,
      history: INITIAL_HISTORY,
      notifications: [
        {
          id: "n-1",
          type: "success",
          title: "Proof Approved",
          message: "Your proof for Beauty Gondola Takeover has been approved. Compensation of 780,000₫ has been added to your balance.",
          time: "2 hours ago",
          read: false,
        },
        {
          id: "n-2",
          type: "warning",
          title: "Action Required",
          message: "Proof rejected: Product facings do not match planogram for Endcap Setup — Winter Serum Launch. Please resubmit photo proof.",
          time: "1 day ago",
          read: false,
        },
        {
          id: "n-3",
          type: "info",
          title: "New Campaign Available",
          message: "New campaign 'Apple AirPods Max Display Update' is available in your city.",
          time: "3 days ago",
          read: true,
        },
        {
          id: "n-4",
          type: "info",
          title: "Welcome to Veasyble",
          message: "Complete your profile settings to start receiving campaigns.",
          time: "5 days ago",
          read: true,
        },
      ],
      login: () => set({ isAuthed: true, status: "active" }),
      logout: () => set({ isAuthed: false }),
      register: (campaignId) => {
        const { activity, history } = get();
        if (activity.some((a) => a.campaignId === campaignId)) return;
        if (history.some((a) => a.campaignId === campaignId)) return;
        set({
          activity: [
            ...activity,
            {
              campaignId,
              step: startingStepFor(campaignId),
              registeredAt: new Date().toISOString(),
            },
          ],
        });
      },
      advanceStep: (campaignId, to) =>
        set({
          activity: get().activity.map((a) =>
            a.campaignId === campaignId ? { ...a, step: to, rejectionReason: undefined } : a,
          ),
        }),
      completePrinting: (campaignId) =>
        set({
          activity: get().activity.map((a) =>
            a.campaignId === campaignId ? { ...a, printingDone: true } : a,
          ),
        }),
      startExecution: (campaignId) =>
        set({
          activity: get().activity.map((a) =>
            a.campaignId === campaignId ? { ...a, executionStarted: true } : a,
          ),
        }),
      submitProof: (campaignId) =>
        set({
          activity: get().activity.map((a) =>
            a.campaignId === campaignId
              ? { ...a, step: "step5_review", proofUploaded: true, rejectionReason: undefined }
              : a,
          ),
        }),
      approve: (campaignId) => {
        const entry = get().activity.find((a) => a.campaignId === campaignId);
        if (!entry) return;
        const c = CAMPAIGNS.find((x) => x.id === campaignId);
        const title = c ? c.title : "Campaign";
        const comp = c ? c.compensation : 0;
        const newNoti: NotificationItem = {
          id: `approve-${campaignId}-${Date.now()}`,
          type: "success",
          title: "Proof Approved",
          message: `Your proof for '${title}' has been approved. Compensation of ${formatVND(comp)} has been added to your balance.`,
          time: "Just now",
          read: false,
        };
        set({
          activity: get().activity.filter((a) => a.campaignId !== campaignId),
          history: [{ ...entry, step: "approved" }, ...get().history],
          notifications: [newNoti, ...get().notifications],
        });
      },
      reject: (campaignId, reason) => {
        const c = CAMPAIGNS.find((x) => x.id === campaignId);
        const title = c ? c.title : "Campaign";
        const newNoti: NotificationItem = {
          id: `reject-${campaignId}-${Date.now()}`,
          type: "warning",
          title: "Proof Rejected — Action Required",
          message: `Your proof submission for '${title}' was rejected by admin: "${reason}". Please review and resubmit proof.`,
          time: "Just now",
          read: false,
        };
        set({
          activity: get().activity.map((a) =>
            a.campaignId === campaignId ? { ...a, step: "step3_execution", rejectionReason: reason, executionStarted: false } : a,
          ),
          notifications: [newNoti, ...get().notifications],
        });
      },
      pause: () => {
        if (get().activity.length > 0) {
          return { ok: false, reason: "You have in-progress campaigns. Complete them first." };
        }
        set({ status: "paused" });
        return { ok: true };
      },
      resume: () => set({ status: "active" }),
      updateProfile: (p) => set({ profile: { ...get().profile, ...p } }),
      markAllAsRead: () =>
        set({
          notifications: get().notifications.map((n) => ({ ...n, read: true })),
        }),
    }),
    { name: "veasyble-executor" },
  ),
);

export { stepOrder };
