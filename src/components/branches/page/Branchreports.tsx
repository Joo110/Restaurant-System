// src/pages/BranchReports.tsx
import { useState } from "react";
import { DollarSign, ShoppingBag, TrendingUp, Receipt, ChevronDown, Download, MapPin } from "lucide-react";

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
const RevenueBarChart = () => {
  const bars   = [30, 20, 28, 15, 22, 18, 28, 22, 90, 40, 35, 25];
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-4">Revenue per Month</p>
      <div className="flex items-end gap-1.5 h-40 relative">
        <div className="absolute top-0 left-[62%] bg-white border border-gray-200 rounded-lg px-2 py-1 shadow text-xs font-bold text-gray-700 z-10">
          23.8% ↑
        </div>
        {bars.map((h, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-full rounded-t-md transition-all ${i === 8 ? "bg-rose-400" : "bg-rose-200"}`}
              style={{ height: `${h}%` }}
            />
            <span className="text-[9px] text-gray-400">{months[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Donut Chart ───────────────────────────────────────────────────────────────
const DonutChart = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
    <p className="font-bold text-gray-800 mb-4">Sales by Category</p>
    <div className="flex items-center justify-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="35" fill="none" stroke="#3b82f6" strokeWidth="18" strokeDasharray="80 220" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="#8b5cf6" strokeWidth="18" strokeDasharray="40 220" strokeDashoffset="-80" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="#f97316" strokeWidth="18" strokeDasharray="50 220" strokeDashoffset="-120" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="#22c55e" strokeWidth="18" strokeDasharray="30 220" strokeDashoffset="-170" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-lg font-bold text-gray-800">203,015</p>
          <p className="text-[10px] text-gray-400">Orders</p>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
      {[
        { label: "Main",     color: "bg-blue-500"   },
        { label: "Dessert",  color: "bg-purple-500" },
        { label: "Starters", color: "bg-orange-500" },
        { label: "Drinks",   color: "bg-green-500"  },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
          <span className="text-gray-500">{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

// ── Top Dishes ────────────────────────────────────────────────────────────────
const TopDishes = () => {
  const dishes = [
    { name: "Mrgherita Pizza", orders: 87, revenue: "$1600" },
    { name: "Beef Tenderloin", orders: 83, revenue: "$1600" },
    { name: "Caesar Salad",    orders: 64, revenue: "$1600" },
    { name: "Pasta Carbonara", orders: 60, revenue: "$900"  },
    { name: "Grilled Salmon",  orders: 45, revenue: "$700"  },
    { name: "Beef Burger",     orders: 26, revenue: "$452"  },
  ];
  const emojis = ["🍕", "🥩", "🥗", "🍝", "🐟", "🍔"];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-4">Top selling dishes</p>
      <div className="grid grid-cols-3 text-xs font-semibold text-gray-400 mb-3 pb-2 border-b border-gray-50">
        <span className="text-blue-500">Dish Name</span>
        <span className="text-center">Orders</span>
        <span className="text-right text-red-400">Revenue</span>
      </div>
      <div className="space-y-3">
        {dishes.map((d, i) => (
          <div key={d.name} className="grid grid-cols-3 items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">{emojis[i]}</span>
              <span className="text-gray-700 font-medium text-xs sm:text-sm truncate">{d.name}</span>
            </div>
            <span className="text-center text-gray-500 text-xs">{d.orders}</span>
            <span className="text-right text-green-500 font-semibold text-xs">{d.revenue}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Order Status ──────────────────────────────────────────────────────────────
const OrderStatus = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
    <p className="font-bold text-gray-800 mb-4">Order Status Breakdown</p>
    <div className="flex justify-center mb-4">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="14" strokeDasharray="140 239" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="#fb923c" strokeWidth="14" strokeDasharray="62 239"  strokeDashoffset="-140" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="#ef4444" strokeWidth="14" strokeDasharray="14 239"  strokeDashoffset="-202" />
        </svg>
      </div>
    </div>
    <div className="flex justify-around text-center">
      {[
        { label: "Completed",   value: "170", color: "text-blue-500"   },
        { label: "In Progress", value: "65",  color: "text-orange-400" },
        { label: "Cancelled",   value: "4",   color: "text-red-500"    },
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

// ── Kitchen Performance ───────────────────────────────────────────────────────
const KitchenPerformance = () => {
  const items = [
    { label: "Breakfast", mins: 12, color: "bg-purple-500", pct: 40  },
    { label: "Lunch",     mins: 30, color: "bg-red-400",    pct: 100 },
    { label: "Dinner",    mins: 10, color: "bg-blue-400",   pct: 33  },
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
              <span>{item.mins} min</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Low Stock Alert ───────────────────────────────────────────────────────────
const LowStockAlert = () => {
  const items = [
    { item: "Tomatoes", qty: "2 Kg", status: "Critical", color: "bg-red-100 text-red-600"       },
    { item: "Tomatoes", qty: "9 Kg", status: "Low",      color: "bg-yellow-100 text-yellow-600" },
    { item: "Tomatoes", qty: "5 Kg", status: "Critical", color: "bg-red-100 text-red-600"       },
    { item: "Tomatoes", qty: "7 Kg", status: "Critical", color: "bg-red-100 text-red-600"       },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-4">Low Stock Alert</p>
      <div className="grid grid-cols-3 text-xs text-gray-400 font-semibold mb-2 pb-2 border-b border-gray-50">
        <span>Item</span>
        <span className="text-center">Qty</span>
        <span className="text-right">Status</span>
      </div>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-3 items-center text-sm">
            <span className="text-gray-700">{item.item}</span>
            <span className="text-center text-gray-500 text-xs">{item.qty}</span>
            <span className="text-right">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.color}`}>
                {item.status}
              </span>
            </span>
          </div>
        ))}
      </div>
      <button className="w-full text-center text-blue-600 text-sm font-semibold mt-4 hover:underline">
        Order Supplies
      </button>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BranchReports() {
  const [period, setPeriod] = useState<"Today" | "This Week" | "This Month">("Today");

  const sparkGreen  = "M0,28 C15,26 25,20 35,22 C45,24 55,18 65,15 C75,12 85,20 95,18 C105,16 115,22 120,20 L120,40 L0,40 Z";
  const sparkOrange = "M0,25 C15,27 25,22 35,24 C45,26 55,20 65,22 C75,24 85,18 95,20 C105,22 115,18 120,22 L120,40 L0,40 Z";
  const sparkRed    = "M0,22 C15,24 25,28 35,25 C45,22 55,26 65,23 C75,20 85,24 95,22 C105,20 115,24 120,22 L120,40 L0,40 Z";

  const stats = [
    { icon: DollarSign,  label: "Total Revenue", value: "$122,512", badge: "4%", color: "text-green-500",  sparkColor: "#22c55e", sparkFill: sparkGreen  },
    { icon: ShoppingBag, label: "Total Orders",  value: "521",      badge: "2%", color: "text-green-500",  sparkColor: "#22c55e", sparkFill: sparkGreen  },
    { icon: TrendingUp,  label: "Net Profit",    value: "$5,4020",               color: "text-orange-400", sparkColor: "#fb923c", sparkFill: sparkOrange },
    { icon: Receipt,     label: "Total Expness", value: "$8,150",                color: "text-red-400",    sparkColor: "#f87171", sparkFill: sparkRed    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Reports - Mansoura Branch</h2>
          <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin size={12} /> Daily operational insights and performance metrics for Oct 24, 2026.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
            {(["Today", "This Week", "This Month"] as const).map((p) => (
              <button
                key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >{p}</button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
            <Download size={14} /> Export
          </button>
          <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-xl px-3 py-2">
            <MapPin size={14} /> Mansoura Branch <ChevronDown size={14} />
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
                  ↑ {s.badge}
                </span>
              )}
            </div>
            <Sparkline color={s.sparkColor} fillColor={s.sparkFill} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueBarChart />
        <DonutChart />
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <TopDishes />
          <KitchenPerformance />
        </div>
        <div className="space-y-4">
          <OrderStatus />
          <LowStockAlert />
        </div>
      </div>
    </div>
  );
}