// src/components/Orders/OrdersManagement.tsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useOrders, cancelOrderFn, updateOrderStatusFn } from "../hook/useOrders";
import { useDrivers } from "../../DeliveryandDispatch/hooks/useDrivers";
import { createDispatchFn } from "../../DeliveryandDispatch/hooks/useDispatches";
import { invalidateQuery } from "../../../hook/queryClient";
import type { Order } from "../services/orderService";
import type { Driver } from "../../DeliveryandDispatch/services/driverService";
import type { CreateDispatchDTO } from "../../DeliveryandDispatch/services/dispatchService";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Helpers ──────────────────────────────────────────────────────────────────

const typeBadge: Record<string, string> = {
  "dine-in": "bg-purple-100 text-purple-700",
  takeaway: "bg-green-100 text-green-700",
  delivery: "bg-blue-100 text-blue-700",
};
const statusColor: Record<string, string> = {
  completed: "text-green-500",
  cancelled: "text-red-500",
  ready: "text-blue-500",
};

function timeAgo(dateStr?: string, t?: (key: string, options?: any) => string) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 60000;
  if (diff < 1) return t ? t("common.justNow") : "just now";
  if (diff < 60)
    return t ? t("common.minutesAgo", { count: Math.floor(diff) }) : `${Math.floor(diff)}m ago`;
  return t ? t("common.hoursAgo", { count: Math.floor(diff / 60) }) : `${Math.floor(diff / 60)}h ago`;
}

// ─── Filter types ─────────────────────────────────────────────────────────────

type FilterTab = "All Orders" | "dine-in" | "takeaway" | "delivery";
const FILTERS: FilterTab[] = ["All Orders", "dine-in", "takeaway", "delivery"];

// ─── Assign Driver Validation ─────────────────────────────────────────────────

interface AssignDriverErrors {
  driverId?: string;
  deliveryFee?: string;
  commission?: string;
  address?: string;
  phone?: string;
}

function validateAssign(
  driverId: string,
  deliveryFee: string,
  commission: string,
  address: string,
  phone: string,
  t: (key: string, options?: any) => string
): AssignDriverErrors {
  const e: AssignDriverErrors = {};
  if (!driverId) e.driverId = t("orders.management.assignDriver.validation.driverRequired");
  if (!deliveryFee || isNaN(Number(deliveryFee)))
    e.deliveryFee = t("orders.management.assignDriver.validation.validDeliveryFee");
  else if (Number(deliveryFee) < 0)
    e.deliveryFee = t("orders.management.assignDriver.validation.nonNegativeFee");
  if (commission && isNaN(Number(commission)))
    e.commission = t("orders.management.assignDriver.validation.validCommission");
  if (!address.trim()) e.address = t("orders.management.assignDriver.validation.addressRequired");
  else if (address.trim().length < 5)
    e.address = t("orders.management.assignDriver.validation.addressTooShort");
  if (!phone.trim()) e.phone = t("orders.management.assignDriver.validation.phoneRequired");
  else if (!/^[0-9+\-\s()]{7,15}$/.test(phone.trim()))
    e.phone = t("orders.management.assignDriver.validation.validPhone");
  return e;
}

// ─── Assign Driver Modal ───────────────────────────────────────────────────────

