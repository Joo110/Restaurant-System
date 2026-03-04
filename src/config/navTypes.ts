// src/config/navTypes.ts
// ✅ ملف types فقط — مفيش أي imports من lucide أو أي مكان تاني
// Vite بيتعامل معاه صح لأنه pure types

import type { ElementType } from "react";

export type UserRole = "admin" | "manager" | "cashier" | "chef" | "staff";

export type SubItem = {
  path: string;
  label: string;
  icon: ElementType;
  roles?: UserRole[];
};

export type NavItem = {
  path: string;
  label: string;
  icon: ElementType;
  roles?: UserRole[];
  children?: SubItem[];
};

export type AuthPayload = {
  role: UserRole;
  name?: string;
  branch?: string;
  sub?: string;
  exp?: number;
};

export type RoleMeta = {
  label: string;
  color: string;
  bg: string;
};