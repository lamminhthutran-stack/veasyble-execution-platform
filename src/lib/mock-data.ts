export type CampaignStep =
  | "step1_registered"
  | "step2_printing"
  | "step3_execution"
  | "step4_completed"
  | "step5_review"
  | "approved"
  | "rejected";

export const STEP_LABELS: Record<CampaignStep, string> = {
  step1_registered: "Registered",
  step2_printing: "Printing & Production",
  step3_execution: "Execution in Progress",
  step4_completed: "Execution Completed",
  step5_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected — Resubmit",
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
  windowStart: string; // ISO date
  windowEnd: string;
  productionStart: string;
  executionStart: string;
  deadline: string;
  recommended: boolean;
};

export type ActivityEntry = {
  campaignId: string;
  step: CampaignStep;
  registeredAt: string;
  rejectionReason?: string;
  proofUploaded?: boolean;
};

export const CAMPAIGNS: Campaign[] = [
  {
    id: "c-001",
    brand: "Cocoon",
    brandColor: "oklch(0.72 0.14 45)",
    title: "Endcap Setup — Winter Serum Launch",
    retailer: "Net 269 Viking Thao Dien",
    location: "Vincom Center, District 1",
    city: "Ho Chi Minh City",
    brief: "Install branded endcap shelf display and place promotional pull-up. Ensure product facings match planogram.",
    compensation: 450000,
    currency: "VND",
    windowStart: "2026-07-10",
    windowEnd: "2026-07-18",
    productionStart: "2026-07-11",
    executionStart: "2026-07-14",
    deadline: "2026-07-18",
    recommended: true,
  },
  {
    id: "c-002",
    brand: "Vinamilk",
    brandColor: "oklch(0.62 0.16 250)",
    title: "Aisle Signage Refresh — Kids Range",
    retailer: "Net 269 Le Quang Dinh",
    location: "Nguyen Trai, District 5",
    city: "Ho Chi Minh City",
    brief: "Replace aisle signage across 4 bays. Photograph before-and-after for each bay.",
    compensation: 320000,
    currency: "VND",
    windowStart: "2026-07-12",
    windowEnd: "2026-07-20",
    productionStart: "2026-07-13",
    executionStart: "2026-07-16",
    deadline: "2026-07-20",
    recommended: true,
  },
  {
    id: "c-003",
    brand: "L'Oréal",
    brandColor: "oklch(0.55 0.2 15)",
    title: "Beauty Gondola Takeover",
    retailer: "Net 269 Le Quang Dinh",
    location: "Landmark 81",
    city: "Ho Chi Minh City",
    brief: "Full gondola takeover including header, side wings, and shelf strips. Coordinate with store manager.",
    compensation: 780000,
    currency: "VND",
    windowStart: "2026-07-15",
    windowEnd: "2026-07-25",
    productionStart: "2026-07-16",
    executionStart: "2026-07-19",
    deadline: "2026-07-25",
    recommended: false,
  },
  {
    id: "c-004",
    brand: "Heineken",
    brandColor: "oklch(0.68 0.17 145)",
    title: "Cold Chest Wrap & POSM Install",
    retailer: "Net 269 Viking Thao Dien",
    location: "Le Thanh Ton",
    city: "Ho Chi Minh City",
    brief: "Wrap two cold chests with brand vinyl. Install 3 shelf talkers and 1 dangler.",
    compensation: 280000,
    currency: "VND",
    windowStart: "2026-07-08",
    windowEnd: "2026-07-14",
    productionStart: "2026-07-09",
    executionStart: "2026-07-11",
    deadline: "2026-07-14",
    recommended: true,
  },
  {
    id: "c-005",
    brand: "Nestlé",
    brandColor: "oklch(0.55 0.18 30)",
    title: "Coffee Endcap — Nescafé Gold",
    retailer: "Co.opmart",
    location: "Cong Quynh, District 1",
    city: "Ho Chi Minh City",
    brief: "Endcap build with tiered risers, branded backdrop, and product stocking to planogram.",
    compensation: 520000,
    currency: "VND",
    windowStart: "2026-07-14",
    windowEnd: "2026-07-22",
    productionStart: "2026-07-15",
    executionStart: "2026-07-18",
    deadline: "2026-07-22",
    recommended: false,
  },
  {
    id: "c-006",
    brand: "Unilever",
    brandColor: "oklch(0.55 0.18 265)",
    title: "Laundry Aisle Wobblers",
    retailer: "Bach Hoa Xanh",
    location: "District 7",
    city: "Ho Chi Minh City",
    brief: "Install 12 wobblers across laundry detergent aisle. Verify against SKU list.",
    compensation: 210000,
    currency: "VND",
    windowStart: "2026-07-09",
    windowEnd: "2026-07-13",
    productionStart: "2026-07-10",
    executionStart: "2026-07-11",
    deadline: "2026-07-13",
    recommended: true,
  },
  {
    id: "c-007",
    brand: "Pepsi",
    brandColor: "oklch(0.55 0.2 265)",
    title: "Cooler Door Cling Refresh",
    retailer: "GS25",
    location: "Ben Thanh, District 1",
    city: "Ho Chi Minh City",
    brief: "Replace cooler door clings across 3 doors. Ensure edges are sealed.",
    compensation: 240000,
    currency: "VND",
    windowStart: "2026-07-11",
    windowEnd: "2026-07-17",
    productionStart: "2026-07-12",
    executionStart: "2026-07-14",
    deadline: "2026-07-17",
    recommended: true,
  },
  {
    id: "c-008",
    brand: "Samsung",
    brandColor: "oklch(0.42 0.16 260)",
    title: "Demo Table Setup — Galaxy Launch",
    retailer: "The Gioi Di Dong",
    location: "Nguyen Dinh Chieu",
    city: "Ho Chi Minh City",
    brief: "Assemble demo table, connect live units, install signage kit.",
    compensation: 620000,
    currency: "VND",
    windowStart: "2026-07-16",
    windowEnd: "2026-07-24",
    productionStart: "2026-07-17",
    executionStart: "2026-07-20",
    deadline: "2026-07-24",
    recommended: true,
  },
  {
    id: "c-009",
    brand: "TH true MILK",
    brandColor: "oklch(0.58 0.14 155)",
    title: "Dairy Aisle Shelf Strips",
    retailer: "Lotte Mart",
    location: "District 7",
    city: "Ho Chi Minh City",
    brief: "Install shelf strips across dairy aisle. 8 bays total.",
    compensation: 300000,
    currency: "VND",
    windowStart: "2026-07-13",
    windowEnd: "2026-07-19",
    productionStart: "2026-07-14",
    executionStart: "2026-07-16",
    deadline: "2026-07-19",
    recommended: false,
  },
  {
    id: "c-010",
    brand: "Apple",
    brandColor: "oklch(0.55 0.1 260)",
    title: "AirPods Max Display Update",
    retailer: "FPT Shop",
    location: "Le Loi, District 1",
    city: "Ho Chi Minh City",
    brief: "Swap out dummy units and update product spec cards.",
    compensation: 400000,
    currency: "VND",
    windowStart: "2026-07-10",
    windowEnd: "2026-07-16",
    productionStart: "2026-07-11",
    executionStart: "2026-07-13",
    deadline: "2026-07-16",
    recommended: false,
  },
  {
    id: "c-011",
    brand: "Sony",
    brandColor: "oklch(0.45 0.2 260)",
    title: "PlayStation 5 Endcap",
    retailer: "CellphoneS",
    location: "Tran Hung Dao",
    city: "Ho Chi Minh City",
    brief: "Restock PS5 endcap and test interactive screen.",
    compensation: 550000,
    currency: "VND",
    windowStart: "2026-07-09",
    windowEnd: "2026-07-15",
    productionStart: "2026-07-10",
    executionStart: "2026-07-12",
    deadline: "2026-07-15",
    recommended: true,
  },
];

