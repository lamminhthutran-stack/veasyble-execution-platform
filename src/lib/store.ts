import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type ActivityEntry,
  type CampaignStep,
  CAMPAIGNS,
  INITIAL_ACTIVITY,
  INITIAL_HISTORY,
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
  language: string;
};

type State = {
  isAuthed: boolean;
  status: AccountStatus;
  profile: Profile;
  activity: ActivityEntry[];
  history: ActivityEntry[];
  login: () => void;
  logout: () => void;
  register: (campaignId: string) => void;
  advanceStep: (campaignId: string, to: CampaignStep) => void;
  submitProof: (campaignId: string) => void;
  approve: (campaignId: string) => void;
  reject: (campaignId: string, reason: string) => void;
  pause: () => { ok: boolean; reason?: string };
  resume: () => void;
  updateProfile: (p: Partial<Profile>) => void;
};

const stepOrder: CampaignStep[] = [
  "step1_registered",
  "step2_printing",
  "step3_execution",
  "step4_completed",
  "step5_review",
];

function startingStepFor(campaignId: string): CampaignStep {
  const c = CAMPAIGNS.find((x) => x.id === campaignId);
  if (!c) return "step1_registered";
  const today = new Date("2026-07-08");
  if (new Date(c.executionStart) <= today) return "step3_execution";
  if (new Date(c.productionStart) <= today) return "step2_printing";
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
        language: "English",
      },
      activity: INITIAL_ACTIVITY,
      history: INITIAL_HISTORY,
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
        set({
          activity: get().activity.filter((a) => a.campaignId !== campaignId),
          history: [...get().history, { ...entry, step: "approved" }],
        });
      },
      reject: (campaignId, reason) =>
        set({
          activity: get().activity.map((a) =>
            a.campaignId === campaignId ? { ...a, step: "step4_completed", rejectionReason: reason } : a,
          ),
        }),
      pause: () => {
        if (get().activity.length > 0) {
          return { ok: false, reason: "You have in-progress campaigns. Complete them first." };
        }
        set({ status: "paused" });
        return { ok: true };
      },
      resume: () => set({ status: "active" }),
      updateProfile: (p) => set({ profile: { ...get().profile, ...p } }),
    }),
    { name: "veasyble-executor" },
  ),
);

export { stepOrder };
