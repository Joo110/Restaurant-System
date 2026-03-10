// src/components/Finance/page/FinanceOverview.tsx
import React, { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { Download } from "lucide-react";
import { useFinance } from "../../dashboard/hook/useAccounts"; 

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
      <p className="text-slate-400">Month {label}</p>
    </div>
  );
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PIE_COLORS = ["#2563eb", "#60a5fa", "#e2e8f0"];

/* ══════════════════════════════════════════════════ */
export default function FinanceOverview() {
  const [period,    setPeriod]    = useState<"Today"|"This Week"|"This Month">("This Month");
  const [chartMode, setChartMode] = useState<"Monthly Revenue"|"Profit Analysis">("Monthly Revenue");
  const [year,      setYear]      = useState<number>(new Date().getFullYear());

  const { data, isLoading } = useFinance({ year });
  const f = data?.data;

  // chart data من monthlyRevenue
  const chartData = (f?.monthlyRevenue ?? []).map((m) => ({
    day:     MONTH_NAMES[m.month - 1] ?? m.month,
    revenue: m.revenue,
    profit:  m.revenue * 0.3, // مفيش profit per month في الـ API، نقدّره
  }));

  const chartKey   = chartMode === "Monthly Revenue" ? "revenue" : "profit";
  const chartColor = chartMode === "Monthly Revenue" ? "#2563eb" : "#10b981";

  // stat cards من summary
  const statCards = [
    {
      label: "Total Revenue",
      value: `$${(f?.summary.totalRevenue ?? 0).toLocaleString()}`,
      delta: f?.summary.totalRevenueChange ?? "0%",
      up: !String(f?.summary.totalRevenueChange ?? "").startsWith("-"),
      color: !String(f?.summary.totalRevenueChange ?? "").startsWith("-") ? "text-green-500" : "text-red-500",
      miniColor: "#22c55e",
    },
    {
      label: "Total Expenses",
      value: `$${(f?.summary.totalExpenses ?? 0).toLocaleString()}`,
      delta: "",
      up: false,
      color: "text-red-500",
      miniColor: "#ef4444",
    },
    {
      label: "Net Profit",
      value: `$${(f?.summary.netProfit ?? 0).toLocaleString()}`,
      delta: f?.summary.profitMargin ?? "",
      up: (f?.summary.netProfit ?? 0) >= 0,
      color: (f?.summary.netProfit ?? 0) >= 0 ? "text-green-500" : "text-red-500",
      miniColor: (f?.summary.netProfit ?? 0) >= 0 ? "#22c55e" : "#ef4444",
    },
    {
      label: "Total Payroll",
      value: `$${(f?.payrollSummary.currentYear ?? 0).toLocaleString()}`,
      delta: "",
      up: true,
      color: "text-green-500",
      miniColor: "#ef4444",
    },
  ];

  // expense breakdown
  const expenseBreakdown = f?.expenseBreakdown ?? [];

  // revenue by type (pie)
  const orderTypeData = (f?.revenueByType ?? []).map((t) => ({
    name:   t.type,
    value:  t.revenue,
    amount: t.revenue,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-slate-400 text-sm animate-pulse">Loading finance data...</p>
      </div>
    );
  }

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
          {/* Year selector */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 rounded-xl text-xs border border-slate-200 text-slate-600 bg-white outline-none"
          >
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-sm">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">{card.label}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <p className="text-base sm:text-xl font-bold text-slate-900">{card.value}</p>
              {card.delta && (
                <span className={`text-[10px] sm:text-xs font-semibold ${card.color}`}>
                  {card.up ? "↑" : "↓"} {card.delta}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Vs last month</p>
            <div className="mt-1 opacity-70">
              <Spark color={card.miniColor} />
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
        {chartData.length === 0 ? (
          <p className="text-xs text-slate-300 text-center py-12">No revenue data for this year</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top:5, right:5, left:0, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} width={45} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey={chartKey} stroke={chartColor} strokeWidth={2.5} dot={false}
                activeDot={{ r:5, fill:chartColor, stroke:"#fff", strokeWidth:2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Expense Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base">Expense Breakdown</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 mb-4">Operational cost distribution</p>
          {expenseBreakdown.length === 0 ? (
            <p className="text-xs text-slate-300 text-center py-8">No expense data</p>
          ) : (
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
                        <span className="text-[10px] sm:text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          {row.percentage}%
                        </span>
                      </td>
                      <td className="py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-900 text-right">
                        ${row.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Revenue by Order Type */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base">Revenue by Order Type</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 mb-2">Channel performance distribution</p>
          {orderTypeData.length === 0 ? (
            <p className="text-xs text-slate-300 text-center py-12">No data</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={orderTypeData} cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    dataKey="value" startAngle={90} endAngle={-270}
                  >
                    {orderTypeData.map((entry, idx) => (
                      <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2 mt-2">
                {orderTypeData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0"
                        style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="text-slate-600 capitalize">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
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
            <p className="text-[11px] sm:text-xs text-slate-400">Year: {year}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div className="border border-slate-100 rounded-xl p-2.5 sm:p-3">
            <p className="text-[10px] sm:text-xs text-slate-400">Total Payroll</p>
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              ${(f?.payrollSummary.currentYear ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="border border-slate-100 rounded-xl p-2.5 sm:p-3">
            <p className="text-[10px] sm:text-xs text-slate-400">Next Payroll</p>
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              ${(f?.payrollSummary.nextPayroll ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}