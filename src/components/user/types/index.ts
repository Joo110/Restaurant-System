// src/components/user/types.ts
export type PageId =
  | "dashboard"
  | "menu"
  | "orders"
  | "inventory"
  | "staff"
  | "tables"
  | "analytics";

/** Sales trend entries used in data/dashboardData.ts */
export interface SalesTrendPoint {
  day: string;   // "Mon" | "Tue" | ...
  sales: number; // 180, 220, ...
  /** optional legacy fields in case other parts expect them */
  date?: string;
  total?: number;
}

/** Busy hours entries — dashboard uses a and b; keep orders optional for compatibility */
export interface BusyHourPoint {
  hour: string; // "12", "02", ...
  a?: number;
  b?: number;
  orders?: number;
}

/** Order status objects (not a string union) — matches orderStatusData */
export interface OrderStatus {
  name: string;   // e.g. "Completed"
  value: number;  // e.g. 170
  color: string;  // hex color
}

/** Top dish shape used by dashboardData */
export interface Dish {
  name: string;
  orders: number;
  revenue?: string;
  img?: string;
  /** optional fields kept for other parts of app */
  id?: string;
  price?: number;
  category?: string;
  description?: string;
}

/** Kitchen performance item used in dashboardData */
export interface KitchenItem {
  meal: string;   // "Breakfast", "Lunch", ...
  time: number;
  color: string;
  pct: number;
  /** optional compatibility fields */
  id?: string;
  name?: string;
  quantity?: number;
  status?: "Available" | "Low" | "Out" | string;
}