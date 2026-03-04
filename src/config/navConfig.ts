// src/config/navConfig.ts
import {
  LayoutDashboard, UtensilsCrossed, ClipboardList, Package, Users,
  Table2, BarChart3, Truck, CalendarCheck, DollarSign,
  GitBranch, Settings, ShieldCheck, FileText, TrendingUp,
} from "lucide-react";
import type { NavItem, UserRole, RoleMeta } from "./navTypes";

// ✅ re-export types بـ "export type" — Vite مش هيشتكي
export type { NavItem, UserRole, RoleMeta };

// ─── Master nav list ──────────────────────────────────────────────────────────
const navItems: NavItem[] = [
  // ── Everyone ────────────────────────────────────────────────────────────────
  { path: "/dashboard",        label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/menu",   label: "Menu",      icon: UtensilsCrossed },
  { path: "/dashboard/orders", label: "Orders",    icon: ClipboardList   },
  { path: "/dashboard/tables", label: "Tables",    icon: Table2          },

  // ── manager + admin ─────────────────────────────────────────────────────────
  {
    path: "/dashboard/branches",
    label: "Branches",
    icon: GitBranch,
    roles: ["manager", "admin"],
  },
  {
    path: "/dashboard/inventory",
    label: "Inventory",
    icon: Package,
    roles: ["manager", "admin"],
    children: [
      { path: "/dashboard/inventory", label: "Stock",     icon: Package, roles: ["manager", "admin"] },
      { path: "/dashboard/suppliers", label: "Suppliers", icon: Truck,   roles: ["manager", "admin"] },
    ],
  },
  {
    path: "/dashboard/staff",
    label: "Staff",
    icon: Users,
    roles: ["manager", "admin"],
    children: [
      { path: "/dashboard/staff",      label: "Employees",  icon: Users,         roles: ["manager", "admin"] },
      { path: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck, roles: ["manager", "admin"] },
      { path: "/dashboard/payroll",    label: "Payroll",    icon: DollarSign,    roles: ["manager", "admin"] },
    ],
  },
  {
    path: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
    roles: ["manager", "admin"],
  },
  {
    path: "/dashboard/reports",
    label: "Reports",
    icon: TrendingUp,
    roles: ["manager", "admin"],
  },

  // ── admin only ──────────────────────────────────────────────────────────────
  {
    path: "/dashboard/audit",
    label: "Audit Log",
    icon: FileText,
    roles: ["admin"],
  },
  {
    path: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    roles: ["admin"],
  },
  {
    path: "/dashboard/permissions",
    label: "Permissions",
    icon: ShieldCheck,
    roles: ["admin"],
  },
];

// ─── Filter by role ───────────────────────────────────────────────────────────
export function filterNavForRole(role: UserRole): NavItem[] {
  return navItems
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter(
        (child) => !child.roles || child.roles.includes(role)
      ),
    }));
}

// ─── Role badge metadata ──────────────────────────────────────────────────────
export const ROLE_META: Record<UserRole, RoleMeta> = {
  admin:   { label: "Admin",   color: "text-purple-700", bg: "bg-purple-100" },
  manager: { label: "Manager", color: "text-blue-700",   bg: "bg-blue-100"   },
  cashier: { label: "Cashier", color: "text-green-700",  bg: "bg-green-100"  },
  chef:    { label: "Chef",    color: "text-orange-700", bg: "bg-orange-100" },
  staff:   { label: "Staff",   color: "text-gray-600",   bg: "bg-gray-100"   },
};