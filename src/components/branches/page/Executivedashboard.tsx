import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DollarSign, ShoppingBag, TrendingUp, Receipt, MapPin } from "lucide-react";
import { useExecutive, periodToRange, type Period } from "../../dashboard/hook/useAccounts";

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
}) => {
  const { t } = useTranslation();
  return (
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
          <p className="text-[10px] text-gray-400">{t("revenue")}</p>
          <p className="text-sm font-bold text-gray-800">${revenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400">{t("change")}</p>
          <p className={`text-sm font-bold ${change.startsWith("-") ? "text-red-500" : "text-green-500"}`}>
            {change}%
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400">{t("profit")}</p>
          <p className={`text-sm font-bold ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>
            ${profit.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Revenue by Branch ─────────────────────────────────────────────────────────
const RevenueByBranch = ({ branches }: { branches: { name: string; revenue: number; profit: number }[] }) => {
  const { t } = useTranslation();
  const maxRevenue = Math.max(...branches.map((b) => b.revenue), 1);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm h-full">
      <p className="font-bold text-gray-800 mb-1">{t("revenueByBranch")}</p>
      <p className="text-xs text-gray-400 mb-4">{t("topPerformingLocations")}</p>
      {branches.length === 0 ? (
        <p className="text-xs text-gray-300 text-center py-8">{t("noData")}</p>
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
  const { t } = useTranslation();

  // Period state — drives from/to automatically
  const [period, setPeriod] = useState<Period>("today");

  // Manual date overrides — only active when user edits directly
  const [manualFrom, setManualFrom] = useState("");
  const [manualTo,   setManualTo]   = useState("");

  // Resolve: manual dates win over period-derived dates
  const { from, to } = useMemo(() => {
    if (manualFrom && manualTo) return { from: manualFrom, to: manualTo };
    return periodToRange(period);
  }, [period, manualFrom, manualTo]);

  // Hook re-fetches automatically whenever from/to change
  const { data, isLoading } = useExecutive({ from, to });
  const e = data?.data;

  const stats = [
    {
      icon: DollarSign, label: t("totalRevenue"),
      value: `$${(e?.summary.totalRevenue.value ?? 0).toLocaleString()}`,
      badge: e?.summary.totalRevenue.change,
      color: "text-green-500", sparkColor: "#22c55e", sparkFill: greenFill,
    },
    {
      icon: ShoppingBag, label: t("totalOrders"),
      value: String(e?.summary.totalOrders.value ?? 0),
      badge: e?.summary.totalOrders.change,
      color: "text-green-500", sparkColor: "#22c55e", sparkFill: greenFill,
    },
    {
      icon: TrendingUp, label: t("netProfit"),
      value: `$${(e?.summary.netProfit ?? 0).toLocaleString()}`,
      color: (e?.summary.netProfit ?? 0) >= 0 ? "text-orange-400" : "text-red-500",
      sparkColor: "#fb923c", sparkFill: orangeFill,
    },
    {
      icon: Receipt, label: t("totalExpenses"),
      value: `$${(e?.summary.totalExpenses ?? 0).toLocaleString()}`,
      color: "text-red-400", sparkColor: "#f87171", sparkFill: redFill,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-400 text-sm animate-pulse">{t("loadingExecutiveData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t("dashboardOverview")}</h2>
          <p className="text-sm text-gray-400">
            {t("realTimePerformanceAcrossLocations", { count: e?.branchPerformance?.length ?? 0 })}
          </p>
          {/* Active range display */}
          <p className="text-xs text-gray-300 mt-0.5">{from} → {to}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Period shortcuts — auto-compute from/to and re-fetch */}
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
            {(["today", "thisWeek", "thisMonth"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p);
                  setManualFrom(""); // clear manual override
                  setManualTo("");
                }}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  period === p && !manualFrom
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t(p)}
              </button>
            ))}
          </div>

          {/* Manual date range — overrides period buttons */}
          <input
            type="date"
            value={manualFrom || from}
            onChange={(e) => setManualFrom(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-2 py-2 outline-none"
          />
          <input
            type="date"
            value={manualTo || to}
            onChange={(e) => setManualTo(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-2 py-2 outline-none"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Branch Performance */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{t("branchPerformance")}</h3>
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