export const TODAY_ISO = "2026-07-17";

export type CampaignStep = "registered" | "printing" | "execution" | "review" | "approved";

export const STEP_LABELS: Record<CampaignStep, string> = {
  registered: "Registered",
  printing: "Printing & Production",
  execution: "Execution in Progress",
  review: "Under Review",
  approved: "Completed",
};

export const ACTIVE_STEPS: CampaignStep[] = ["registered", "printing", "execution", "review"];

export type MediaSpace = {
  id: string;
  zone: string;
  type: string;
  name: string;
  dimension: string;
  notes: string;
  showcase: string[];
};

export type AssetFile = {
  id: string;
  name: string;
  type: "PDF Document" | "Image" | "Video" | "ZIP Archive";
  size: string;
};

export type AssetSection = {
  title: "Campaign Creatives" | "Campaign Explainer" | "Additional Assets";
  files: AssetFile[];
};

export type Campaign = {
  id: string;
  brand: string;
  brandColor: string;
  title: string;
  retailer: string;
  location: string;
  city: string;
  brief: string;
  compensation: number;
  currency: string;
  registrationOpen: string;
  registrationDeadline: string;
  productionStart: string;
  productionEnd: string;
  executionStart: string;
  executionEnd: string;
  reviewDeadline: string;
  recommended: boolean;
  heroImage: string;
  distanceKm: number;
  mediaSpaces: MediaSpace[];
  assets: AssetSection[];
};

export type Proof = {
  mediaSpaceId: string;
  notes: string;
  uploadedAt: string;
  image: string;
};

export type ActivityEntry = {
  campaignId: string;
  step: CampaignStep;
  registeredAt: string;
  printingCompletedAt?: string;
  setupStartedAt?: string;
  proofSubmittedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  rejectionReason?: string;
  proofs?: Proof[];
};

export type Notification = {
  id: string;
  type: "approved" | "rejected" | "info";
  title: string;
  message: string;
  sender: string;
  sentAt: string;
  unread: boolean;
  campaignId?: string;
};

const shelfImage = "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=80";
const storeImage = "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80";
const signageImage = "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=900&q=80";

const defaultMediaSpaces: MediaSpace[] = [
  {
    id: "front-endcap",
    zone: "Front of Store",
    type: "Endcap Display",
    name: "Main aisle endcap",
    dimension: "120cm W x 180cm H",
    notes: "Keep the hero SKU at eye level and align shelf strips edge to edge.",
    showcase: [shelfImage],
  },
  {
    id: "checkout-wobbler",
    zone: "Checkout",
    type: "POSM",
    name: "Counter wobblers",
    dimension: "A5, 4 units",
    notes: "Place two units on each side of the cashier counter without blocking pricing.",
    showcase: [signageImage],
  },
  {
    id: "cooler-door",
    zone: "Cold Zone",
    type: "Vinyl",
    name: "Cooler door cling",
    dimension: "60cm W x 120cm H",
    notes: "Clean glass before installation and photograph the full door after setup.",
    showcase: [storeImage],
  },
];

const defaultAssets: AssetSection[] = [
  {
    title: "Campaign Creatives",
    files: [
      { id: "banner", name: "banner_horizontal_print_ready.pdf", type: "PDF Document", size: "12.4 MB" },
      { id: "wobbler", name: "checkout_wobbler_artwork.pdf", type: "PDF Document", size: "8.1 MB" },
    ],
  },
  {
    title: "Campaign Explainer",
    files: [
      { id: "guide", name: "retailer_setup_guideline.pdf", type: "PDF Document", size: "4.6 MB" },
      { id: "video", name: "setup_walkthrough.mp4", type: "Video", size: "38 MB" },
    ],
  },
  {
    title: "Additional Assets",
    files: [
      { id: "planogram", name: "planogram_reference.jpg", type: "Image", size: "2.2 MB" },
      { id: "sku", name: "sku_checklist.zip", type: "ZIP Archive", size: "5.7 MB" },
    ],
  },
];

function campaign(input: Omit<Campaign, "currency" | "mediaSpaces" | "assets">): Campaign {
  return { ...input, currency: "VND", mediaSpaces: defaultMediaSpaces, assets: defaultAssets };
}

