import type {
  SalesTrendPoint,
  BusyHourPoint,
  OrderStatus,
  Dish,
  KitchenItem,
} from "../src/components/user/types";

export const salesTrendData: SalesTrendPoint[] = [
  { day: "Mon", sales: 180 },
  { day: "Tue", sales: 220 },
  { day: "Wed", sales: 190 },
  { day: "Thu", sales: 340 },
  { day: "Fri", sales: 290 },
  { day: "Sat", sales: 310 },
  { day: "Sun", sales: 260 },
];

export const busyHoursData: BusyHourPoint[] = [
  { hour: "12", a: 150, b: 80 },
  { hour: "02", a: 80, b: 200 },
  { hour: "04", a: 200, b: 120 },
  { hour: "06", a: 170, b: 90 },
  { hour: "08", a: 220, b: 160 },
  { hour: "10", a: 130, b: 210 },
  { hour: "02", a: 180, b: 100 },
];

export const orderStatusData: OrderStatus[] = [
  { name: "Completed", value: 170, color: "#3B82F6" },
  { name: "In Progress", value: 65, color: "#F97316" },
  { name: "Cancelled", value: 4, color: "#EF4444" },
];

export const topDishes: Dish[] = [
  { name: "Margherita Pizza", orders: 87, revenue: "$1,600", img: "🍕" },
  { name: "Beef Tenderloin", orders: 83, revenue: "$1,830", img: "🥩" },
  { name: "Caesar Salad", orders: 64, revenue: "$1,800", img: "🥗" },
  { name: "Pasta Carbonara", orders: 60, revenue: "$940", img: "🍝" },
  { name: "Grilled Salmon", orders: 45, revenue: "$700", img: "🐟" },
  { name: "Beef Burger", orders: 28, revenue: "$452", img: "🍔" },
];

export const kitchenPerformance: KitchenItem[] = [
  { meal: "Breakfast", time: 12, color: "#8B5CF6", pct: 40 },
  { meal: "Lunch", time: 30, color: "#EF4444", pct: 100 },
  { meal: "Dinner", time: 10, color: "#06B6D4", pct: 33 },
];