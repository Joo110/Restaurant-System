// src/pages/BranchReports.tsx
import { useState } from "react";
import { DollarSign, ShoppingBag, TrendingUp, Receipt, Download, MapPin } from "lucide-react";
import { useReports } from "../../dashboard/hook/useAccounts";

// ── Sparkline ─────────────────────────────────────────────────────────────────
const Sparkline = ({ color, fillColor }: { color: string; fillColor: string }) => (
  <svg viewBox="0 0 120 40" className="w-full h-10" preserveAspectRatio="none">
    <defs>
      <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d={fillColor} fill={`url(#spark-${color})`} />
    <path
      d="M0,28 C15,26 25,20 35,22 C45,24 55,18 65,15 C75,12 85,20 95,18 C105,16 115,22 120,20"
      fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
    />
  </svg>
);

// ── Revenue Bar Chart ─────────────────────────────────────────────────────────
const RevenueBarChart = ({ revenuePerMonth }: { revenuePerMonth: { month: number; revenue: number; percentage: number }[] }) => {
  const maxRevenue = Math.max(...revenuePerMonth.map((m) => m.revenue), 1);
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  if (revenuePerMonth.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
        <p className="font-bold text-gray-800 mb-4">Revenue per Month</p>
        <p className="text-xs text-gray-300 text-center py-12">No data</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-4">Revenue per Month</p>
      <div className="flex items-end gap-1.5 h-40 relative">
        {revenuePerMonth.map((m, i) => {
          const pct = Math.round((m.revenue / maxRevenue) * 100);
          const isHighest = m.revenue === maxRevenue;
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-full rounded-t-md transition-all ${isHighest ? "bg-rose-400" : "bg-rose-200"}`}
                style={{ height: `${pct}%` }}
              />
              <span className="text-[9px] text-gray-400">{MONTH_NAMES[m.month - 1]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Donut Chart ───────────────────────────────────────────────────────────────
const DonutChart = ({ categoryPerformance }: { categoryPerformance: { category: string; orders: number; revenue: number }[] }) => {
  const total = categoryPerformance.reduce((s, c) => s + c.orders, 0);
  const COLORS = ["#3b82f6", "#8b5cf6", "#f97316", "#22c55e", "#f43f5e"];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-4">Sales by Category</p>
      <div className="flex items-center justify-center">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {categoryPerformance.length === 0 ? (
              <circle cx="50" cy="50" r="35" fill="none" stroke="#e5e7eb" strokeWidth="18" />
            ) : (
              (() => {
                let offset = 0;
                return categoryPerformance.map((c, i) => {
                  const pct = total > 0 ? (c.orders / total) * 220 : 0;
                  const el = (
                    <circle key={c.category} cx="50" cy="50" r="35"
                      fill="none" stroke={COLORS[i % COLORS.length]}
                      strokeWidth="18"
                      strokeDasharray={`${pct} 220`}
                      strokeDashoffset={`-${offset}`}
                    />
                  );
                  offset += pct;
                  return el;
                });
              })()
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-lg font-bold text-gray-800">{total.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400">Orders</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
        {categoryPerformance.map((c, i) => (
          <div key={c.category} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-gray-500 capitalize">{c.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Top Dishes ────────────────────────────────────────────────────────────────
const TopDishes = ({ dishes }: { dishes: { name: string; orders: number; revenue: number; category: string }[] }) => {
  const emojis: Record<string, string> = { mains: "🍖", starters: "🥗", desserts: "🍰", drinks: "🥤" };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-4">Top selling dishes</p>
      <div className="grid grid-cols-3 text-xs font-semibold text-gray-400 mb-3 pb-2 border-b border-gray-50">
        <span className="text-blue-500">Dish Name</span>
        <span className="text-center">Orders</span>
        <span className="text-right text-red-400">Revenue</span>
      </div>
      {dishes.length === 0 ? (
        <p className="text-xs text-gray-300 text-center py-6">No dishes yet</p>
      ) : (
        <div className="space-y-3">
          {dishes.map((d, i) => (
            <div key={i} className="grid grid-cols-3 items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">{emojis[d.category?.toLowerCase()] ?? "🍽️"}</span>
                <span className="text-gray-700 font-medium text-xs sm:text-sm truncate">{d.name}</span>
              </div>
              <span className="text-center text-gray-500 text-xs">{d.orders}</span>
              <span className="text-right text-green-500 font-semibold text-xs">${d.revenue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Order Status ──────────────────────────────────────────────────────────────
const OrderStatus = ({ breakdown }: { breakdown: { completed: number; pending: number; cancelled: number } }) => {
  const total = breakdown.completed + breakdown.pending + breakdown.cancelled || 1;
  const completedPct  = Math.round((breakdown.completed  / total) * 239);
  const pendingPct    = Math.round((breakdown.pending    / total) * 239);
  const cancelledPct  = Math.round((breakdown.cancelled  / total) * 239);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-4">Order Status Breakdown</p>
      <div className="flex justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="14"
              strokeDasharray={`${completedPct} 239`} />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#fb923c" strokeWidth="14"
              strokeDasharray={`${pendingPct} 239`} strokeDashoffset={`-${completedPct}`} />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#ef4444" strokeWidth="14"
              strokeDasharray={`${cancelledPct} 239`} strokeDashoffset={`-${completedPct + pendingPct}`} />
          </svg>
        </div>
      </div>
      <div className="flex justify-around text-center">
        {[
          { label: "Completed",   value: breakdown.completed,  color: "text-blue-500"   },
          { label: "Pending",     value: breakdown.pending,    color: "text-orange-400" },
          { label: "Cancelled",   value: breakdown.cancelled,  color: "text-red-500"    },
        ].map((s) => (
          <div key={s.label}>
            <div className={`flex items-center gap-1 text-xs mb-1 justify-center ${s.color}`}>
              <div className="w-2 h-2 rounded-full bg-current" />
              {s.label}
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Kitchen Performance ───────────────────────────────────────────────────────
const KitchenPerf = ({ performance }: { performance: { breakfast: string; lunch: string; dinner: string } }) => {
  const parsePct = (v: string) => {
    if (!v || v === "N/A") return 0;
    const n = parseFloat(v);
    return isNaN(n) ? 0 : Math.min((n / 60) * 100, 100);
  };
  const items = [
    { label: "Breakfast", val: performance.breakfast, color: "bg-purple-500", pct: parsePct(performance.breakfast) },
    { label: "Lunch",     val: performance.lunch,     color: "bg-red-400",    pct: parsePct(performance.lunch)     },
    { label: "Dinner",    val: performance.dinner,    color: "bg-blue-400",   pct: parsePct(performance.dinner)    },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-1">Kitchen Performance</p>
      <p className="text-xs text-gray-400 mb-4">Average Preparation Time (minutes)</p>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="h-2 bg-gray-100 rounded-full mb-1.5">
              <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{item.label}</span>
              <span>{item.val === "N/A" ? "N/A" : `${item.val} min`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Low Stock Alert ───────────────────────────────────────────────────────────
const LowStockAlert = ({ lowStock }: { lowStock: { name: string; current: number; target: number }[] }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
    <p className="font-bold text-gray-800 mb-4">Low Stock Alert</p>
    <div className="grid grid-cols-3 text-xs text-gray-400 font-semibold mb-2 pb-2 border-b border-gray-50">
      <span>Item</span>
      <span className="text-center">Current</span>
      <span className="text-right">Status</span>
    </div>
    {lowStock.length === 0 ? (
      <p className="text-xs text-gray-300 text-center py-6">All stock OK</p>
    ) : (
      <div className="space-y-2.5">
        {lowStock.map((item, i) => {
          const isCritical = item.current <= item.target * 0.5;
          return (
            <div key={i} className="grid grid-cols-3 items-center text-sm">
              <span className="text-gray-700">{item.name}</span>
              <span className="text-center text-gray-500 text-xs">{item.current}</span>
              <span className="text-right">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isCritical ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
                }`}>
                  {isCritical ? "Critical" : "Low"}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BranchReports() {
  const [period, setPeriod] = useState<"Today" | "This Week" | "This Month">("Today");
  const [from,   setFrom]   = useState("2026-03-01");
  const [to,     setTo]     = useState("2026-03-31");

  const { data, isLoading } = useReports({ from, to });
  const r = data?.data;

  const sparkGreen  = "M0,28 C15,26 25,20 35,22 C45,24 55,18 65,15 C75,12 85,20 95,18 C105,16 115,22 120,20 L120,40 L0,40 Z";
  const sparkOrange = "M0,25 C15,27 25,22 35,24 C45,26 55,20 65,22 C75,24 85,18 95,20 C105,22 115,18 120,22 L120,40 L0,40 Z";
  const sparkRed    = "M0,22 C15,24 25,28 35,25 C45,22 55,26 65,23 C75,20 85,24 95,22 C105,20 115,24 120,22 L120,40 L0,40 Z";

  const stats = [
    { icon: DollarSign,  label: "Total Revenue", value: `$${(r?.summary.totalRevenue ?? 0).toLocaleString()}`,  badge: r?.summary.revenueChange, color: "text-green-500",  sparkColor: "#22c55e", sparkFill: sparkGreen  },
    { icon: ShoppingBag, label: "Total Orders",  value: String(r?.summary.totalOrders ?? 0),                                                      color: "text-green-500",  sparkColor: "#22c55e", sparkFill: sparkGreen  },
    { icon: TrendingUp,  label: "Net Profit",    value: `$${(r?.summary.netProfit ?? 0).toLocaleString()}`,                                        color: "text-orange-400", sparkColor: "#fb923c", sparkFill: sparkOrange },
    { icon: Receipt,     label: "This Week",     value: `$${(r?.summary.thisWeek ?? 0).toLocaleString()}`,                                         color: "text-red-400",    sparkColor: "#f87171", sparkFill: sparkRed    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-400 text-sm animate-pulse">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Reports — {r?.branchInfo.name ?? "All Branches"}
          </h2>
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin size={12} /> {r?.branchInfo.dateRange.from?.slice(0, 10)} → {r?.branchInfo.dateRange.to?.slice(0, 10)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
            {(["Today", "This Week", "This Month"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >{p}</button>
            ))}
          </div>
          {/* Date range pickers */}
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-2 py-2 outline-none" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-2 py-2 outline-none" />
          <button className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <s.icon size={16} className={s.color} />{s.label}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{s.value}</span>
              {s.badge && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {s.badge}
                </span>
              )}
            </div>
            <Sparkline color={s.sparkColor} fillColor={s.sparkFill} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueBarChart revenuePerMonth={r?.revenuePerMonth ?? []} />
        <DonutChart categoryPerformance={r?.categoryPerformance ?? []} />
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <TopDishes dishes={r?.topSellingDishes ?? []} />
          <KitchenPerf performance={r?.kitchenPerformance ?? { breakfast: "N/A", lunch: "N/A", dinner: "N/A" }} />
        </div>
        <div className="space-y-4">
          <OrderStatus breakdown={r?.orderStatusBreakdown ?? { completed: 0, pending: 0, cancelled: 0 }} />
          <LowStockAlert lowStock={r?.inventorySummary.lowStock ?? []} />
        </div>
      </div>
    </div>
  );
}