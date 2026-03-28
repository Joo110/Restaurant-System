// src/config/navTypes.ts
export type UserRole = "admin" | "manager" | "staff";

export interface AuthPayload {
  role: UserRole;
  exp?: number;
  [key: string]: unknown;
}