export const CAMPAIGNS: Campaign[] = [
  campaign({
    id: "c-001",
    brand: "Cocoon",
    brandColor: "#d66b2f",
    title: "Endcap Setup - Winter Serum Launch",
    retailer: "Net 269 Viking Thao Dien",
    location: "Vincom Center, District 1",
    city: "Ho Chi Minh City",
    brief: "Install a branded endcap shelf display, place promotional pull-ups, and verify product facings against the planogram before proof submission.",
    compensation: 450000,
    registrationOpen: "2026-07-01",
    registrationDeadline: "2026-07-19",
    productionStart: "2026-07-16",
    productionEnd: "2026-07-18",
    executionStart: "2026-07-19",
    executionEnd: "2026-07-22",
    reviewDeadline: "2026-07-25",
    recommended: true,
    heroImage: shelfImage,
    distanceKm: 4.2,
  }),
  campaign({
    id: "c-002",
    brand: "Vinamilk",
    brandColor: "#2563eb",
    title: "Aisle Signage Refresh - Kids Range",
    retailer: "Net 269 Le Quang Dinh",
    location: "Nguyen Trai, District 5",
    city: "Ho Chi Minh City",
    brief: "Replace aisle signage across four bays, photograph before-and-after views, and flag missing placements in the proof notes.",
    compensation: 320000,
    registrationOpen: "2026-07-04",
    registrationDeadline: "2026-07-21",
    productionStart: "2026-07-18",
    productionEnd: "2026-07-20",
    executionStart: "2026-07-22",
    executionEnd: "2026-07-24",
    reviewDeadline: "2026-07-27",
    recommended: true,
    heroImage: signageImage,
    distanceKm: 6.5,
  }),
  campaign({
    id: "c-003",
    brand: "L'Oreal",
    brandColor: "#be123c",
    title: "Beauty Gondola Takeover",
    retailer: "Guardian",
    location: "Landmark 81",
    city: "Ho Chi Minh City",
    brief: "Complete a full gondola takeover including header, side wings, shelf strips, and a store-manager signoff photo.",
    compensation: 780000,
    registrationOpen: "2026-07-12",
    registrationDeadline: "2026-07-24",
    productionStart: "2026-07-25",
    productionEnd: "2026-07-27",
    executionStart: "2026-07-28",
    executionEnd: "2026-07-31",
    reviewDeadline: "2026-08-03",
    recommended: false,
    heroImage: storeImage,
    distanceKm: 12.4,
  }),
  campaign({
    id: "c-004",
    brand: "Heineken",
    brandColor: "#16a34a",
    title: "Cold Chest Wrap & POSM Install",
    retailer: "Net 269 Viking Thao Dien",
    location: "Le Thanh Ton",
    city: "Ho Chi Minh City",
    brief: "Wrap two cold chests with brand vinyl, install three shelf talkers, and reshoot any proof that does not show the complete cooler door.",
    compensation: 280000,
    registrationOpen: "2026-07-01",
    registrationDeadline: "2026-07-12",
    productionStart: "2026-07-09",
    productionEnd: "2026-07-13",
    executionStart: "2026-07-14",
    executionEnd: "2026-07-19",
    reviewDeadline: "2026-07-22",
    recommended: true,
    heroImage: storeImage,
    distanceKm: 3.3,
  }),
  campaign({
    id: "c-005",
    brand: "Nestle",
    brandColor: "#92400e",
    title: "Coffee Endcap - Nescafe Gold",
    retailer: "Co.opmart",
    location: "Cong Quynh, District 1",
    city: "Ho Chi Minh City",
    brief: "Build an endcap with tiered risers, branded backdrop, and fully stocked product rows matching the SKU list.",
    compensation: 520000,
    registrationOpen: "2026-07-08",
    registrationDeadline: "2026-07-23",
    productionStart: "2026-07-21",
    productionEnd: "2026-07-23",
    executionStart: "2026-07-24",
    executionEnd: "2026-07-27",
    reviewDeadline: "2026-07-30",
    recommended: false,
    heroImage: shelfImage,
    distanceKm: 8.8,
  }),
  campaign({
    id: "c-006",
    brand: "Unilever",
    brandColor: "#1d4ed8",
    title: "Laundry Aisle Wobblers",
    retailer: "Bach Hoa Xanh",
    location: "District 7",
    city: "Ho Chi Minh City",
    brief: "Install twelve wobblers across the laundry detergent aisle and verify that each placement is clear of price tags.",
    compensation: 210000,
    registrationOpen: "2026-07-03",
    registrationDeadline: "2026-07-13",
    productionStart: "2026-07-14",
    productionEnd: "2026-07-17",
    executionStart: "2026-07-18",
    executionEnd: "2026-07-20",
    reviewDeadline: "2026-07-23",
    recommended: true,
    heroImage: signageImage,
    distanceKm: 7.1,
  }),
  campaign({
    id: "c-007",
    brand: "Pepsi",
    brandColor: "#1e40af",
    title: "Cooler Door Cling Refresh",
    retailer: "GS25",
    location: "Ben Thanh, District 1",
    city: "Ho Chi Minh City",
    brief: "Replace cooler door clings across three doors, smooth all edges, and submit one full-door proof per cooler.",
    compensation: 240000,
    registrationOpen: "2026-06-28",
    registrationDeadline: "2026-07-10",
    productionStart: "2026-07-11",
    productionEnd: "2026-07-13",
    executionStart: "2026-07-14",
    executionEnd: "2026-07-16",
    reviewDeadline: "2026-07-18",
    recommended: true,
    heroImage: storeImage,
    distanceKm: 2.1,
  }),
  campaign({
    id: "c-008",
    brand: "Samsung",
    brandColor: "#0f172a",
    title: "Demo Table Setup - Galaxy Launch",
    retailer: "The Gioi Di Dong",
    location: "Nguyen Dinh Chieu",
    city: "Ho Chi Minh City",
    brief: "Assemble the demo table, connect live units, install signage, and submit powered-on proof photos for each device zone.",
    compensation: 620000,
    registrationOpen: "2026-07-05",
    registrationDeadline: "2026-07-18",
    productionStart: "2026-07-17",
    productionEnd: "2026-07-20",
    executionStart: "2026-07-21",
    executionEnd: "2026-07-24",
    reviewDeadline: "2026-07-27",
    recommended: true,
    heroImage: storeImage,
    distanceKm: 5.8,
  }),
  campaign({
    id: "c-009",
    brand: "TH true MILK",
    brandColor: "#0f766e",
    title: "Dairy Aisle Shelf Strips",
    retailer: "Lotte Mart",
    location: "District 7",
    city: "Ho Chi Minh City",
    brief: "Install shelf strips across the dairy aisle and capture one wide proof photo for every two bays.",
    compensation: 300000,
    registrationOpen: "2026-06-25",
    registrationDeadline: "2026-07-07",
    productionStart: "2026-07-08",
    productionEnd: "2026-07-10",
    executionStart: "2026-07-11",
    executionEnd: "2026-07-13",
    reviewDeadline: "2026-07-16",
    recommended: false,
    heroImage: shelfImage,
    distanceKm: 11.6,
  }),
  campaign({
    id: "c-010",
    brand: "Apple",
    brandColor: "#475569",
    title: "AirPods Max Display Update",
    retailer: "FPT Shop",
    location: "Le Loi, District 1",
    city: "Ho Chi Minh City",
    brief: "Swap dummy units, update product spec cards, clean the table surface, and submit close-up proof photos.",
    compensation: 400000,
    registrationOpen: "2026-06-20",
    registrationDeadline: "2026-07-02",
    productionStart: "2026-07-03",
    productionEnd: "2026-07-05",
    executionStart: "2026-07-06",
    executionEnd: "2026-07-08",
    reviewDeadline: "2026-07-11",
    recommended: false,
    heroImage: storeImage,
    distanceKm: 2.6,
  }),
  campaign({
    id: "c-011",
    brand: "Sony",
    brandColor: "#4338ca",
    title: "PlayStation 5 Endcap",
    retailer: "CellphoneS",
    location: "Tran Hung Dao",
    city: "Ho Chi Minh City",
    brief: "Restock the PS5 endcap, test the interactive screen, and submit proof showing both product rows and screen power.",
    compensation: 550000,
    registrationOpen: "2026-06-21",
    registrationDeadline: "2026-07-01",
    productionStart: "2026-07-02",
    productionEnd: "2026-07-05",
    executionStart: "2026-07-06",
    executionEnd: "2026-07-09",
    reviewDeadline: "2026-07-14",
    recommended: true,
    heroImage: signageImage,
    distanceKm: 4.9,
  }),
];

