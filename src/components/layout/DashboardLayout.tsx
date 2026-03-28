import React, { useState, useMemo, useCallback } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, UtensilsCrossed, ClipboardList, Package, Users,
  Table2, BarChart3, ChevronLeft, ChevronRight, ChevronDown,
  Truck, CalendarCheck, DollarSign, X, MapPin, FileText,
  TrendingUp, Bell, Bike,
} from "lucide-react";
import Cookies from "js-cookie";
import Topbar, { type ApiBranch } from "./Topbar";

type NavItem = {
  path: string;
  labelKey: string;
  icon: React.ElementType;
  children?: { path: string; labelKey: string; icon: React.ElementType }[];
};

const getUserRole = (): string | null => {
  if (typeof window === "undefined") return null;

  const tryParseRole = (value: string | undefined | null): string | null => {
    if (!value) return null;
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "string") return parsed;
      if (parsed && typeof parsed === "object" && "role" in parsed) {
        return typeof parsed.role === "string" ? parsed.role : null;
      }
    } catch {
      //
    }
    return value;
  };

  const cookieKeys = ["user", "authUser", "profile", "currentUser", "role"];
  for (const key of cookieKeys) {
    const v = tryParseRole(Cookies.get(key));
    if (v) return v;
  }

  const storageKeys = ["user", "authUser", "profile", "currentUser", "role"];
  for (const key of storageKeys) {
    const v = tryParseRole(localStorage.getItem(key));
    if (v) return v;
  }

  return null;
};

const navItems: NavItem[] = [
  { path: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { path: "/dashboard/menu", labelKey: "menu", icon: UtensilsCrossed },
  {
    path: "/dashboard/orders",
    labelKey: "orders",
    icon: ClipboardList,
    children: [
      { path: "/dashboard/orders", labelKey: "orders", icon: ClipboardList },
      { path: "/dashboard/dispatch", labelKey: "dispatch", icon: Bike },
    ],
  },
  {
    path: "/dashboard/inventory",
    labelKey: "inventory",
    icon: Package,
    children: [
      { path: "/dashboard/inventory", labelKey: "stock", icon: Package },
      { path: "/dashboard/suppliers", labelKey: "suppliers", icon: Truck },
    ],
  },
  {
    path: "/dashboard/staff",
    labelKey: "staff",
    icon: Users,
    children: [
      { path: "/dashboard/staff", labelKey: "employees", icon: Users },
      { path: "/dashboard/attendance", labelKey: "attendance", icon: CalendarCheck },
      { path: "/dashboard/payroll", labelKey: "payroll", icon: DollarSign },
    ],
  },
  { path: "/dashboard/branches", labelKey: "branches", icon: MapPin },
  { path: "/dashboard/tables", labelKey: "tables", icon: Table2 },
  { path: "/dashboard/finance", labelKey: "finance", icon: TrendingUp },
  { path: "/dashboard/analytics", labelKey: "analytics", icon: BarChart3 },
  {
    path: "/dashboard/reports",
    labelKey: "reports",
    icon: FileText,
    children: [
      { path: "/dashboard/reports", labelKey: "reports", icon: FileText },
      { path: "/dashboard/notifications", labelKey: "notifications", icon: Bell },
    ],
  },
  { path: "/dashboard/Executivedashboard", labelKey: "executive", icon: LayoutDashboard },
];

const SidebarNav: React.FC<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onLinkClick?: () => void;
  showCollapseBtn?: boolean;
  role?: string | null;
}> = ({ collapsed, setCollapsed, onLinkClick, showCollapseBtn = true, role }) => {
  const { t } = useTranslation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const isOpen = (path: string) => openMenus[path] ?? false;

  const toggle = (path: string) => {
    if (collapsed) return;
    setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const visibleNavItems = useMemo(() => {
    if (role === "manager") {
      return navItems.filter(
        (item) =>
          item.path !== "/dashboard/Executivedashboard" &&
          item.path !== "/dashboard/branches"
      );
    }
    return navItems;
  }, [role]);

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 overflow-hidden h-[65px] flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200">
          <UtensilsCrossed size={15} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-gray-800 text-sm leading-tight whitespace-nowrap">
              {t("appName")}
            </p>
            <p className="text-[10px] text-gray-400 whitespace-nowrap">
              {t("restaurant")}
            </p>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        {visibleNavItems.map(({ path, labelKey, icon: Icon, children }) => {
          if (children) {
            const open = isOpen(path);

            return (
              <div key={path}>
                <button
                  onClick={() => toggle(path)}
                  title={collapsed ? t(`nav.${labelKey}`) : undefined}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                >
                  <Icon size={18} className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  {!collapsed && (
                    <>
                      <span className="text-sm font-medium whitespace-nowrap flex-1">
                        {t(`nav.${labelKey}`)}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                      />
                    </>
                  )}
                </button>

                {!collapsed && open && (
                  <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l-2 border-blue-100 pl-3">
                    {children.map(({ path: sp, labelKey: slk, icon: SI }) => (
                      <NavLink
                        key={sp}
                        to={sp}
                        end
                        onClick={onLinkClick}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 no-underline text-sm ${
                            isActive
                              ? "bg-blue-600 text-white shadow-sm shadow-blue-100"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <SI size={15} className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                            <span className="font-medium whitespace-nowrap">
                              {t(`nav.${slk}`)}
                            </span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={path}
              to={path}
              end={path === "/dashboard"}
              title={collapsed ? t(`nav.${labelKey}`) : undefined}
              onClick={onLinkClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group no-underline ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-100"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                      {t(`nav.${labelKey}`)}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {showCollapseBtn && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center p-3 border-t border-gray-100 text-gray-400 hover:text-blue-600 hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      )}
    </>
  );
};

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState<ApiBranch | null>(null);

  const userRole = useMemo(() => getUserRole(), []);

  const handleBranchChange = useCallback((branch: ApiBranch | null) => {
    setActiveBranch(branch);
  }, []);

  const outletContext = useMemo(() => ({ activeBranch }), [activeBranch]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex-shrink-0 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        <SidebarNav collapsed={collapsed} setCollapsed={setCollapsed} role={userRole} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col shadow-2xl">
            <SidebarNav
              collapsed={false}
              setCollapsed={setCollapsed}
              onLinkClick={() => setMobileOpen(false)}
              showCollapseBtn={false}
              role={userRole}
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-[18px] right-3 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          onLogout={() => {
            Cookies.remove("token");
            navigate("/login");
          }}
          onBranchChange={handleBranchChange}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;