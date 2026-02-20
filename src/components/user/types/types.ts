// src/components/user/types.ts
export type SalesTrendPoint = {
  // يتوافق مع data/dashboardData.ts (day: Mon/Tue..., sales: number)
  day: string;
  sales: number;
};

export type BusyHourPoint = {
  hour: string;
  a: number;
  b: number;
};

export type OrderStatus = {
  name: string;
  value: number;
  color: string;
};

export type Dish = {
  name: string;
  orders: number;
  revenue: string;
  img?: string;
};

export type KitchenItem = {
  meal: string;
  time: number;
  color: string;
  pct: number;
};