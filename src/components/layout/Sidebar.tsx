// src/components/layout/Sidebar.tsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Package,
  Users,
  Table2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Truck,
  CalendarCheck,
  DollarSign,
} from "lucide-react";

type SubItem = {
  path: string;
  label: string;
  icon: React.ElementType;
};

type NavItem = {
  path: string;
  label: string;
  icon: React.ElementType;
  children?: SubItem[];
};

const navItems: NavItem[] = [
  { path: "/dashboard",        label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/menu",   label: "Menu",      icon: UtensilsCrossed },
  { path: "/dashboard/orders", label: "Orders",    icon: ClipboardList   },
  {
    path: "/dashboard/inventory",
    label: "Inventory",
    icon: Package,
    children: [
      { path: "/dashboard/inventory",  label: "Stock",     icon: Package },
      { path: "/dashboard/suppliers",  label: "Suppliers", icon: Truck   },
    ],
  },
  {
    path: "/dashboard/staff",
    label: "Staff",
    icon: Users,
    children: [
      { path: "/dashboard/staff",      label: "Employees",  icon: Users         },
      { path: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
      { path: "/dashboard/payroll",    label: "Payroll",    icon: DollarSign    },
    ],
  },
  { path: "/dashboard/tables",    label: "Tables",    icon: Table2    },
  { path: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);

  const getOpenState = (path: string) => {
    if (path === "/dashboard/inventory") return inventoryOpen;
    if (path === "/dashboard/staff") return staffOpen;
    return false;
  };

  const handleToggle = (path: string) => {
    if (collapsed) return;
    if (path === "/dashboard/inventory") setInventoryOpen((p) => !p);
    if (path === "/dashboard/staff") setStaffOpen((p) => !p);
  };

  return (
    <aside
      className={`
        flex flex-col bg-white border-r border-gray-100
        transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? "w-16" : "w-56"}
      `}
      style={{ minHeight: "100vh" }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <UtensilsCrossed size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-gray-800 text-sm leading-tight whitespace-nowrap">
              Golden Fork
            </p>
            <p className="text-[10px] text-gray-400 whitespace-nowrap">
              Restaurant
            </p>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ path, label, icon: Icon, children }) => {
          if (children) {
            const open = getOpenState(path);
            return (
              <div key={path}>
                <button
                  onClick={() => handleToggle(path)}
                  title={collapsed ? label : undefined}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                             transition-all duration-150 text-left group
                             text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                >
                  <Icon
                    size={18}
                    className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors"
                  />
                  {!collapsed && (
                    <>
                      <span className="text-sm font-medium whitespace-nowrap flex-1">
                        {label}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform duration-200 ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </>
                  )}
                </button>

                {!collapsed && open && (
                  <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l-2 border-blue-100 pl-3">
                    {children.map(({ path: subPath, label: subLabel, icon: SubIcon }) => (
                      <NavLink
                        key={subPath}
                        to={subPath}
                        end
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl
                           transition-all duration-150 no-underline text-sm
                           ${
                             isActive
                               ? "bg-blue-600 text-white shadow-sm shadow-blue-100"
                               : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                           }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <SubIcon
                              size={15}
                              className={`flex-shrink-0 ${
                                isActive ? "text-white" : "text-gray-400"
                              }`}
                            />
                            <span className="font-medium whitespace-nowrap">
                              {subLabel}
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
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl
                 transition-all duration-150 group no-underline
                 ${
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
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                      {label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Collapse Toggle ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center p-3 border-t border-gray-100
                   text-gray-400 hover:text-blue-600 hover:bg-gray-50 transition-colors"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
};

export default Sidebar;