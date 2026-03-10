// src/pages/ExecutiveDashboard.tsx
import { useState } from "react";
import { DollarSign, ShoppingBag, TrendingUp, Receipt, MapPin } from "lucide-react";
import { useExecutive } from "../../dashboard/hook/useAccounts";

// ── Sparkline ─────────────────────────────────────────────────────────────────
const Sparkline = ({ color, fill }: { color: string; fill: string }) => (
  <svg viewBox="0 0 120 40" className="w-full h-10" preserveAspectRatio="none">
    <defs>
      <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d={fill} fill={`url(#g-${color})`} />
    <path
      d="M0,28 C15,26 25,20 35,22 C45,24 55,18 65,15 C75,12 85,20 95,18 C105,16 115,22 120,20"
      fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
    />
  </svg>
);

const greenFill  = "M0,28 C15,26 25,20 35,22 C45,24 55,18 65,15 C75,12 85,20 95,18 C105,16 115,22 120,20 L120,40 L0,40 Z";
const orangeFill = "M0,25 C15,27 25,22 35,24 C45,26 55,20 65,22 C75,24 85,18 95,20 C105,22 115,18 120,22 L120,40 L0,40 Z";
const redFill    = "M0,22 C15,24 25,28 35,25 C45,22 55,26 65,23 C75,20 85,24 95,22 C105,20 115,24 120,22 L120,40 L0,40 Z";

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon, label, value, badge, color, sparkColor, sparkFill,
}: {
  icon: React.ElementType; label: string; value: string;
  badge?: string; color: string; sparkColor: string; sparkFill: string;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm flex flex-col gap-3">
    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
      <Icon size={16} className={color} />
      {label}
    </div>
    <div className="flex items-center gap-2">
      <span className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</span>
      {badge && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          badge.startsWith("-") ? "text-red-500 bg-red-50" : "text-green-600 bg-green-50"
        }`}>
          {badge.startsWith("-") ? "↓" : "↑"} {badge}
        </span>
      )}
    </div>
    <Sparkline color={sparkColor} fill={sparkFill} />
  </div>
);

// ── Branch Card ───────────────────────────────────────────────────────────────
const BranchCard = ({
  name, location, revenue, profit, change,
}: {
  name: string; location: string; revenue: number; profit: number; change: string;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
        <ShoppingBag size={16} className="text-blue-500" />
      </div>
      <div>
        <p className="font-bold text-gray-800 text-sm">{name}</p>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <MapPin size={10} /> {location}
        </p>
      </div>
    </div>
    <div className="border-t border-gray-50 pt-3 grid grid-cols-3 gap-2">
      <div>
        <p className="text-[10px] text-gray-400">Revenue</p>
        <p className="text-sm font-bold text-gray-800">${revenue.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-[10px] text-gray-400">Change</p>
        <p className={`text-sm font-bold ${change.startsWith("-") ? "text-red-500" : "text-green-500"}`}>
          {change}%
        </p>
      </div>
      <div>
        <p className="text-[10px] text-gray-400">Profit</p>
        <p className={`text-sm font-bold ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>
          ${profit.toLocaleString()}
        </p>
      </div>
    </div>
  </div>
);

// ── Revenue by Branch ─────────────────────────────────────────────────────────
const RevenueByBranch = ({ branches }: { branches: { name: string; revenue: number; profit: number }[] }) => {
  const maxRevenue = Math.max(...branches.map((b) => b.revenue), 1);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm h-full">
      <p className="font-bold text-gray-800 mb-1">Revenue by Branch</p>
      <p className="text-xs text-gray-400 mb-4">Top Performing Locations</p>
      {branches.length === 0 ? (
        <p className="text-xs text-gray-300 text-center py-8">No data</p>
      ) : (
        <div className="space-y-3">
          {branches.map((b) => {
            const pct = Math.round((b.revenue / maxRevenue) * 100);
            return (
              <div key={b.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{b.name}</span>
                  <span className="text-gray-500 font-medium">${b.revenue.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className={`h-full rounded-full ${b.profit >= 0 ? "bg-blue-500" : "bg-red-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ExecutiveDashboard() {
  const [period, setPeriod] = useState<"Today" | "This Week" | "This Month">("Today");
  const [from,   setFrom]   = useState("2026-01-01");
  const [to,     setTo]     = useState("2026-03-31");

  const { data, isLoading } = useExecutive({ from, to });
  const e = data?.data;

  const stats = [
    {
      icon: DollarSign,  label: "Total Revenue",
      value: `$${(e?.summary.totalRevenue.value ?? 0).toLocaleString()}`,
      badge: e?.summary.totalRevenue.change,
      color: "text-green-500",  sparkColor: "#22c55e", sparkFill: greenFill,
    },
    {
      icon: ShoppingBag, label: "Total Orders",
      value: String(e?.summary.totalOrders.value ?? 0),
      badge: e?.summary.totalOrders.change,
      color: "text-green-500",  sparkColor: "#22c55e", sparkFill: greenFill,
    },
    {
      icon: TrendingUp,  label: "Net Profit",
      value: `$${(e?.summary.netProfit ?? 0).toLocaleString()}`,
      color: (e?.summary.netProfit ?? 0) >= 0 ? "text-orange-400" : "text-red-500",
      sparkColor: "#fb923c", sparkFill: orangeFill,
    },
    {
      icon: Receipt,     label: "Total Expenses",
      value: `$${(e?.summary.totalExpenses ?? 0).toLocaleString()}`,
      color: "text-red-400",    sparkColor: "#f87171", sparkFill: redFill,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-400 text-sm animate-pulse">Loading executive data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-400">
            Real-time performance across all {e?.branchPerformance.length ?? 0} locations.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
            {(["Today", "This Week", "This Month"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  period === p ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >{p}</button>
            ))}
          </div>
          {/* Date range */}
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-2 py-2 outline-none" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-2 py-2 outline-none" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Branch Performance */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Branch Performance</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(e?.branchPerformance ?? []).slice(0, 4).map((b) => (
            <BranchCard key={b.id} {...b} />
          ))}
        </div>
        <RevenueByBranch branches={e?.topPerformingLocations ?? []} />
      </div>
    </div>
  );
}