import React, { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { Download, AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFinance, periodToRange, type Period } from "../../dashboard/hook/useAccounts";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PIE_COLORS  = ["#2563eb","#60a5fa","#e2e8f0"];

const Spark: React.FC<{ color: string }> = ({ color }) => {
  const d = useMemo(() => Array.from({ length: 12 }, () => ({ v: Math.random() * 100 })), []);
  return (
    <ResponsiveContainer width="100%" height={44}>
      <LineChart data={d}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-xl shadow-lg">
      <p className="font-bold">${Number(payload[0].value || 0).toLocaleString()}</p>
      <p className="text-slate-400">{label}</p>
    </div>
  );
};

function filterMonthly(
  monthly: { month: number; revenue: number }[],
  period: Period
): { month: number; revenue: number }[] {
  const cur = new Date().getMonth() + 1;
  if (period === "today")    return monthly.filter(m => m.month === cur);
  if (period === "thisWeek") return monthly.filter(m => m.month >= Math.max(1, cur - 2) && m.month <= cur);
  return monthly;
}

export default function FinanceOverview() {
  const { t } = useTranslation();

  const [period,    setPeriod]    = useState<Period>("thisMonth");
  const [chartMode, setChartMode] = useState<"monthlyRevenue" | "profitAnalysis">("monthlyRevenue");
  const [year,      setYear]      = useState<number>(new Date().getFullYear());

  // Compute from/to from period + year — hook re-fetches on every change
  const { from, to } = useMemo(() => periodToRange(period, year), [period, year]);

  const { data, isLoading, isError, error, refetch } = useFinance({ year, from, to, period });

  const finance = useMemo(() => {
    const outer = data as any;
    return outer?.data ?? outer ?? null;
  }, [data]);

  const rawMonthly: { month: number; revenue: number }[] = finance?.monthlyRevenue ?? [];
  const filteredMonthly = useMemo(() => filterMonthly(rawMonthly, period), [rawMonthly, period]);

  const chartData = filteredMonthly.map(m => ({
    day:     MONTH_NAMES[m.month - 1] ?? String(m.month),
    revenue: Number(m.revenue ?? 0),
    profit:  Number(m.revenue ?? 0) * 0.3,
  }));

  const chartKey   = chartMode === "monthlyRevenue" ? "revenue" : "profit";
  const chartColor = chartMode === "monthlyRevenue" ? "#2563eb" : "#10b981";

  const totalRevenue = useMemo(() => {
    if (period === "thisMonth") return Number(finance?.summary?.totalRevenue ?? 0);
    return filteredMonthly.reduce((s, m) => s + Number(m.revenue ?? 0), 0);
  }, [finance, filteredMonthly, period]);

  const totalExpenses      = Number(finance?.summary?.totalExpenses ?? 0);
  const netProfit = useMemo(() => {
    if (period === "thisMonth") return Number(finance?.summary?.netProfit ?? 0);
    return Math.round(totalRevenue * 0.3);
  }, [finance, totalRevenue, period]);

  const payrollCurrentYear = Number(finance?.payrollSummary?.currentYear ?? 0);
  const payrollNext        = Number(finance?.payrollSummary?.nextPayroll  ?? 0);
  const periodLabel        = period === "today" ? t("today") : period === "thisWeek" ? t("thisWeek") : t("thisMonth");

  const statCards = [
    { label: `${t("totalRevenue")} — ${periodLabel}`, value: `$${totalRevenue.toLocaleString()}`, delta: finance?.summary?.totalRevenueChange ?? "0%", up: !String(finance?.summary?.totalRevenueChange ?? "").startsWith("-"), color: !String(finance?.summary?.totalRevenueChange ?? "").startsWith("-") ? "text-green-500" : "text-red-500", miniColor: "#22c55e" },
    { label: t("totalExpenses"), value: `$${totalExpenses.toLocaleString()}`, delta: "", up: false, color: "text-red-500", miniColor: "#ef4444" },
    { label: `${t("netProfit")} — ${periodLabel}`, value: `$${netProfit.toLocaleString()}`, delta: finance?.summary?.profitMargin ?? "", up: netProfit >= 0, color: netProfit >= 0 ? "text-green-500" : "text-red-500", miniColor: netProfit >= 0 ? "#22c55e" : "#ef4444" },
    { label: t("totalPayroll"), value: `$${payrollCurrentYear.toLocaleString()}`, delta: "", up: true, color: "text-green-500", miniColor: "#ef4444" },
  ];

  const expenseBreakdown = finance?.expenseBreakdown ?? [];
  const orderTypeData    = (finance?.revenueByType ?? []).map((item: any) => ({
    name: t(item.typeKey ?? item.type ?? "other"), value: Number(item.revenue ?? 0), amount: Number(item.revenue ?? 0),
  }));

  if (isLoading && !data) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="text-slate-400 text-sm animate-pulse">{t("loadingFinanceData")}</p>
    </div>
  );

  if (isError && !data) return (
    <div className="min-h-[40vh] flex items-center justify-center p-4">
      <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm max-w-md w-full text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-3">
          <AlertCircle className="text-red-500" size={22} />
        </div>
        <h2 className="font-bold text-slate-900 mb-1">{t("failedToLoadFinanceData")}</h2>
        <p className="text-sm text-slate-500 mb-4 break-words">{(error as any)?.message ?? t("unknownError")}</p>
        <button onClick={refetch} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
          <RefreshCw size={14} /> {t("retry")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t("financial")}</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{t("realTimePerformanceAcrossAllRestaurantBranches")}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["today", "thisWeek", "thisMonth"] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${period === p ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {t(p)}
            </button>
          ))}
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="px-3 py-2 rounded-xl text-xs border border-slate-200 text-slate-600 bg-white outline-none">
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="hidden sm:inline-flex text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 whitespace-nowrap">
            {from} → {to}
          </span>
          <button className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors">
            <Download size={13} /> {t("export")}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-sm">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">{card.label}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <p className="text-base sm:text-xl font-bold text-slate-900">{card.value}</p>
              {card.delta && <span className={`text-[10px] sm:text-xs font-semibold ${card.color}`}>{card.up ? "↑" : "↓"} {card.delta}</span>}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{t("vsLastMonth")}</p>
            <div className="mt-1 opacity-70"><Spark color={card.miniColor} /></div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">{t("revenueAndProfitTrends")}</h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{periodLabel} · {from} → {to}</p>
          </div>
          <div className="flex gap-2">
            {(["monthlyRevenue", "profitAnalysis"] as const).map(m => (
              <button key={m} onClick={() => setChartMode(m)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${chartMode === m ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                {t(m)}
              </button>
            ))}
          </div>
        </div>
        {chartData.length === 0 ? (
          <p className="text-xs text-slate-300 text-center py-12">{t("noRevenueDataForThisYear")}</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(Number(v)/1000).toFixed(0)}k`} width={45} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey={chartKey} stroke={chartColor} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: chartColor, stroke: "#fff", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Expense + Order type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base">{t("expenseBreakdown")}</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 mb-4">{t("operationalCostDistribution")}</p>
          {expenseBreakdown.length === 0 ? (
            <p className="text-xs text-slate-300 text-center py-8">{t("noExpenseData")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[260px]">
                <thead>
                  <tr className="text-[11px] sm:text-xs text-slate-400 border-b border-slate-100">
                    <th className="pb-2 text-left font-medium">{t("category")}</th>
                    <th className="pb-2 text-center font-medium">%</th>
                    <th className="pb-2 text-right font-medium">{t("value")}</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseBreakdown.map((row: any) => (
                    <tr key={row.category} className="border-b border-slate-50 last:border-0">
                      <td className="py-2 sm:py-2.5 text-xs sm:text-sm text-slate-700">{row.category}</td>
                      <td className="py-2 sm:py-2.5 text-center"><span className="text-[10px] sm:text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{row.percentage}%</span></td>
                      <td className="py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-900 text-right">${Number(row.amount ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base">{t("revenueByOrderType")}</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 mb-2">{t("channelPerformanceDistribution")}</p>
          {orderTypeData.length === 0 ? (
            <p className="text-xs text-slate-300 text-center py-12">{t("noData")}</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={orderTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270}>
                    {orderTypeData.map((entry: any, idx: number) => <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2 mt-2">
                {orderTypeData.map((item: any, idx: number) => (
                  <div key={item.name} className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="text-slate-600 capitalize">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">${Number(item.amount ?? 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payroll */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-base sm:text-lg">💰</span>
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">{t("payrollSummary")}</h2>
            <p className="text-[11px] sm:text-xs text-slate-400">{t("year")} : {year}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="border border-slate-100 rounded-xl p-2.5 sm:p-3">
            <p className="text-[10px] sm:text-xs text-slate-400">{t("totalPayroll")}</p>
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">${payrollCurrentYear.toLocaleString()}</p>
          </div>
          <div className="border border-slate-100 rounded-xl p-2.5 sm:p-3">
            <p className="text-[10px] sm:text-xs text-slate-400">{t("nextPayroll")}</p>
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">${payrollNext.toLocaleString()}</p>
          </div>
        </div>
      </div>

    </div>
  );
}