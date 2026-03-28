// src/components/Inventory/page/StockDetailPage.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useInventoryItem } from "../hook/useInventory";

const DAY_LABELS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

function getStrokeColor(status: string) {
  if (status === "critical" || status === "low") return "#ef4444";
  if (status === "warning")                       return "#f97316";
  return "#22c55e";
}

function getStatusBadge(status: string, label: string, t: (key: string) => string) {
  if (status === "critical") return { text: label || t("critical"),         color: "bg-red-100 text-red-700"      };
  if (status === "low")      return { text: label || t("lowStock"),         color: "bg-red-100 text-red-700"      };
  if (status === "warning")  return { text: label || t("lowStockWarning"),  color: "bg-yellow-100 text-yellow-700" };
  return                            { text: label || t("inStock"),          color: "bg-green-100 text-green-700"  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap(raw: any) {
  if (!raw) return null;
  if (raw?.data && typeof raw.data === "object" && !Array.isArray(raw.data)) return raw.data;
  return raw;
}

export default function StockDetailPage() {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();

  const { data: raw, isLoading, isError, refetch } = useInventoryItem(id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d: any = unwrap(raw);

  const menuItem   = d?.item     ?? {};
  const branch     = d?.branch   ?? {};
  const stock      = d?.stock    ?? {};
  const supplier   = d?.supplier ?? {};
  const pricing    = d?.pricing  ?? {};
  const metadata   = d?.metadata ?? {};
  const usage      = d?.usage    ?? { last7Days: [], averageDaily: 0 };
  const deliveries: unknown[] = d?.deliveries ?? [];
  const expiryDate = d?.expiryDate ?? null;

  const itemName    = menuItem.name     ?? "Unknown Item";
  const category    = menuItem.category ?? "—";
  const current     = stock.current     ?? 0;
  const target      = stock.target      ?? 1;
  const unit        = stock.unit        ?? "unit";
  const percentage  = stock.percentage  ?? Math.min((current / target) * 100, 100);
  const status      = stock.status      ?? "good";
  const statusLabel = stock.statusLabel ?? "Good";

  const circumference = 2 * Math.PI * 48;
  const dashArray     = `${(percentage / 100) * circumference} ${circumference}`;
  const strokeColor   = getStrokeColor(status);
  const statusBadge   = getStatusBadge(status, statusLabel, t);

  const usageData: number[] = usage.last7Days?.length ? usage.last7Days : [0, 0, 0, 0, 0, 0, 0];
  const maxUsage = Math.max(...usageData, 1);

  const expiryDateObj   = expiryDate ? new Date(expiryDate) : null;
  const daysUntilExpiry = expiryDateObj
    ? Math.ceil((expiryDateObj.getTime() - Date.now()) / 86400000)
    : null;
  const isExpired      = daysUntilExpiry !== null && daysUntilExpiry <= 0;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 7;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="p-4 sm:p-6">

        {/* Breadcrumb */}
        <p className="text-xs text-slate-400 mb-2">
          <span
            className="cursor-pointer hover:text-blue-500 transition-colors"
            onClick={() => navigate("/dashboard/inventory")}
          >
            {t("inventoryPage")}
          </span>
          {" / "}
          <span className="text-slate-600">{itemName} {t("itemDetails")}</span>
        </p>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-400 my-10">
            <svg className="animate-spin w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {t("loadingItemDetails")}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="my-8 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center justify-between">
            <span>{t("failedToLoadItem")}</span>
            <button onClick={refetch} className="underline font-medium">{t("retry")}</button>
          </div>
        )}

        {!isLoading && !isError && d && (
          <>
            {/* Title row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{itemName}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadge.color}`}>
                    {statusBadge.text}
                  </span>
                  {category !== "—" && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-500 rounded-full capitalize">
                      {category}
                    </span>
                  )}
                  {isExpired && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                      {t("expired")}
                    </span>
                  )}
                  {isExpiringSoon && !isExpired && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-600 rounded-full">
                      {t("expiresIn")} {daysUntilExpiry}d
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard/inventory")}
                className="self-start sm:self-auto px-5 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                {t("backButton")}
              </button>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

              {/* ── Left col ── */}
              <div className="flex flex-col gap-4 sm:gap-5">

                {/* Current Stock */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-blue-500">📦</span>
                    <span className="font-semibold text-slate-700 text-sm">{t("stockDetailTitle")}</span>
                  </div>

                  {/* Donut */}
                  <div className="flex justify-center mb-4">
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="48" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                        <circle
                          cx="60" cy="60" r="48" fill="none"
                          stroke={strokeColor} strokeWidth="12"
                          strokeDasharray={dashArray} strokeLinecap="round"
                          style={{ transition: "stroke-dasharray 0.6s ease" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-800">{current}</span>
                        <span className="text-xs text-slate-400">{unit} / {target}{unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs mb-3">
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide mb-0.5">{t("unitType")}</p>
                      <p className="font-semibold text-slate-700 uppercase">{unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 uppercase tracking-wide mb-0.5">{t("reorderPoint")}</p>
                      <p className={`font-semibold ${stock.reorderPoint > 0 ? "text-yellow-500" : "text-slate-700"}`}>
                        {stock.reorderPoint > 0 ? `${stock.reorderPoint} ${unit} ⚠` : `${target} ${unit}`}
                      </p>
                    </div>
                  </div>

                  {/* Expiry */}
                  {expiryDate && (
                    <div className="pt-3 border-t border-slate-100 flex justify-between text-xs">
                      <span className="text-slate-400">{t("expiryDate")}</span>
                      <span className={`font-semibold ${isExpired ? "text-red-500" : isExpiringSoon ? "text-orange-500" : "text-slate-700"}`}>
                        {expiryDateObj!.toLocaleDateString()}
                        {isExpired && " ⚠"}
                        {isExpiringSoon && !isExpired && ` (${daysUntilExpiry}d)`}
                      </span>
                    </div>
                  )}

                  {/* Pricing */}
                  {pricing.lastPrice != null && (
                    <div className="mt-2 flex justify-between text-xs">
                      <span className="text-slate-400">{t("lastPrice")}</span>
                      <span className="font-semibold text-slate-700">${pricing.lastPrice} / {unit}</span>
                    </div>
                  )}
                  {pricing.lastOrderedAt && (
                    <div className="mt-2 flex justify-between text-xs">
                      <span className="text-slate-400">{t("lastOrdered")}</span>
                      <span className="font-semibold text-slate-700">
                        {new Date(pricing.lastOrderedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Primary Supplier */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-blue-500">🚚</span>
                    <span className="font-semibold text-slate-700 text-sm">{t("primarySupplier")}</span>
                  </div>
                  <p className="font-bold text-slate-800 text-sm mb-3">{supplier.name ?? "—"}</p>
                  <div className="space-y-2 text-xs">
                    {[
                      ["Contact",   supplier.contact  ],
                      ["Phone",     supplier.phone    ],
                      ["Email",     supplier.email    ],
                      ["Lead Time", supplier.leadTime ],
                      [t("lastPrice"), supplier.lastPrice],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label as string} className="flex justify-between gap-2">
                        <span className="text-slate-400 flex-shrink-0">{label as string}</span>
                        <span className="text-slate-700 font-medium text-right truncate max-w-[160px]">
                          {value as string}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5">
                    {t("contactSupplier")}
                  </button>
                </div>

                {/* Branch info */}
                {branch.name && (
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-blue-500">🏪</span>
                      <span className="font-semibold text-slate-700 text-sm">{t("branchLabel")}</span>
                    </div>
                    <p className="font-bold text-slate-800 text-sm">{branch.name}</p>
                    {branch.address && (
                      <p className="text-xs text-slate-400 mt-1">
                        {[branch.address.street, branch.address.city, branch.address.country]
                          .filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ── Right col ── */}
              <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5">

                {/* Usage Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-700 text-sm">{t("usageHistory")}</h3>
                    {usage.averageDaily > 0 && (
                      <span className="text-xs text-slate-400">
                        {t("avgDaily")}:{" "}
                        <span className="font-semibold text-slate-600">
                          {usage.averageDaily} {unit}/day
                        </span>
                      </span>
                    )}
                  </div>

                  {usageData.every((v) => v === 0) ? (
                    <div className="h-36 flex items-center justify-center text-sm text-slate-400">
                      {t("noUsageData")}
                    </div>
                  ) : (
                    <div className="flex items-end gap-2 sm:gap-3" style={{ height: "160px" }}>
                      {usageData.map((val, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
                          <span className="text-[9px] text-slate-400">{val > 0 ? val : ""}</span>
                          <div
                            className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors"
                            style={{ height: `${(val / maxUsage) * 130}px`, minHeight: val > 0 ? "4px" : "0" }}
                          />
                          <span className="text-[10px] sm:text-xs text-slate-400">{DAY_LABELS[i % 7]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Deliveries */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-blue-500">📋</span>
                    <span className="font-semibold text-slate-700 text-sm">{t("recentDeliveries")}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[420px]">
                      <thead>
                        <tr className="text-slate-400 uppercase tracking-wide border-b border-slate-100">
                          <th className="pb-2 text-left font-medium">{t("date")}</th>
                          <th className="pb-2 text-left font-medium">{t("invoice")}</th>
                          <th className="pb-2 text-left font-medium">{t("supplier")}</th>
                          <th className="pb-2 text-left font-medium">{t("qty")}</th>
                          <th className="pb-2 text-left font-medium">{t("status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveries.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">
                              {t("noDeliveryHistory")}
                            </td>
                          </tr>
                        ) : (
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          deliveries.map((del: any, i) => (
                            <tr key={i} className="border-b border-slate-50">
                              <td className="py-2.5 text-slate-600 whitespace-nowrap">
                                {del.date ? new Date(del.date).toLocaleDateString() : "—"}
                              </td>
                              <td className="py-2.5 text-slate-600">{del.invoice ?? "—"}</td>
                              <td className="py-2.5 text-slate-600 whitespace-nowrap">
                                {typeof del.supplier === "object" ? del.supplier?.name ?? "—" : del.supplier ?? "—"}
                              </td>
                              <td className="py-2.5 text-slate-600">+{del.quantity} {unit}</td>
                              <td className="py-2.5">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-semibold whitespace-nowrap">
                                  {del.status ?? "Received"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    {t("recordInfo")}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      [t("createdBy"), metadata.createdBy ? `${metadata.createdBy.name} (#${metadata.createdBy.jobId})` : "—"],
                      [t("updatedBy"), metadata.updatedBy ? `${metadata.updatedBy.name} (#${metadata.updatedBy.jobId})` : "—"],
                      [t("createdAt"), metadata.createdAt ? new Date(metadata.createdAt).toLocaleDateString() : "—"],
                      [t("updatedAt"), metadata.updatedAt ? new Date(metadata.updatedAt).toLocaleDateString() : "—"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-slate-400 mb-0.5">{label}</p>
                        <p className="font-medium text-slate-700">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}