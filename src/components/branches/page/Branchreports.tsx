import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Receipt,
  Download,
  MapPin,
} from "lucide-react";
import { useReports, periodToRange, type Period } from "../../dashboard/hook/useAccounts";
/* eslint-disable @typescript-eslint/no-explicit-any */

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
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ── Revenue Bar Chart ─────────────────────────────────────────────────────────
const RevenueBarChart = ({
  revenuePerMonth,
}: {
  revenuePerMonth: { month: number; revenue: number; percentage: number }[];
}) => {
  const { t } = useTranslation();
  const maxRevenue = Math.max(...revenuePerMonth.map((m) => m.revenue), 1);
  const MONTH_NAMES = [
    t("jan"),
    t("feb"),
    t("mar"),
    t("apr"),
    t("may"),
    t("jun"),
    t("jul"),
    t("aug"),
    t("sep"),
    t("oct"),
    t("nov"),
    t("dec"),
  ];

  if (revenuePerMonth.length === 0)
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
        <p className="font-bold text-gray-800 mb-4">{t("revenuePerMonth")}</p>
        <p className="text-xs text-gray-300 text-center py-12">{t("noData")}</p>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-4">{t("revenuePerMonth")}</p>
      <div className="flex items-end gap-1.5 h-40">
        {revenuePerMonth.map((m, i) => {
          const pct = Math.round((m.revenue / maxRevenue) * 100);
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-full rounded-t-md transition-all ${
                  m.revenue === maxRevenue ? "bg-rose-400" : "bg-rose-200"
                }`}
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
const DonutChart = ({
  categoryPerformance,
}: {
  categoryPerformance: { category: string; orders: number; revenue: number }[];
}) => {
  const { t } = useTranslation();
  const total = categoryPerformance.reduce((s, c) => s + c.orders, 0);
  const COLORS = ["#3b82f6", "#8b5cf6", "#f97316", "#22c55e", "#f43f5e"];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-4">{t("salesByCategory")}</p>
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
                    <circle
                      key={c.category}
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke={COLORS[i % COLORS.length]}
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
            <p className="text-[10px] text-gray-400">{t("orders.title")}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
        {categoryPerformance.map((c, i) => (
          <div key={c.category} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-gray-500 capitalize">{c.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Top Dishes ────────────────────────────────────────────────────────────────
const TopDishes = ({
  dishes,
}: {
  dishes: { name: string; orders: number; revenue: number; category: string }[];
}) => {
  const { t } = useTranslation();
  const emojis: Record<string, string> = {
    mains: "🍖",
    starters: "🥗",
    desserts: "🍰",
    drinks: "🥤",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-4">{t("topSellingDishes")}</p>
      <div className="grid grid-cols-3 text-xs font-semibold text-gray-400 mb-3 pb-2 border-b border-gray-50">
        <span className="text-blue-500">{t("dishName")}</span>
        <span className="text-center">{t("orders.title")}</span>
        <span className="text-right text-red-400">{t("revenue")}</span>
      </div>
      {dishes.length === 0 ? (
        <p className="text-xs text-gray-300 text-center py-6">{t("noDishesYet")}</p>
      ) : (
        <div className="space-y-3">
          {dishes.map((d, i) => (
            <div key={i} className="grid grid-cols-3 items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">{emojis[d.category?.toLowerCase()] ?? "🍽️"}</span>
                <span className="text-gray-700 font-medium text-xs sm:text-sm truncate">
                  {d.name}
                </span>
              </div>
              <span className="text-center text-gray-500 text-xs">{d.orders}</span>
              <span className="text-right text-green-500 font-semibold text-xs">
                ${d.revenue}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Order Status ──────────────────────────────────────────────────────────────
const OrderStatus = ({
  breakdown,
}: {
  breakdown: { completed: number; pending: number; cancelled: number };
}) => {
  const { t } = useTranslation();
  const total = breakdown.completed + breakdown.pending + breakdown.cancelled || 1;
  const completedPct = Math.round((breakdown.completed / total) * 239);
  const pendingPct = Math.round((breakdown.pending / total) * 239);
  const cancelledPct = Math.round((breakdown.cancelled / total) * 239);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-4">{t("orderStatusBreakdown")}</p>
      <div className="flex justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="14"
              strokeDasharray={`${completedPct} 239`}
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#fb923c"
              strokeWidth="14"
              strokeDasharray={`${pendingPct} 239`}
              strokeDashoffset={`-${completedPct}`}
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#ef4444"
              strokeWidth="14"
              strokeDasharray={`${cancelledPct} 239`}
              strokeDashoffset={`-${completedPct + pendingPct}`}
            />
          </svg>
        </div>
      </div>
      <div className="flex justify-around text-center">
        {[
          { labelKey: "completed", value: breakdown.completed, color: "text-blue-500" },
          { labelKey: "pending", value: breakdown.pending, color: "text-orange-400" },
          { labelKey: "cancelled", value: breakdown.cancelled, color: "text-red-500" },
        ].map((s) => (
          <div key={s.labelKey}>
            <div className={`flex items-center gap-1 text-xs mb-1 justify-center ${s.color}`}>
              <div className="w-2 h-2 rounded-full bg-current" />
              {t(s.labelKey)}
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Kitchen Performance ───────────────────────────────────────────────────────
const KitchenPerf = ({
  performance,
}: {
  performance: { breakfast: string; lunch: string; dinner: string };
}) => {
  const { t } = useTranslation();
  const parsePct = (v: string) => {
    if (!v || v === "N/A") return 0;
    const n = parseFloat(v);
    return isNaN(n) ? 0 : Math.min((n / 60) * 100, 100);
  };
  const items = [
    {
      labelKey: "breakfast",
      val: performance.breakfast,
      color: "bg-purple-500",
      pct: parsePct(performance.breakfast),
    },
    {
      labelKey: "lunch",
      val: performance.lunch,
      color: "bg-red-400",
      pct: parsePct(performance.lunch),
    },
    {
      labelKey: "dinner",
      val: performance.dinner,
      color: "bg-blue-400",
      pct: parsePct(performance.dinner),
    },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-1">{t("kitchenPerformance")}</p>
      <p className="text-xs text-gray-400 mb-4">{t("averagePreparationTimeMinutes")}</p>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.labelKey}>
            <div className="h-2 bg-gray-100 rounded-full mb-1.5">
              <div
                className={`h-full ${item.color} rounded-full`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t(item.labelKey)}</span>
              <span>{item.val === "N/A" ? "N/A" : `${item.val} min`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Low Stock Alert ───────────────────────────────────────────────────────────
const LowStockAlert = ({
  lowStock,
}: {
  lowStock: { name: string; current: number; target: number }[];
}) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <p className="font-bold text-gray-800 mb-4">{t("lowStockAlert")}</p>
      <div className="grid grid-cols-3 text-xs text-gray-400 font-semibold mb-2 pb-2 border-b border-gray-50">
        <span>{t("item")}</span>
        <span className="text-center">{t("current")}</span>
        <span className="text-right">{t("status")}</span>
      </div>
      {lowStock.length === 0 ? (
        <p className="text-xs text-gray-300 text-center py-6">{t("allStockOk")}</p>
      ) : (
        <div className="space-y-2.5">
          {lowStock.map((item, i) => {
            const isCritical = item.current <= item.target * 0.5;
            return (
              <div key={i} className="grid grid-cols-3 items-center text-sm">
                <span className="text-gray-700">{item.name}</span>
                <span className="text-center text-gray-500 text-xs">{item.current}</span>
                <span className="text-right">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isCritical
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {isCritical ? t("critical") : t("low")}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BranchReports() {
  const { t } = useTranslation();

  const [period, setPeriod] = useState<Period>("thisMonth");
  const [manualFrom, setManualFrom] = useState<string>("");
  const [manualTo, setManualTo] = useState<string>("");

  const { from, to } = useMemo(() => {
    if (manualFrom && manualTo) return { from: manualFrom, to: manualTo };
    return periodToRange(period);
  }, [period, manualFrom, manualTo]);

  const { data, isLoading, resolvedRange } = useReports({ from, to });
  const r = data?.data;

  const sparkGreen =
    "M0,28 C15,26 25,20 35,22 C45,24 55,18 65,15 C75,12 85,20 95,18 C105,16 115,22 120,20 L120,40 L0,40 Z";
  const sparkOrange =
    "M0,25 C15,27 25,22 35,24 C45,26 55,20 65,22 C75,24 85,18 95,20 C105,22 115,18 120,22 L120,40 L0,40 Z";
  const sparkRed =
    "M0,22 C15,24 25,28 35,25 C45,22 55,26 65,23 C75,20 85,24 95,22 C105,20 115,24 120,22 L120,40 L0,40 Z";

  const stats = [
    {
      icon: DollarSign,
      label: t("totalRevenue"),
      value: `$${(r?.summary.totalRevenue ?? 0).toLocaleString()}`,
      badge: r?.summary.revenueChange,
      color: "text-green-500",
      sparkColor: "#22c55e",
      sparkFill: sparkGreen,
    },
    {
      icon: ShoppingBag,
      label: t("totalOrders"),
      value: String(r?.summary.totalOrders ?? 0),
      color: "text-green-500",
      sparkColor: "#22c55e",
      sparkFill: sparkGreen,
    },
    {
      icon: TrendingUp,
      label: t("netProfit"),
      value: `$${(r?.summary.netProfit ?? 0).toLocaleString()}`,
      color: "text-orange-400",
      sparkColor: "#fb923c",
      sparkFill: sparkOrange,
    },
    {
      icon: Receipt,
      label: t("thisWeek"),
      value: `$${(r?.summary.thisWeek ?? 0).toLocaleString()}`,
      color: "text-red-400",
      sparkColor: "#f87171",
      sparkFill: sparkRed,
    },
  ];

  const handlePrint = () => {
    window.requestAnimationFrame(() => {
      window.print();
    });
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-400 text-sm animate-pulse">{t("loadingReports")}</p>
      </div>
    );

  return (
    <>
      <style>{`
        @media screen {
          .print-only {
            display: none !important;
          }
        }

        @media print {
          header,
          nav,
          .topbar,
          .site-topbar,
          .app-topbar,
          [data-topbar],
          [data-app-topbar] {
            display: none !important;
          }

          .screen-only {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          @page {
            size: auto;
            margin: 12mm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print-page-break {
            break-before: page;
            page-break-before: always;
          }
        }
      `}</style>

      <div className="screen-only space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t("reports")} — {r?.branchInfo?.name ?? t("allBranches")}
            </h2>
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin size={12} /> {resolvedRange?.from ?? from} → {resolvedRange?.to ?? to}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
              {(["today", "thisWeek", "thisMonth"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    setManualFrom("");
                    setManualTo("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    period === p && !manualFrom
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {t(p)}
                </button>
              ))}
            </div>

            <input
              type="date"
              value={manualFrom || from}
              onChange={(e) => {
                setManualFrom(e.target.value);
              }}
              className="text-xs border border-gray-200 rounded-xl px-2 py-2 outline-none"
            />
            <input
              type="date"
              value={manualTo || to}
              onChange={(e) => {
                setManualTo(e.target.value);
              }}
              className="text-xs border border-gray-200 rounded-xl px-2 py-2 outline-none"
            />

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Download size={14} /> {t("export")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <s.icon size={16} className={s.color} />
                {s.label}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RevenueBarChart revenuePerMonth={r?.revenuePerMonth ?? []} />
          <DonutChart categoryPerformance={r?.categoryPerformance ?? []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <TopDishes dishes={r?.topSellingDishes ?? []} />
            <KitchenPerf
              performance={
                r?.kitchenPerformance ?? {
                  breakfast: "N/A",
                  lunch: "N/A",
                  dinner: "N/A",
                }
              }
            />
          </div>
          <div className="space-y-4">
            <OrderStatus
              breakdown={
                r?.orderStatusBreakdown ?? {
                  completed: 0,
                  pending: 0,
                  cancelled: 0,
                }
              }
            />
            <LowStockAlert lowStock={r?.inventorySummary?.lowStock ?? []} />
          </div>
        </div>
      </div>

      <div className="print-only bg-white text-gray-900 p-6 sm:p-8">
        <div className="print-section grid grid-cols-2 gap-3 mb-5">
          {stats.map((s) => (
            <div key={s.label} className="border border-gray-200 rounded-xl p-3">
              <p className="text-[11px] text-gray-500">{s.label}</p>
              <div className="flex items-end justify-between gap-2 mt-1">
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                {s.badge ? (
                  <span className="text-[11px] font-semibold text-emerald-600">
                    {s.badge}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="print-section border border-gray-200 rounded-xl p-4 mb-5">
          <h2 className="font-bold text-gray-900 text-sm mb-3">
            {t("revenuePerMonth")}
          </h2>
          {r?.revenuePerMonth?.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-2 text-left font-medium">{t("month") ?? "Month"}</th>
                  <th className="py-2 text-right font-medium">{t("revenue") ?? "Revenue"}</th>
                </tr>
              </thead>
              <tbody>
                {r.revenuePerMonth.map((row: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 text-gray-700">
                      {[
                        t("jan"),
                        t("feb"),
                        t("mar"),
                        t("apr"),
                        t("may"),
                        t("jun"),
                        t("jul"),
                        t("aug"),
                        t("sep"),
                        t("oct"),
                        t("nov"),
                        t("dec"),
                      ][row.month - 1] ?? row.month}
                    </td>
                    <td className="py-2 text-right font-medium">
                      ${Number(row.revenue ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-gray-500">{t("noData")}</p>
          )}
        </div>

        <div className="print-section grid grid-cols-2 gap-5 mb-5">
          <div className="border border-gray-200 rounded-xl p-4">
            <h2 className="font-bold text-gray-900 text-sm mb-3">
              {t("salesByCategory")}
            </h2>
            {r?.categoryPerformance?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2 text-left font-medium">{t("category")}</th>
                    <th className="py-2 text-right font-medium">{t("orders.title")}</th>
                    <th className="py-2 text-right font-medium">{t("revenue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.categoryPerformance.map((row: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 text-gray-700 capitalize">{row.category}</td>
                      <td className="py-2 text-right font-medium">{row.orders}</td>
                      <td className="py-2 text-right font-medium">
                        ${Number(row.revenue ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-gray-500">{t("noData")}</p>
            )}
          </div>

          <div className="border border-gray-200 rounded-xl p-4">
            <h2 className="font-bold text-gray-900 text-sm mb-3">
              {t("orderStatusBreakdown")}
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-2 text-left font-medium">{t("status")}</th>
                  <th className="py-2 text-right font-medium">{t("orders.title")}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { labelKey: "completed", value: r?.orderStatusBreakdown?.completed ?? 0 },
                  { labelKey: "pending", value: r?.orderStatusBreakdown?.pending ?? 0 },
                  { labelKey: "cancelled", value: r?.orderStatusBreakdown?.cancelled ?? 0 },
                ].map((row) => (
                  <tr key={row.labelKey} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 text-gray-700">{t(row.labelKey)}</td>
                    <td className="py-2 text-right font-medium">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="print-section grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="border border-gray-200 rounded-xl p-4">
            <h2 className="font-bold text-gray-900 text-sm mb-3">
              {t("topSellingDishes")}
            </h2>
            {r?.topSellingDishes?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2 text-left font-medium">{t("dishName")}</th>
                    <th className="py-2 text-right font-medium">{t("orders.title")}</th>
                    <th className="py-2 text-right font-medium">{t("revenue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.topSellingDishes.map((row: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 text-gray-700">{row.name}</td>
                      <td className="py-2 text-right font-medium">{row.orders}</td>
                      <td className="py-2 text-right font-medium">
                        ${Number(row.revenue ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-gray-500">{t("noDishesYet")}</p>
            )}
          </div>

          <div className="border border-gray-200 rounded-xl p-4">
            <h2 className="font-bold text-gray-900 text-sm mb-3">
              {t("lowStockAlert")}
            </h2>
            {r?.inventorySummary?.lowStock?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2 text-left font-medium">{t("item")}</th>
                    <th className="py-2 text-right font-medium">{t("current")}</th>
                    <th className="py-2 text-right font-medium">{t("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.inventorySummary.lowStock.map((row: any, idx: number) => {
                    const isCritical = row.current <= row.target * 0.5;
                    return (
                      <tr key={idx} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 text-gray-700">{row.name}</td>
                        <td className="py-2 text-right font-medium">{row.current}</td>
                        <td className="py-2 text-right font-medium">
                          {isCritical ? t("critical") : t("low")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-gray-500">{t("allStockOk")}</p>
            )}
          </div>
        </div>

        <div className="print-section border border-gray-200 rounded-xl p-4">
          <h2 className="font-bold text-gray-900 text-sm mb-3">
            {t("kitchenPerformance")}
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 text-left font-medium">{t("meal") ?? "Meal"}</th>
                <th className="py-2 text-right font-medium">
                  {t("averagePreparationTimeMinutes")}
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  labelKey: "breakfast",
                  value: r?.kitchenPerformance?.breakfast ?? "N/A",
                },
                { labelKey: "lunch", value: r?.kitchenPerformance?.lunch ?? "N/A" },
                { labelKey: "dinner", value: r?.kitchenPerformance?.dinner ?? "N/A" },
              ].map((row) => (
                <tr key={row.labelKey} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 text-gray-700">{t(row.labelKey)}</td>
                  <td className="py-2 text-right font-medium">
                    {row.value === "N/A" ? "N/A" : `${row.value} min`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}