export const INITIAL_ACTIVITY: ActivityEntry[] = [
  { campaignId: "c-004", step: "execution", registeredAt: "2026-07-05T07:30:00", printingCompletedAt: "2026-07-13T18:20:00", setupStartedAt: "2026-07-14T09:05:00", rejectionReason: "Cooler door proof is cropped. Please reshoot the full door and visible brand cling." },
  { campaignId: "c-006", step: "printing", registeredAt: "2026-07-06T08:15:00" },
  { campaignId: "c-001", step: "printing", registeredAt: "2026-07-07T10:10:00" },
  { campaignId: "c-008", step: "registered", registeredAt: "2026-07-12T15:00:00" },
  { campaignId: "c-011", step: "review", registeredAt: "2026-07-08T07:00:00", printingCompletedAt: "2026-07-05T17:40:00", setupStartedAt: "2026-07-06T08:30:00", proofSubmittedAt: "2026-07-09T18:15:00", proofs: [{ mediaSpaceId: "front-endcap", notes: "Display installed and screen powered on.", uploadedAt: "2026-07-09T18:15:00", image: shelfImage }] },
];

export const INITIAL_HISTORY: ActivityEntry[] = [
  { campaignId: "c-002", step: "approved", registeredAt: "2026-06-14T07:00:00", printingCompletedAt: "2026-06-18T12:00:00", setupStartedAt: "2026-06-19T09:00:00", proofSubmittedAt: "2026-06-19T12:20:00", approvedAt: "2026-06-20T16:00:00", paidAt: "2026-06-30T18:00:00", proofs: [{ mediaSpaceId: "front-endcap", notes: "All aisle signs refreshed.", uploadedAt: "2026-06-19T12:20:00", image: signageImage }] },
  { campaignId: "c-005", step: "approved", registeredAt: "2026-06-20T09:30:00", printingCompletedAt: "2026-06-23T17:00:00", setupStartedAt: "2026-06-24T08:45:00", proofSubmittedAt: "2026-06-24T11:30:00", approvedAt: "2026-06-25T14:10:00", paidAt: "2026-06-30T18:00:00", proofs: [{ mediaSpaceId: "front-endcap", notes: "Endcap stocked to planogram.", uploadedAt: "2026-06-24T11:30:00", image: shelfImage }] },
  { campaignId: "c-007", step: "approved", registeredAt: "2026-07-01T08:00:00", printingCompletedAt: "2026-07-13T10:30:00", setupStartedAt: "2026-07-14T09:00:00", proofSubmittedAt: "2026-07-16T18:00:00", approvedAt: "2026-07-17T09:20:00", paidAt: undefined, proofs: [{ mediaSpaceId: "cooler-door", notes: "All cooler clings replaced.", uploadedAt: "2026-07-16T18:00:00", image: storeImage }] },
  { campaignId: "c-009", step: "approved", registeredAt: "2026-07-03T12:00:00", printingCompletedAt: "2026-07-10T17:10:00", setupStartedAt: "2026-07-11T08:10:00", proofSubmittedAt: "2026-07-13T16:00:00", approvedAt: "2026-07-15T11:30:00", paidAt: undefined, proofs: [{ mediaSpaceId: "front-endcap", notes: "Shelf strips complete.", uploadedAt: "2026-07-13T16:00:00", image: shelfImage }] },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n-1", type: "rejected", title: "Proof rejected", sender: "Veasyble Campaign Management", sentAt: "2026-07-17T09:45:00", unread: true, campaignId: "c-004", message: "The cooler door proof for Heineken was cropped. Please reshoot the full door and visible brand cling before the review deadline." },
  { id: "n-2", type: "approved", title: "Proof approved", sender: "Veasyble Campaign Management", sentAt: "2026-07-17T09:20:00", unread: true, campaignId: "c-007", message: "Your Pepsi cooler door proof has been approved. This campaign has moved to Activity History and payout accrual has started." },
  { id: "n-3", type: "info", title: "Registration confirmed", sender: "Veasyble Executor Platform", sentAt: "2026-07-12T15:01:00", unread: false, campaignId: "c-008", message: "You are registered for Samsung Demo Table Setup. Check Activity for the current step and upcoming stage dates." },
  { id: "n-4", type: "info", title: "Deadline reminder", sender: "Veasyble Support", sentAt: "2026-07-16T08:00:00", unread: false, campaignId: "c-006", message: "Printing & Production for Unilever Laundry Aisle Wobblers is due on 17/07. Mark it complete once ready." },
];

export function formatVND(v: number) {
  return new Intl.NumberFormat("vi-VN").format(v) + "đ";
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit" }).format(date);
}

export function formatDateTime(dateStr?: string) {
  if (!dateStr) return "Not yet";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function daysLeft(deadline: string) {
  const today = new Date(TODAY_ISO);
  const end = new Date(deadline);
  const ms = end.getTime() - today.getTime();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export function stageDeadline(c: Campaign, step: CampaignStep) {
  if (step === "registered") return c.registrationDeadline;
  if (step === "printing") return c.productionEnd;
  if (step === "execution") return c.executionEnd;
  if (step === "review") return c.reviewDeadline;
  return c.reviewDeadline;
}

export function stepPeriod(c: Campaign, step: CampaignStep) {
  if (step === "registered") return `Registration deadline: ${formatDate(c.registrationDeadline)}`;
  if (step === "printing") return `Period: ${formatDate(c.productionStart)} - ${formatDate(c.productionEnd)}`;
  if (step === "execution") return `Period: ${formatDate(c.executionStart)} - ${formatDate(c.executionEnd)}`;
  if (step === "review") return `Review deadline: ${formatDate(c.reviewDeadline)}`;
  return "Completed";
}
