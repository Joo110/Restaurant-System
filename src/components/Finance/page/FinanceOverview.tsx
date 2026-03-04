// src/components/Finance/page/FinanceOverview.tsx
import React, { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { Download } from "lucide-react";

/* ── mock data ─────────────────────────────────────── */
const revenueData = Array.from({ length: 31 }, (_, i) => ({
  day:     i + 1,
  revenue: Math.floor(300000 + Math.random() * 1000000),
  profit:  Math.floor(100000 + Math.random() * 400000),
}));

const expenseBreakdown = [
  { category: "Payroll",   pct: 25, value: 297570 },
  { category: "Food Cost", pct: 20, value: 297570 },
  { category: "Rent",      pct: 20, value: 297570 },
  { category: "Marketing", pct: 15, value: 223178 },
  { category: "Utilities", pct: 10, value: 148785 },
  { category: "Other",     pct: 10, value: 148785 },
];

const orderTypeData = [
  { name: "Dine-in",  value: 55, amount: 682275 },
  { name: "Delivery", value: 30, amount: 372150 },
  { name: "Takeaway", value: 15, amount: 186075 },
];
const PIE_COLORS = ["#2563eb", "#60a5fa", "#e2e8f0"];

const statCards = [
  { label: "Total Revenue",  value: "$1,240,500", delta: "+4%",   up: true,  color: "text-green-500" },
  { label: "Total Expenses", value: "$850,000",   delta: "-2%",   up: false, color: "text-red-500"   },
  { label: "Net Profit",     value: "$390,300",   delta: "+1.6%", up: true,  color: "text-green-500" },
  { label: "Total Payroll",  value: "$210,000",   delta: "+2.4%", up: true,  color: "text-green-500" },
];
const miniColors = ["#22c55e", "#ef4444", "#f59e0b", "#ef4444"];

/* ── Sparkline ─────────────────────────────────────── */
const Spark: React.FC<{ color: string }> = ({ color }) => {
  const d = Array.from({ length: 12 }, () => ({ v: Math.random() * 100 }));
  return (
    <ResponsiveContainer width="100%" height={44}>
      <LineChart data={d}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

/* ── Tooltip ───────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-xl shadow-lg">
      <p className="font-bold">${(payload[0].value / 1000).toFixed(0)}k</p>
      <p className="text-slate-400">Day {label}</p>
    </div>
  );
};

/* ══════════════════════════════════════════════════ */
export default function FinanceOverview() {
  const [period,    setPeriod]    = useState<"Today"|"This Week"|"This Month">("This Month");
  const [chartMode, setChartMode] = useState<"Monthly Revenue"|"Profit Analysis">("Monthly Revenue");

  const chartKey   = chartMode === "Monthly Revenue" ? "revenue" : "profit";
  const chartColor = chartMode === "Monthly Revenue" ? "#2563eb" : "#10b981";

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Financial</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Real-time performance across all restaurant branches
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["Today","This Week","This Month"] as const).map((p) => (
            <button
              key={p} onClick={() => setPeriod(p)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                period === p
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >{p}</button>
          ))}
          <button className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card, i) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-sm">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">{card.label}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <p className="text-base sm:text-xl font-bold text-slate-900">{card.value}</p>
              <span className={`text-[10px] sm:text-xs font-semibold ${card.color}`}>
                {card.up ? "↑" : "↓"} {card.delta}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Vs last month</p>
            <div className="mt-1 opacity-70">
              <Spark color={miniColors[i]} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue Chart ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">Revenue & Profit Trends</h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Monthly performance breakdown</p>
          </div>
          <div className="flex gap-2">
            {(["Monthly Revenue","Profit Analysis"] as const).map((m) => (
              <button
                key={m} onClick={() => setChartMode(m)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
                  chartMode === m ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >{m}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={revenueData} margin={{ top:5, right:5, left:0, bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} width={45} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey={chartKey} stroke={chartColor} strokeWidth={2.5} dot={false}
              activeDot={{ r:5, fill:chartColor, stroke:"#fff", strokeWidth:2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Expense Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base">Expense Breakdown</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 mb-4">Operational cost distribution</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[260px]">
              <thead>
                <tr className="text-[11px] sm:text-xs text-slate-400 border-b border-slate-100">
                  <th className="pb-2 text-left font-medium">Category</th>
                  <th className="pb-2 text-center font-medium">%</th>
                  <th className="pb-2 text-right font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {expenseBreakdown.map((row) => (
                  <tr key={row.category} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 sm:py-2.5 text-xs sm:text-sm text-slate-700">{row.category}</td>
                    <td className="py-2 sm:py-2.5 text-center">
                      <span className="text-[10px] sm:text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{row.pct}%</span>
                    </td>
                    <td className="py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-900 text-right">
                      ${row.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue by Order Type */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base">Revenue by Order Type</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 mb-2">Channel performance distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={orderTypeData} cx="50%" cy="50%"
                innerRadius={45} outerRadius={70}
                dataKey="value" startAngle={90} endAngle={-270}
              >
                {orderTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: any) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="w-full space-y-2 mt-2">
            {orderTypeData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-900">${item.amount.toLocaleString()}</span>
                  <span className="text-slate-400 text-[10px] ml-1">({item.value}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Payroll Summary ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-base sm:text-lg">💰</span>
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">Payroll Summary</h2>
            <p className="text-[11px] sm:text-xs text-slate-400">Current Period: May 2024</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {[
            { label:"Base Salaries", value:"$210,500" },
            { label:"Overtime",      value:"$12,200"  },
            { label:"Bonuses",       value:"$17,300"  },
            { label:"Deductions",    value:"$11,500"  },
          ].map((item) => (
            <div key={item.label} className="border border-slate-100 rounded-xl p-2.5 sm:p-3">
              <p className="text-[10px] sm:text-xs text-slate-400">{item.label}</p>
              <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs text-slate-400">Next Payroll Process</span>
            <span className="text-[10px] sm:text-xs font-semibold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">On Track</span>
          </div>
          <div className="relative h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-[85%] bg-blue-600 rounded-full" />
          </div>
          <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-400 mt-1">
            <span>1 Oct</span><span>Approvals (85%)</span><span>30 Oct</span>
          </div>
        </div>
      </div>

    </div>
  );
}