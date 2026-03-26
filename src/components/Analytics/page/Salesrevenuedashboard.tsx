import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Data ─────────────────────────────────────────────────────────────────────

const revenueData = [
  { monthKey: "jan", revenue: 120000 },
  { monthKey: "feb", revenue: 98000 },
  { monthKey: "mar", revenue: 145000 },
  { monthKey: "apr", revenue: 132000 },
  { monthKey: "may", revenue: 160000 },
  { monthKey: "jun", revenue: 155000 },
  { monthKey: "jul", revenue: 170440 },
];

const revenueByBranch = [
  { branchKey: "downtownBranch", value: 92.4 },
  { branchKey: "uptownBranch", value: 84.2 },
  { branchKey: "marinaBranch", value: 76.8 },
  { branchKey: "airportBranch", value: 61.4 },
  { branchKey: "mallBranch", value: 54.3 },
];

const topSelling = [
  { nameKey: "margheritaPizza", orders: 41, revenue: 820, img: "🍕", up: true },
  { nameKey: "beefTenderloin", orders: 44, revenue: 1540, img: "🥩", up: true },
  { nameKey: "caesarSalad", orders: 40, revenue: 480, img: "🥗", up: true },
  { nameKey: "pastaCarbonara", orders: 38, revenue: 760, img: "🍝", up: true },
  { nameKey: "grilledSalmon", orders: 41, revenue: 1230, img: "🐟", up: true },
  { nameKey: "beefBurger", orders: 38, revenue: 570, img: "🍔", up: true },
];

const leastSelling = [
  { nameKey: "margheritaPizza", orders: 41, revenue: 820, img: "🍕", up: false },
  { nameKey: "beefTenderloin", orders: 44, revenue: 1540, img: "🥩", up: false },
  { nameKey: "caesarSalad", orders: 40, revenue: 480, img: "🥗", up: false },
  { nameKey: "pastaCarbonara", orders: 38, revenue: 760, img: "🍝", up: false },
  { nameKey: "grilledSalmon", orders: 41, revenue: 1230, img: "🐟", up: false },
  { nameKey: "beefBurger", orders: 38, revenue: 570, img: "🍔", up: false },
];

const categoryData = [
  { nameKey: "burgers", value: 203015, color: "#3b82f6" },
  { nameKey: "pizza", value: 87000, color: "#f59e0b" },
  { nameKey: "other", value: 45000, color: "#10b981" },
];

const reorderItems = [
  { nameKey: "mozzarella", categoryKey: "dairy", status: "low" },
  { nameKey: "mcGridz", categoryKey: "dairy", status: "ok" },
  { nameKey: "mazarelle", categoryKey: "150g", status: "ok" },
  { nameKey: "mcGridz", categoryKey: "dairy", status: "low" },
  { nameKey: "mozzarella", categoryKey: "150g", status: "out" },
];

const ordersByHour = [
  { hour: "9am", v: 20 }, { hour: "10am", v: 35 }, { hour: "11am", v: 45 },
  { hour: "12pm", v: 80 }, { hour: "1pm", v: 95 }, { hour: "2pm", v: 70 },
  { hour: "3pm", v: 50 }, { hour: "4pm", v: 40 }, { hour: "5pm", v: 55 },
  { hour: "6pm", v: 90 }, { hour: "7pm", v: 110 }, { hour: "8pm", v: 85 },
  { hour: "9pm", v: 60 }, { hour: "10pm", v: 30 },
];

const ordersByBranch = [
  { branchKey: "downtown", orders: 455 }, { branchKey: "uptown", orders: 380 },
  { branchKey: "marina", orders: 310 }, { branchKey: "airport", orders: 280 },
  { branchKey: "mall", orders: 210 },
];

const supplierData = [
  { catKey: "vegetables", v: 12000 }, { catKey: "dairy", v: 18000 },
  { catKey: "meat", v: 28000 }, { catKey: "bakery", v: 9000 },
  { catKey: "seafood", v: 22000 },
];