export const INITIAL_ACTIVITY: ActivityEntry[] = [
  { campaignId: "c-004", step: "step3_execution", registeredAt: "2026-07-05" },
  { campaignId: "c-006", step: "step2_printing", registeredAt: "2026-07-06" },
  { campaignId: "c-001", step: "step1_registered", registeredAt: "2026-07-07" },
  { campaignId: "c-008", step: "step3_execution", registeredAt: "2026-06-25" },
  { campaignId: "c-010", step: "step4_completed", registeredAt: "2026-07-09" },
  { campaignId: "c-011", step: "step5_review", registeredAt: "2026-07-08", proofUploaded: true },
];

export const INITIAL_HISTORY: ActivityEntry[] = [
  { campaignId: "c-002", step: "approved", registeredAt: "2026-06-14", proofUploaded: true },
  { campaignId: "c-005", step: "approved", registeredAt: "2026-06-20", proofUploaded: true },
  { campaignId: "c-003", step: "approved", registeredAt: "2026-06-28", proofUploaded: true },
  { campaignId: "c-007", step: "approved", registeredAt: "2026-07-11", proofUploaded: true },
  { campaignId: "c-009", step: "approved", registeredAt: "2026-07-13", proofUploaded: true },
];

export function formatVND(v: number) {
  return new Intl.NumberFormat("vi-VN").format(v) + "₫";
}
