// src/components/layout/DashboardLayout.tsx
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, UtensilsCrossed, ClipboardList, Package, Users,
  Table2, BarChart3, ChevronLeft, ChevronRight, ChevronDown,
  Bell, Calendar, RefreshCw, User, LogOut, Truck, CalendarCheck,
  DollarSign, Menu, X,
} from "lucide-react";
import Cookies from "js-cookie";

type NavItem = {
  path: string;
  label: string;
  icon: React.ElementType;
  children?: { path: string; label: string; icon: React.ElementType }[];
};

const navItems: NavItem[] = [
  { path: "/dashboard",        label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/menu",   label: "Menu",      icon: UtensilsCrossed },
  { path: "/dashboard/orders", label: "Orders",    icon: ClipboardList   },
  {
    path: "/dashboard/inventory", label: "Inventory", icon: Package,
    children: [
      { path: "/dashboard/inventory", label: "Stock",     icon: Package },
      { path: "/dashboard/suppliers", label: "Suppliers", icon: Truck   },
    ],
  },
  {
    path: "/dashboard/staff", label: "Staff", icon: Users,
    children: [
      { path: "/dashboard/staff",      label: "Employees",  icon: Users         },
      { path: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
      { path: "/dashboard/payroll",    label: "Payroll",    icon: DollarSign    },
    ],
  },
  { path: "/dashboard/tables",    label: "Tables",    icon: Table2    },
  { path: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

// ─── Sidebar Nav Content ───────────────────────────────────────────────────────
const SidebarNav: React.FC<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onLinkClick?: () => void;
  showCollapseBtn?: boolean;
}> = ({ collapsed, setCollapsed, onLinkClick, showCollapseBtn = true }) => {
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [staffOpen,     setStaffOpen]     = useState(false);

  const getOpen = (path: string) => {
    if (path === "/dashboard/inventory") return inventoryOpen;
    if (path === "/dashboard/staff")     return staffOpen;
    return false;
  };
  const toggle = (path: string) => {
    if (collapsed) return;
    if (path === "/dashboard/inventory") setInventoryOpen((p) => !p);
    if (path === "/dashboard/staff")     setStaffOpen((p) => !p);
  };

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 overflow-hidden h-[65px] flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200">
          <UtensilsCrossed size={15} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-gray-800 text-sm leading-tight whitespace-nowrap">Golden Fork</p>
            <p className="text-[10px] text-gray-400 whitespace-nowrap">Restaurant</p>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ path, label, icon: Icon, children }) => {
          if (children) {
            const open = getOpen(path);
            return (
              <div key={path}>
                <button
                  onClick={() => toggle(path)}
                  title={collapsed ? label : undefined}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                >
                  <Icon size={18} className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  {!collapsed && (
                    <>
                      <span className="text-sm font-medium whitespace-nowrap flex-1">{label}</span>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                    </>
                  )}
                </button>
                {!collapsed && open && (
                  <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l-2 border-blue-100 pl-3">
                    {children.map(({ path: sp, label: sl, icon: SI }) => (
                      <NavLink
                        key={sp} to={sp} end onClick={onLinkClick}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 no-underline text-sm ${
                            isActive ? "bg-blue-600 text-white shadow-sm shadow-blue-100" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <SI size={15} className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                            <span className="font-medium whitespace-nowrap">{sl}</span>
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
              key={path} to={path} end={path === "/dashboard"}
              title={collapsed ? label : undefined}
              onClick={onLinkClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group no-underline ${
                  isActive ? "bg-blue-600 text-white shadow-sm shadow-blue-100" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={`flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
                  {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
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

// ─── Topbar ───────────────────────────────────────────────────────────────────
const Topbar: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const handleLogout = () => { Cookies.remove("token"); navigate("/login"); };

  return (
    <header className="bg-white border-b border-gray-100 px-3 sm:px-6 h-[65px] flex items-center justify-between gap-2 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Menu size={18} />
        </button>
        <h1 className="text-sm sm:text-base font-bold text-gray-800 whitespace-nowrap">Store Overview</h1>
        <button className="hidden sm:flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-blue-400 hover:text-blue-600 transition-all bg-white">
          <span>🏢</span>
          <span className="whitespace-nowrap">Mansoura Branch</span>
          <ChevronDown size={13} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
          <Calendar size={13} />
          <span className="whitespace-nowrap">Feb 15, 2026</span>
        </button>
        <button className="hidden sm:flex p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white">
          <RefreshCw size={15} />
        </button>
        <div className="relative">
          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white">
            <Bell size={15} />
          </button>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </div>
        <button onClick={() => navigate("/profile")} className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white">
          <User size={15} />
        </button>
        <button onClick={handleLogout} title="Logout" className="p-2 border border-gray-200 rounded-lg text-red-400 hover:text-red-600 hover:border-red-300 transition-all bg-white">
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};

// ─── DashboardLayout ──────────────────────────────────────────────────────────
const DashboardLayout: React.FC = () => {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ease-in-out flex-shrink-0 ${collapsed ? "w-16" : "w-56"}`}>
        <SidebarNav collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col shadow-2xl">
            <SidebarNav collapsed={false} setCollapsed={setCollapsed} onLinkClick={() => setMobileOpen(false)} showCollapseBtn={false} />
            <button onClick={() => setMobileOpen(false)} className="absolute top-[18px] right-3 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={16} />
            </button>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;