function AssignDriverModal({
  order,
  drivers,
  onClose,
}: {
  order: Order;
  drivers: Driver[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [driverId, setDriverId] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("25");
  const [commission, setCommission] = useState("5");
  const [address, setAddress] = useState(
    (order as any).customerLocation?.address ?? (order as any).deliveryAddress ?? ""
  );
  const [phone, setPhone] = useState((order as any).customer?.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<AssignDriverErrors>({});

  const orderId = (order.id ?? order._id ?? "") as string;
  const orderNumber = (order as any).orderNumber ?? orderId.slice(-6);
  const availableDrivers = drivers.filter((d) => d.status === "present" || d.status === "busy");

  const handleAssign = async () => {
    const errs = validateAssign(driverId, deliveryFee, commission, address, phone, t);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      await createDispatchFn({
        orderId,
        driverId,
        deliveryFee: Number(deliveryFee),
        commission: Number(commission) || 0,
        cashCollected: (order as any).total ?? 0,
        customerLocation: { address: address.trim(), coordinates: [31.2357, 30.0444] },
      } as CreateDispatchDTO);

      invalidateQuery("dispatches");
      invalidateQuery("orders");
      onClose();
    } catch (err: any) {
      const data = err?.response?.data ?? err?.data ?? err;
      setApiError(
        Array.isArray(data?.errors)
          ? data.errors.map((e: any) => e.msg).join(" · ")
          : data?.message ?? err?.message ?? t("orders.management.assignDriver.failedToAssign")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-500 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                🛵
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {t("orders.management.assignDriver.title")}
                </h2>
                <p className="text-blue-100 text-sm">
                  {t("orders.management.assignDriver.orderNumber", { number: orderNumber })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition text-sm"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
              💰 {(order as any).total != null ? `$${(order as any).total?.toFixed(2)}` : "—"}
            </span>
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
              📦 {(order.items ?? []).length} {t("orders.management.assignDriver.items")}
            </span>
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
              🕐 {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
              <span className="text-red-500 shrink-0">⚠</span>
              <p className="text-sm text-red-600 flex-1">{apiError}</p>
              <button onClick={() => setApiError(null)} className="text-red-300 hover:text-red-500 shrink-0">
                ✕
              </button>
            </div>
          )}

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("orders.management.assignDriver.deliveryAddress")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={t("orders.management.assignDriver.deliveryAddressPlaceholder")}
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setErrors((p) => ({ ...p, address: undefined }));
              }}
              className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:bg-white transition ${
                errors.address ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
              }`}
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("orders.management.assignDriver.customerPhone")} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder={t("orders.management.assignDriver.customerPhonePlaceholder")}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors((p) => ({ ...p, phone: undefined }));
              }}
              className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:bg-white transition ${
                errors.phone ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Driver picker - combo box */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("orders.management.assignDriver.selectDriver")} <span className="text-red-500">*</span>
            </label>

            {availableDrivers.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                <span>⚠️</span> {t("orders.management.assignDriver.noAvailableDrivers")}
              </div>
            ) : (
              <select
                value={driverId}
                onChange={(e) => {
                  setDriverId(e.target.value);
                  setErrors((p) => ({ ...p, driverId: undefined }));
                }}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:bg-white transition ${
                  errors.driverId ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
                }`}
              >
                <option value="">{t("orders.management.assignDriver.selectDriverPlaceholder")}</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id ?? ""}>
                    {d.name}
                    {d.vehiclePlate ? ` · ${d.vehiclePlate}` : ""}
                    {d.status ? ` · ${d.status}` : ""}
                  </option>
                ))}
              </select>
            )}

            {errors.driverId && <p className="text-xs text-red-500 mt-1">{errors.driverId}</p>}
          </div>

          {/* Fee + Commission */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("orders.management.assignDriver.deliveryFee")}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={deliveryFee}
                  onChange={(e) => {
                    setDeliveryFee(e.target.value);
                    setErrors((p) => ({ ...p, deliveryFee: undefined }));
                  }}
                  className={`w-full bg-gray-50 border rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:bg-white transition ${
                    errors.deliveryFee ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.deliveryFee && <p className="text-xs text-red-500 mt-1">{errors.deliveryFee}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("orders.management.assignDriver.commission")}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={commission}
                  onChange={(e) => {
                    setCommission(e.target.value);
                    setErrors((p) => ({ ...p, commission: undefined }));
                  }}
                  className={`w-full bg-gray-50 border rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:bg-white transition ${
                    errors.commission ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.commission && <p className="text-xs text-red-500 mt-1">{errors.commission}</p>}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || availableDrivers.length === 0}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <span>🛵</span>
            )}
            {loading ? t("orders.management.assignDriver.assigning") : t("orders.management.assignDriver.assignDriver")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrdersManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All Orders");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    setPage(1);
  }, [activeFilter, search]);

  const { data, isLoading, isError, refetch } = useOrders({
    orderType: activeFilter === "All Orders" ? undefined : activeFilter,
    keyword: search || undefined,
    limit: PAGE_SIZE,
    page,
  });

  const { data: driversData } = useDrivers({ sort: "-createdAt", limit: 20 });
  const drivers: Driver[] = driversData?.data ?? [];

  const orders: Order[] = data?.data ?? [];

  const pagination =
    (data as any)?.paginationResult ??
    (data as any)?.pagination ??
    (data as any)?.meta ??
    {};

  const totalDocs: number =
    pagination?.totalDocs ??
    pagination?.total ??
    (data as any)?.results ??
    0;

  const totalPages: number =
    pagination?.totalPages ??
    pagination?.pages ??
    (totalDocs > 0 ? Math.ceil(totalDocs / PAGE_SIZE) : 1);

  const currentPage: number = pagination?.currentPage ?? pagination?.page ?? page;

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const filterLabel = (f: FilterTab) => {
    const key =
      f === "All Orders"
        ? "allOrders"
        : f === "dine-in"
          ? "dineIn"
          : f === "takeaway"
            ? "takeaway"
            : "delivery";
    return t(`orders.management.filters.${key}`);
  };

  const filterEmoji = (f: FilterTab) => {
    if (f === "delivery") return "🛵 ";
    if (f === "takeaway") return "🥡 ";
    if (f === "dine-in") return "🍽 ";
    return "";
  };

  const orderTypeLabel = (type?: string) => {
    const key =
      type === "dine-in" ? "dineIn" : type === "takeaway" ? "takeAway" : "delivery";
    return t(`orders.management.types.${key}`);
  };

  const isDeliveryOrder = (order: Order) => {
    return String(order.orderType ?? "").toLowerCase() === "delivery";
  };

  const handleCancel = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm(t("orders.management.confirmCancelOrder"))) return;
      setCancellingId(id);
      try {
        await cancelOrderFn(id);
        invalidateQuery("orders");
        if (selectedOrder?.id === id || selectedOrder?._id === id) setSelectedOrder(null);
      } catch (err) {
        console.error(err);
        alert(t("orders.management.failedToCancelOrder"));
      } finally {
        setCancellingId(null);
      }
    },
    [selectedOrder, t]
  );

  // Mark as Ready
  // - delivery: open assign driver modal
  // - dine-in / takeaway: just update status, no modal
  const handleMarkReady = useCallback(
    async (order: Order) => {
      const id = (order.id ?? order._id ?? "") as string;
      setMarkingId(id);
      try {
        await updateOrderStatusFn(id, { status: "ready" });
        invalidateQuery("orders");

        if (isDeliveryOrder(order)) {
          setAssigningOrder(order);
        } else {
          setAssigningOrder(null);
        }

        setSelectedOrder(null);
      } catch (err) {
        console.error(err);
        alert(t("orders.management.failedToUpdateStatus"));
      } finally {
        setMarkingId(null);
      }
    },
    [t]
  );

  const orderId = (o: Order) => (o.id ?? o._id ?? "") as string;
  const canCancel = (o: Order) => !["cancelled", "completed"].includes((o.status ?? "").toLowerCase());
  const canMarkReady = (o: Order) => !["ready", "completed", "cancelled"].includes((o.status ?? "").toLowerCase());

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans relative">
      {assigningOrder && (
        <AssignDriverModal
          order={assigningOrder}
          drivers={drivers}
          onClose={() => setAssigningOrder(null)}
        />
      )}

      <main className="flex-1 p-4 sm:p-6 min-w-0">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-5 flex-wrap">
            <div className="relative w-full sm:flex-1 sm:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={t("orders.management.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    activeFilter === f
                      ? f === "delivery"
                        ? "bg-blue-600 text-white ring-2 ring-blue-300"
                        : "bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filterEmoji(f)}
                  {filterLabel(f)}
                </button>
              ))}
            </div>

            <button
              onClick={() => navigate("/dashboard/orders/create")}
              className="w-full sm:w-auto sm:ml-auto px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              + {t("orders.management.createOrder")}
            </button>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-16 text-slate-400 text-sm gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              {t("orders.management.loadingOrders")}
            </div>
          )}

          {isError && (
            <div className="text-center py-16">
              <p className="text-red-500 text-sm mb-3">{t("orders.management.failedToLoadOrders")}</p>
              <button
                onClick={refetch}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm hover:bg-slate-200"
              >
                {t("common.retry")}
              </button>
            </div>
          )}

          {!isLoading && !isError && orders.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-sm">
              {activeFilter === "delivery"
                ? t("orders.management.noDeliveryOrdersFound")
                : t("orders.management.noOrdersFound")}
            </div>
          )}

          {!isLoading && !isError && orders.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {orders.map((order) => {
                  const id = orderId(order);
                  const status = (order.status ?? "").toLowerCase();
                  const type = (order.orderType ?? "").toLowerCase();

                  return (
                    <div
                      key={id}
                      onClick={() => setSelectedOrder(order)}
                      className={`rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                        orderId(selectedOrder ?? ({} as Order)) === id
                          ? "border-blue-500 bg-blue-50/30"
                          : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">
                            {t("orders.management.orderNumber", {
                              orderNumber: order.orderNumber ?? `ORD-${order.orderId ?? id.slice(-4)}`,
                            })}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-slate-500">
                              {type === "delivery"
                                ? `📍 ${
                                    (order as any).deliveryAddress ??
                                    (order as any).customerLocation?.address ??
                                    t("orders.management.delivery")
                                  }`
                                : `🍴 ${
                                    order.tableNumber
                                      ? t("orders.management.tableNumber", { tableNumber: order.tableNumber })
                                      : "—"
                                  }`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">{timeAgo(order.createdAt, t)}</span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              typeBadge[type] ?? "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {orderTypeLabel(order.orderType)}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 my-2" />

                      <div className="space-y-0.5">
                        {(order.items ?? []).slice(0, 3).map((item, i) => (
                          <p key={i} className="text-sm text-slate-700">
                            {item.quantity}x {(item as any).name ?? item.itemId}
                          </p>
                        ))}
                        {(order.items?.length ?? 0) > 3 && (
                          <p className="text-xs text-slate-400">
                            +{(order.items?.length ?? 0) - 3} {t("orders.management.more")}
                          </p>
                        )}
                        {order.notes && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            ⚠ {order.notes}
                          </p>
                        )}
                      </div>

                      {statusColor[status] ? (
                        <p className={`font-bold text-sm mt-2 capitalize ${statusColor[status]}`}>
                          {order.status}
                        </p>
                      ) : (
                        <div className="mt-3">
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full" />
                          </div>
                        </div>
                      )}

                      {canCancel(order) && (
                        <button
                          onClick={(e) => handleCancel(id, e)}
                          disabled={cancellingId === id}
                          className="mt-3 text-xs text-red-400 hover:text-red-600 font-medium disabled:opacity-50 transition-colors"
                        >
                          {cancellingId === id
                            ? t("orders.management.cancelling")
                            : t("orders.management.cancelOrder")}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 flex-wrap border-t border-slate-100 pt-4">
                <p className="text-xs sm:text-sm text-slate-400">
                  {totalDocs > 0
                    ? t("orders.management.pageInfo", {
                        from: (currentPage - 1) * PAGE_SIZE + 1,
                        to: Math.min(currentPage * PAGE_SIZE, totalDocs),
                        total: totalDocs,
                      })
                    : t("orders.management.pageOnly", { page: currentPage })}
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!canGoPrev || isLoading}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {t("common.prev", "Prev")}
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "…" ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-sm select-none">
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item as number)}
                          disabled={isLoading}
                          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                            item === currentPage
                              ? "bg-blue-500 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!canGoNext || isLoading}
                    className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {t("common.next", "Next")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {selectedOrder &&
        (() => {
          const id = orderId(selectedOrder);
          const total = (selectedOrder as any).total ?? 0;
          const sub = (selectedOrder as any).subtotal ?? 0;
          const tax = (selectedOrder as any).tax ?? 0;
          const type = (selectedOrder.orderType ?? "").toLowerCase();

          return (
            <>
              <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedOrder(null)} />

              <aside
                className="
              fixed lg:static bottom-0 lg:bottom-auto
              left-0 right-0 lg:left-auto lg:right-auto
              z-50 lg:z-auto
              w-full lg:w-72
              max-h-[85vh] lg:max-h-none
              overflow-y-auto
              bg-slate-900 text-white
              p-5 flex flex-col gap-4
              rounded-t-2xl lg:rounded-none shrink-0
            "
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-lg">
                      {t("orders.management.orderNumber", {
                        orderNumber: selectedOrder.orderNumber ?? `ORD-${selectedOrder.orderId ?? id.slice(-4)}`,
                      })}
                    </h2>
                    <p className="text-slate-400 text-sm capitalize">
                      {selectedOrder.status ? selectedOrder.status : t("orders.management.inProgress")}
                    </p>
                    {type === "delivery" && (
                      <p className="text-xs text-blue-400 mt-1">
                        📍{" "}
                        {(selectedOrder as any).deliveryAddress ??
                          (selectedOrder as any).customerLocation?.address ??
                          t("orders.management.deliveryOrder")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-sm" />
                    <span className="text-sm font-semibold text-slate-300">
                      {t("orders.management.orderItems")}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(selectedOrder.items ?? []).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-300">
                          {item.quantity}x {(item as any).name ?? item.itemId}
                        </span>
                        <span className="text-white font-medium">
                          ${((item as any).price ?? 0) * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>{t("orders.management.subtotal")}</span>
                    <span>${sub.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>{t("orders.management.tax")}</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-base">
                    <span>{t("orders.management.total")}</span>
                    <span className="text-blue-400">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 rounded-xl bg-slate-700 text-sm font-semibold hover:bg-slate-600 transition-colors">
                    🖨 {t("orders.management.print")}
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/orders/${id}/edit`)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-700 text-sm font-semibold hover:bg-slate-600 transition-colors"
                  >
                    ✏ {t("common.edit")}
                  </button>
                </div>

                {canMarkReady(selectedOrder) && (
                  <button
                    onClick={() => handleMarkReady(selectedOrder)}
                    disabled={markingId === id}
                    className="w-full py-3 rounded-xl bg-blue-500 text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {markingId === id ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        {t("orders.management.updating")}
                      </>
                    ) : (
                      t("orders.management.markAsReady")
                    )}
                  </button>
                )}

                {canCancel(selectedOrder) && (
                  <button
                    onClick={(e) => handleCancel(id, e)}
                    disabled={cancellingId === id}
                    className="w-full py-2.5 rounded-xl border border-red-500/40 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    {cancellingId === id
                      ? t("orders.management.cancelling")
                      : t("orders.management.cancelOrder")}
                  </button>
                )}
              </aside>
            </>
          );
        })()}
    </div>
  );
}