import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ACTIVE_STEPS,
  CAMPAIGNS,
  INITIAL_ACTIVITY,
  INITIAL_HISTORY,
  INITIAL_NOTIFICATIONS,
  TODAY_ISO,
  type ActivityEntry,
  type CampaignStep,
  type Notification,
  type Proof,
} from "./mock-data";

type AccountStatus = "approved" | "active" | "paused" | "deactivated" | "deleted";

type Profile = {
  fullName: string;
  phone: string;
  email: string;
  personalEmail: string;
  idNumber: string;
  bank: string;
  city: string;
  wardDistrict: string;
  address: string;
  language: string;
  avatar?: string;
};

type State = {
  isAuthed: boolean;
  status: AccountStatus;
  profile: Profile;
  activity: ActivityEntry[];
  history: ActivityEntry[];
  notifications: Notification[];
  login: (email?: string, password?: string) => { ok: boolean; message?: string };
  logout: () => void;
  register: (campaignId: string) => { ok: boolean; message: string };
  completePrinting: (campaignId: string) => void;
  startSetup: (campaignId: string) => void;
  saveProofDraft: (campaignId: string, proof: Proof) => void;
  submitProof: (campaignId: string) => void;
  approve: (campaignId: string) => void;
  reject: (campaignId: string, reason: string) => void;
  pause: () => { ok: boolean; reason?: string };
  resume: () => void;
  deleteAccount: () => { ok: boolean; reason?: string };
  markNotificationRead: (id: string) => void;
  updateProfile: (p: Partial<Profile>) => void;
};

function nowIso() {
  return `${TODAY_ISO}T10:00:00`;
}

function startingStepFor(campaignId: string): CampaignStep {
  const c = CAMPAIGNS.find((x) => x.id === campaignId);
  if (!c) return "registered";
  const today = new Date(TODAY_ISO);
  if (new Date(c.executionStart) <= today) return "execution";
  if (new Date(c.productionStart) <= today) return "printing";
  return "registered";
}

function hasOpenWork(entries: ActivityEntry[]) {
  return entries.some((entry) => ACTIVE_STEPS.includes(entry.step));
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      isAuthed: false,
      status: "approved",
      profile: {
        fullName: "Linh Nguyen",
        phone: "+84 90 123 4567",
        email: "linh.nguyen@veasyble.com",
        personalEmail: "linh.nguyen@gmail.com",
        idNumber: "079xxxxxxxx",
        bank: "VCB • •••• 4821",
        city: "Ho Chi Minh City",
        wardDistrict: "Ben Nghe, District 1",
        address: "42 Nguyen Hue, Ben Nghe, District 1, HCMC",
        language: "English",
        avatar: "/profile_avatar_demo.png",
      },
      activity: INITIAL_ACTIVITY,
      history: INITIAL_HISTORY,
      notifications: INITIAL_NOTIFICATIONS,
      login: (email, password) => {
        if (email && password && (email.trim() === "" || password.trim() === "")) {
          return { ok: false, message: "Email or password is incorrect." };
        }
        const status = get().status === "approved" ? "active" : get().status;
        set({ isAuthed: true, status });
        return { ok: true };
      },
      logout: () => set({ isAuthed: false }),
      register: (campaignId) => {
        const { activity, history, status } = get();
        if (status === "paused") return { ok: false, message: "Registration is disabled while your account is paused." };
        if (status === "deactivated") return { ok: false, message: "Registration is unavailable for deactivated accounts." };
        if ([...activity, ...history].some((a) => a.campaignId === campaignId)) {
          return { ok: false, message: "You are already registered for this campaign." };
        }
        const campaign = CAMPAIGNS.find((c) => c.id === campaignId);
        set({
          activity: [
            ...activity,
            {
              campaignId,
              step: startingStepFor(campaignId),
              registeredAt: nowIso(),
            },
          ],
          notifications: [
            {
              id: `n-${Date.now()}`,
              type: "info",
              title: "Registration confirmed",
              sender: "Veasyble Executor Platform",
              sentAt: nowIso(),
              unread: true,
              campaignId,
              message: `You are registered for ${campaign?.title ?? "this campaign"}. It now appears in Activity.`,
            },
            ...get().notifications,
          ],
        });
        return { ok: true, message: "Registration succeeded. Campaign added to Activity." };
      },
      completePrinting: (campaignId) =>
        set({
          activity: get().activity.map((entry) =>
            entry.campaignId === campaignId
              ? { ...entry, printingCompletedAt: nowIso(), step: entry.step === "printing" ? "execution" : entry.step }
              : entry,
          ),
        }),
      startSetup: (campaignId) =>
        set({
          activity: get().activity.map((entry) =>
            entry.campaignId === campaignId ? { ...entry, setupStartedAt: nowIso() } : entry,
          ),
        }),
      saveProofDraft: (campaignId, proof) =>
        set({
          activity: get().activity.map((entry) => {
            if (entry.campaignId !== campaignId) return entry;
            const proofs = entry.proofs ?? [];
            return {
              ...entry,
              proofs: [...proofs.filter((p) => p.mediaSpaceId !== proof.mediaSpaceId), proof],
            };
          }),
        }),
      submitProof: (campaignId) =>
        set({
          activity: get().activity.map((entry) =>
            entry.campaignId === campaignId
              ? { ...entry, step: "review", proofSubmittedAt: nowIso(), rejectionReason: undefined }
              : entry,
          ),
        }),
      approve: (campaignId) => {
        const entry = get().activity.find((a) => a.campaignId === campaignId);
        if (!entry) return;
        set({
          activity: get().activity.filter((a) => a.campaignId !== campaignId),
          history: [{ ...entry, step: "approved", approvedAt: nowIso() }, ...get().history],
        });
      },
      reject: (campaignId, reason) =>
        set({
          activity: get().activity.map((entry) =>
            entry.campaignId === campaignId ? { ...entry, step: "execution", rejectionReason: reason } : entry,
          ),
          notifications: [
            {
              id: `n-${Date.now()}`,
              type: "rejected",
              title: "Proof rejected",
              sender: "Veasyble Campaign Management",
              sentAt: nowIso(),
              unread: true,
              campaignId,
              message: reason,
            },
            ...get().notifications,
          ],
        }),
      pause: () => {
        if (hasOpenWork(get().activity)) {
          return { ok: false, reason: "You have in-progress campaigns. Complete them first." };
        }
        set({ status: "paused" });
        return { ok: true };
      },
      resume: () => set({ status: "active" }),
      deleteAccount: () => {
        if (hasOpenWork(get().activity)) return { ok: false, reason: "Resolve in-progress campaigns before deleting." };
        set({ status: "deleted", isAuthed: false });
        return { ok: true };
      },
      markNotificationRead: (id) =>
        set({
          notifications: get().notifications.map((notification) =>
            notification.id === id ? { ...notification, unread: false } : notification,
          ),
        }),
      updateProfile: (p) => set({ profile: { ...get().profile, ...p } }),
    }),
    { name: "veasyble-executor-v2" },
  ),
);

export { ACTIVE_STEPS as stepOrder };