const branchComparison = [
  { nameKey: "downtownBranch", revenue: "$92,415", orders: "1,384", foodCost: 34, margin: 210 },
  { nameKey: "uptownBranch", revenue: "$84,220", orders: "1,261", foodCost: 35, margin: 225 },
  { nameKey: "marinaBranch", revenue: "$76,820", orders: "1,108", foodCost: 38, margin: 172 },
  { nameKey: "downtownSales", revenue: "$63,310", orders: "985", foodCost: 31, margin: 198 },
  { nameKey: "downtownBranch2", revenue: "$51,190", orders: "876", foodCost: 40, margin: 115 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  icon,
  labelKey,
  value,
  trend,
  trendUp,
}: {
  icon: string;
  labelKey: string;
  value: string;
  trend: string;
  trendUp: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 min-w-0">
      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-2">
        <span>{icon}</span>
        <span className="truncate">{t(labelKey)}</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight truncate">{value}</p>
      <div className="flex items-center gap-1 mt-1 text-xs">
        <span className={`font-semibold ${trendUp ? "text-emerald-500" : "text-red-400"}`}>
          {trendUp ? "▲" : "▼"} {trend}
        </span>
        <span className="text-slate-400">{t("vsLastMonth")}</span>
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return <h2 className="text-sm font-bold text-slate-700 mb-3">{t(titleKey)}</h2>;
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();

  const map: Record<string, string> = {
    low: "bg-amber-100 text-amber-700",
    ok: "bg-emerald-100 text-emerald-700",
    out: "bg-red-100 text-red-600",
  };

  const label =
    status === "low"
      ? t("lowStock")
      : status === "out"
      ? t("outOfStock")
      : t("inStock");

  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${map[status] ?? ""}`}>{label}</span>;
}

const BRANCH_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e"];

// ─── Main ─────────────────────────────────────────────────────────────────────

type Period = "today" | "thisWeek" | "thisMonth";

export default function SalesRevenueDashboard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>("thisMonth");

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">{t("salesRevenue")}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{t("businessInsightsForAllBranches")}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {(["today", "thisWeek", "thisMonth"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 sm:px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    period === p ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {t(p)}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-blue-700 transition">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t("export")}
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon="💰" labelKey="totalRevenue" value="$170,490" trend="+12.5%" trendUp />
          <KpiCard icon="📈" labelKey="growth" value="+12.5%" trend="+2.1%" trendUp />
          <KpiCard icon="🛒" labelKey="avgOrderValue" value="$42.50" trend="-3.2%" trendUp={false} />
          <KpiCard icon="📋" labelKey="noPerTable" value="$185.00" trend="-12%" trendUp={false} />
        </div>

        {/* ── Revenue chart + Revenue by Branch ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <SectionTitle titleKey="revenue" />
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="monthKey" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => t(String(v))} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, t("revenue")]} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <SectionTitle titleKey="revenueByBranch" />
            <div className="space-y-2.5 sm:space-y-3">
              {revenueByBranch.map((b, i) => {
                const pct = Math.round((b.value / revenueByBranch[0].value) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 truncate pr-2">{t(b.branchKey)}</span>
                      <span className="font-semibold text-slate-700 flex-shrink-0">${b.value}k</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: BRANCH_COLORS[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ── Top + Least Selling ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { titleKey: "topSellingDishes", data: topSelling, color: "text-emerald-500" },
            { titleKey: "leastSellingDishes", data: leastSelling, color: "text-red-400" },
          ].map(({ titleKey, data, color }) => (
            <Card key={titleKey}>
              <SectionTitle titleKey={titleKey} />
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[260px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="text-left pb-2 font-medium">{t("dishName")}</th>
                      <th className="text-right pb-2 font-medium">{t("orders")}</th>
                      <th className="text-right pb-2 font-medium">{t("revenue")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0">
                        <td className="py-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base flex-shrink-0">{item.img}</span>
                            <span className="font-medium text-slate-700 truncate">{t(item.nameKey)}</span>
                          </div>
                        </td>
                        <td className="py-2 text-right text-slate-500">{item.orders}</td>
                        <td className={`py-2 text-right font-semibold ${color}`}>${item.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Category + Inventory + Restocked ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Category Pie */}
          <Card>
            <SectionTitle titleKey="salesByCategory" />
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={48} outerRadius={70} dataKey="value">
                  {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3 mt-1 flex-wrap">
              {categoryData.map((c) => (
                <div key={c.nameKey} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  {t(c.nameKey)}
                </div>
              ))}
            </div>
          </Card>

          {/* Inventory Snapshot */}
          <Card>
            <SectionTitle titleKey="inventorySnapshot" />
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
                <div>
                  <p className="text-xs font-bold text-amber-700">{t("lowStockAlert")}</p>
                  <p className="text-xs text-amber-600">{t("itemsNeedRestocking")}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { labelKey: "criticalItems", value: "12", suffixKey: "items", color: "text-red-500" },
                  { labelKey: "expiringSoon", value: "45", suffixKey: "units", color: "text-amber-500" },
                  { labelKey: "inventoryValue", value: "$34,892", suffixKey: "", color: "text-blue-600" },
                ].map((s) => (
                  <div key={s.labelKey} className="bg-slate-50 rounded-xl p-2.5 text-center">
                    <p className={`text-xs sm:text-sm font-bold ${s.color}`}>
                      {s.value}
                      {s.suffixKey ? ` ${t(s.suffixKey)}` : ""}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{t(s.labelKey)}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1.5">{t("stockAvailabilityRate")}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-emerald-500 rounded-full" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600">94.2%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Most Restocked */}
          <Card>
            <SectionTitle titleKey="mostRestockedItems" />
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="text-left pb-2 font-medium">{t("name")}</th>
                  <th className="text-left pb-2 font-medium">{t("category")}</th>
                  <th className="text-right pb-2 font-medium">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {reorderItems.map((item, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 font-medium text-slate-700">{t(item.nameKey)}</td>
                    <td className="py-2 text-slate-500">{t(item.categoryKey)}</td>
                    <td className="py-2 text-right"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="mt-3 text-xs text-blue-600 font-semibold hover:underline">{t("viewAllInventory")} →</button>
          </Card>
        </div>

        {/* ── Order Status + Orders by Hour ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Donut */}
          <Card>
            <SectionTitle titleKey="orderStatusBreakdown" />
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <div className="relative flex-shrink-0">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={[
                        { nameKey: "completed", value: 170 },
                        { nameKey: "inProgress", value: 69 },
                        { nameKey: "cancelled", value: 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={62}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="#3b82f6" /><Cell fill="#f59e0b" /><Cell fill="#f43f5e" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">239</span>
                </div>
              </div>
              <div className="space-y-2 min-w-0">
                {[
                  { labelKey: "completed", count: 170, color: "#3b82f6" },
                  { labelKey: "inProgress", count: 69, color: "#f59e0b" },
                  { labelKey: "cancelled", count: 0, color: "#f43f5e" },
                ].map((s) => (
                  <div key={s.labelKey} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-slate-600">{t(s.labelKey)}</span>
                    <span className="text-xs font-bold text-slate-800 ml-auto pl-3">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Hours Bar */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle titleKey="ordersByHour" />
              <span className="text-xs text-blue-600 font-semibold">{t("peakZone")}</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={ordersByHour} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="v" radius={[3, 3, 0, 0]}>
                  {ordersByHour.map((e, i) => <Cell key={i} fill={e.v > 80 ? "#1d4ed8" : "#93c5fd"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Orders by Branch + Supplier ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Orders by Branch */}
          <Card>
            <SectionTitle titleKey="ordersByBranch" />
            <div className="space-y-2.5">
              {ordersByBranch.map((b, i) => {
                const pct = Math.round((b.orders / ordersByBranch[0].orders) * 100);
                return (
                  <div key={i} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs text-slate-500 w-16 sm:w-20 flex-shrink-0 truncate">{t(b.branchKey)}</span>
                    <div className="flex-1 h-3 sm:h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: BRANCH_COLORS[i] }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-8 text-right flex-shrink-0">{b.orders}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Supplier */}
          <Card>
            <SectionTitle titleKey="supplierSpendingByCategory" />
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={supplierData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="catKey" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => t(String(v))} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, t("spend")]} />
                <Bar dataKey="v" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Branch Comparison ── */}
        <Card>
          <SectionTitle titleKey="branchComparison" />
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-xs sm:text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {[t("branchName"), t("revenue"), t("orders"), t("foodCost"), t("margin")].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 pb-3 pr-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {branchComparison.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-3 font-medium text-slate-700 whitespace-nowrap">{t(row.nameKey)}</td>
                    <td className="py-3 pr-3 text-slate-600 font-semibold whitespace-nowrap">{row.revenue}</td>
                    <td className="py-3 pr-3 text-slate-600">{row.orders}</td>
                    <td className="py-3 pr-3">
                      <span className={`text-xs font-semibold ${row.foodCost > 37 ? "text-red-500" : "text-emerald-600"}`}>
                        {row.foodCost}%
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 sm:w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (row.margin / 250) * 100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 flex-shrink-0">{row.margin}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}