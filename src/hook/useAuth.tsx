// src/hooks/useAuth.ts
import { useMemo } from "react";
import Cookies from "js-cookie";
import type { UserRole, AuthPayload } from "../config/navTypes";

// re-export so other files can import from here if they want
export type { UserRole, AuthPayload };

function decodeJWT(token: string): AuthPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as AuthPayload;
  } catch {
    return null;
  }
}

export function useAuth(): AuthPayload & { isAuthenticated: boolean } {
  return useMemo(() => {
    const token = Cookies.get("token");
    if (!token) return { role: "staff" as UserRole, isAuthenticated: false };

    const payload = decodeJWT(token);
    if (!payload) return { role: "staff" as UserRole, isAuthenticated: false };

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      Cookies.remove("token");
      return { role: "staff" as UserRole, isAuthenticated: false };
    }

    return { ...payload, isAuthenticated: true };
  }, []);
}