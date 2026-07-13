// Client-safe constants pentru retururi — nu importa nimic din DB aici.
// Aliniate cu schema reală din migrația 0006_returns.sql.

export type ReturnStatus =
  | "pending"
  | "approved"
  | "in_transit"
  | "completed"
  | "rejected";

export type ProductState = "sigilat" | "deteriorat" | "neconform";

export type Resolution = "rambursare" | "inlocuire" | "voucher";

export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  pending: "În analiză",
  approved: "Aprobat",
  in_transit: "În transport",
  completed: "Finalizat",
  rejected: "Respins",
};

export const RETURN_STATUS_TONE: Record<ReturnStatus, string> = {
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-amber-50 text-amber-800 border-amber-200",
  in_transit: "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  rejected: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export const PRODUCT_STATE_LABEL: Record<ProductState, string> = {
  sigilat: "Sticlă sigilată",
  deteriorat: "Deteriorat la livrare",
  neconform: "Neconform descrierii",
};

export const RESOLUTION_LABEL: Record<Resolution, string> = {
  rambursare: "Rambursare",
  inlocuire: "Înlocuire",
  voucher: "Voucher",
};

export const RESOLUTION_TONE: Record<Resolution, string> = {
  rambursare: "bg-emerald-50 text-emerald-800 border-emerald-200",
  inlocuire: "bg-blue-50 text-blue-700 border-blue-200",
  voucher: "bg-purple-50 text-purple-700 border-purple-200",
};
