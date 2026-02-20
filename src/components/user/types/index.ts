export type PageId =
  | "dashboard"
  | "menu"
  | "orders"
  | "inventory"
  | "staff"
  | "tables"
  | "analytics";

export interface Dish {
  name: string;
  orders: number;
  revenue: string;
  img: string;
}

export interface KitchenItem {
  meal: string;
  time: number;
  color: string;
  pct: number;
}



export interface SalesTrendPoint {
  day: string;
  sales: number;
}

export interface BusyHourPoint {
  hour: string;
  a: number;
  b: number;
}

export interface SalesTrendPoint {
  date: string;
  total: number;
}

export interface BusyHourPoint {
  hour: string;
  orders: number;
}

export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Ready"
  | "Completed"
  | "Cancelled";

export interface Dish {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export interface KitchenItem {
  id: string;
  name: string;
  quantity: number;
  status: "Available" | "Low" | "Out";
}