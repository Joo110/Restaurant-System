// src/pages/StaffOverview.tsx
import { useState } from "react";
import {
  Users, Search, ChevronDown, Building2, Mail, Phone,
  UserPlus, Clock, AlertTriangle, Calendar,
} from "lucide-react";

// ── Staff Member type ─────────────────────────────────────────────────────────
interface StaffMember {
  name: string;
  role: string;
  branch: string;
  email: string;
  phone: string;
  status: "On Shift" | "Off Shift" | "On Break";
}

const statusStyles: Record<StaffMember["status"], string> = {
  "On Shift":  "bg-green-100 text-green-600",
  "Off Shift": "bg-gray-100 text-gray-500",
  "On Break":  "bg-yellow-100 text-yellow-600",
};

// ── Staff Card ────────────────────────────────────────────────────────────────
const StaffCard = ({ staff }: { staff: StaffMember }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
    <div className="flex items-start justify-between gap-2 mb-3">
      <div>
        <p className="font-bold text-gray-900 text-sm sm:text-base">{staff.name}</p>
        <p className="text-xs text-gray-400">{staff.role}</p>
      </div>
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap shrink-0 ${statusStyles[staff.status]}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
        {staff.status}
      </span>
    </div>

    <div className="border-t border-gray-50 mb-3" />

    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-gray-400"><Building2 size={12} /> Branch</span>
        <span className="font-semibold text-gray-700">{staff.branch}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-gray-400"><Mail size={12} /> Email</span>
        <span className="font-semibold text-gray-700 truncate ml-2 max-w-[140px]">{staff.email}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-gray-400"><Phone size={12} /> Phone</span>
        <span className="font-semibold text-gray-700">{staff.phone}</span>
      </div>
    </div>
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon, label, value, sub, badge, badgeColor,
}: {
  icon: React.ElementType; label: string; value: string;
  sub: string; badge?: string; badgeColor?: string;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-3">
      <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
        <Icon size={14} className="text-gray-600" />
      </div>
      {label}
    </div>
    <div className="flex items-end gap-2">
      <span className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</span>
      {badge && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full mb-0.5 ${badgeColor}`}>
          {badge}
        </span>
      )}
    </div>
    <p className="text-xs text-gray-400 mt-1">{sub}</p>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StaffOverview() {
  const [search,       setSearch]       = useState("");
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [roleFilter,   setRoleFilter]   = useState("All Roles");

  const allStaff: StaffMember[] = Array.from({ length: 8 }, (_, i) => ({
    name:   "Mohamed Morsy",
    role:   "Headchef",
    branch: "Mansoura",
    email:  "morsy22@emp....",
    phone:  "+(20) 669658",
    status: (i % 3 === 2 ? "Off Shift" : "On Shift") as StaffMember["status"],
  }));

  const filtered = allStaff.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q)
    );
  });

  const branches = ["All Branches", "Mansoura", "Downtown", "Talkha", "Dokki"];
  const roles    = ["All Roles", "Headchef", "Waiter", "Cashier", "Manager"];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Staff Overview</h2>
        <p className="text-sm text-gray-400 mt-0.5">Manage employees across all branches.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}         label="Total Employee"       value="1,233"
          badge="↑ 4%"         badgeColor="bg-green-100 text-green-600"
          sub="Across 12 branches"
        />
        <StatCard
          icon={Clock}         label="Currently Clocked In" value="495"
          badge="38% Of total staff" badgeColor="bg-gray-100 text-gray-600"
          sub="Active right now"
        />
        <StatCard
          icon={AlertTriangle} label="Staffing Gaps"        value="5"
          badge="Critical needs"     badgeColor="bg-red-100 text-red-500"
          sub="Branches need attention"
        />
        <StatCard
          icon={Calendar}      label="Upcoming Shifts"      value="80"
          badge="Next 4 hours"       badgeColor="bg-blue-50 text-blue-500"
          sub="Scheduled arrivals"
        />
      </div>

      {/* Filters + Search + Add */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by Name, Email....."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
          />
        </div>

        {/* Branch filter */}
        <div className="relative">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 outline-none appearance-none pr-8 cursor-pointer"
          >
            {branches.map((b) => <option key={b}>{b}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Role filter */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 outline-none appearance-none pr-8 cursor-pointer"
          >
            {roles.map((r) => <option key={r}>{r}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Add */}
        <button className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap">
          <UserPlus size={16} /> Add New Staff
        </button>
      </div>

      {/* Staff Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-5xl mb-3">👤</span>
          <p className="font-semibold">No staff found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s, i) => <StaffCard key={i} staff={s} />)}
        </div>
      )}
    </div>
  );
}