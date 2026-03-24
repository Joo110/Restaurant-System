// src/components/Orders/OrdersManagement.tsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  "takeaway": "bg-green-100 text-green-700",
  "delivery": "bg-blue-100 text-blue-700",
};
const typeLabel: Record<string, string> = {
  "dine-in": "Dine in",
  "takeaway": "Take away",
  "delivery": "Delivery",
};
const statusColor: Record<string, string> = {
  completed: "text-green-500",
  cancelled: "text-red-500",
  ready: "text-blue-500",
};

function timeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
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
  phone: string
): AssignDriverErrors {
  const e: AssignDriverErrors = {};
  if (!driverId) e.driverId = "Please select a driver";
  if (!deliveryFee || isNaN(Number(deliveryFee))) e.deliveryFee = "Enter a valid delivery fee";
  else if (Number(deliveryFee) < 0) e.deliveryFee = "Fee cannot be negative";
  if (commission && isNaN(Number(commission))) e.commission = "Enter a valid commission";
  if (!address.trim()) e.address = "Delivery address is required";
  else if (address.trim().length < 5) e.address = "Address is too short";
  if (!phone.trim()) e.phone = "Customer phone is required";
  else if (!/^[0-9+\-\s()]{7,15}$/.test(phone.trim())) e.phone = "Enter a valid phone number";
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
    const errs = validateAssign(driverId, deliveryFee, commission, address, phone);
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
          : data?.message ?? err?.message ?? "Failed to assign driver."
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
                <h2 className="text-lg font-bold text-white">Assign Driver</h2>
                <p className="text-blue-100 text-sm">Order #{orderNumber}</p>
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
              💰 ${(order as any).total?.toFixed(2) ?? "—"}
            </span>
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
              📦 {(order.items ?? []).length} items
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
              Delivery Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Gehan street villa 7, Mansoura"
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
              Customer Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="01xxxxxxxxx"
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
              Select Driver <span className="text-red-500">*</span>
            </label>

            {availableDrivers.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                <span>⚠️</span> No available drivers. Change a driver's status first.
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
                <option value="">Select a driver</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Fee</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Commission</label>
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
            Cancel
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
            {loading ? "Assigning..." : "Assign Driver"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrdersManagement() {
  const navigate = useNavigate();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All Orders");
  const [search, setSearch] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);

  // ── Data ──
  const { data, isLoading, isError, refetch } = useOrders({
    orderType: activeFilter === "All Orders" ? undefined : activeFilter,
    keyword: search || undefined,
    limit: 50,
  });

  const { data: driversData } = useDrivers({ sort: "-createdAt", limit: 20 });
  const drivers: Driver[] = driversData?.data ?? [];

  const orders: Order[] = data?.data ?? [];

  // ── Actions ──
  const handleCancel = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!confirm("Cancel this order?")) return;
      setCancellingId(id);
      try {
        await cancelOrderFn(id);
        invalidateQuery("orders");
        if (selectedOrder?.id === id || selectedOrder?._id === id) setSelectedOrder(null);
      } catch (err) {
        console.error(err);
        alert("Failed to cancel order.");
      } finally {
        setCancellingId(null);
      }
    },
    [selectedOrder]
  );

  // Mark as Ready → then open Assign Driver modal
  const handleMarkReady = useCallback(async (order: Order) => {
    const id = (order.id ?? order._id ?? "") as string;
    setMarkingId(id);
    try {
      await updateOrderStatusFn(id, { status: "ready" });
      invalidateQuery("orders");
      // Open assign modal with updated order reference
      setAssigningOrder(order);
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setMarkingId(null);
    }
  }, []);

  // ── Derived ──
  const orderId = (o: Order) => (o.id ?? o._id ?? "") as string;
  const canCancel = (o: Order) => !["cancelled", "completed"].includes((o.status ?? "").toLowerCase());
  const canMarkReady = (o: Order) => !["ready", "completed", "cancelled"].includes((o.status ?? "").toLowerCase());

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans relative">
      {/* Assign Driver Modal */}
      {assigningOrder && (
        <AssignDriverModal order={assigningOrder} drivers={drivers} onClose={() => setAssigningOrder(null)} />
      )}

      {/* ══ MAIN ══ */}
      <main className="flex-1 p-4 sm:p-6 min-w-0">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
          {/* Filters bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-5 flex-wrap">
            {/* Search */}
            <div className="relative w-full sm:flex-1 sm:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by Order ID, Table, or Item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter pills */}
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
                  {f === "delivery" ? "🛵 " : f === "takeaway" ? "🥡 " : f === "dine-in" ? "🍽 " : ""}
                  {typeLabel[f] ?? f}
                </button>
              ))}
            </div>

            {/* Create button */}
            <button
              onClick={() => navigate("/dashboard/orders/create")}
              className="w-full sm:w-auto sm:ml-auto px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              + Create Order
            </button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center items-center py-16 text-slate-400 text-sm gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading orders...
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="text-center py-16">
              <p className="text-red-500 text-sm mb-3">Failed to load orders.</p>
              <button onClick={refetch} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm hover:bg-slate-200">
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && orders.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-sm">
              {activeFilter === "delivery"
                ? "No delivery orders found. Create one by selecting 🛵 Delivery when placing an order."
                : "No orders found."}
            </div>
          )}

          {/* Orders grid */}
          {!isLoading && !isError && orders.length > 0 && (
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
                      orderId(selectedOrder ?? {}) === id
                        ? "border-blue-500 bg-blue-50/30"
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          #{order.orderNumber ?? `ORD-${order.orderId ?? id.slice(-4)}`}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-slate-500">
                            {type === "delivery"
                              ? `📍 ${(order as any).deliveryAddress ?? (order as any).customerLocation?.address ?? "Delivery"}`
                              : `🍴 ${order.tableNumber ? `Table ${order.tableNumber}` : "—"}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">{timeAgo(order.createdAt)}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeBadge[type] ?? "bg-slate-100 text-slate-600"}`}>
                          {typeLabel[type] ?? order.orderType}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 my-2" />

                    {/* Items list */}
                    <div className="space-y-0.5">
                      {(order.items ?? []).slice(0, 3).map((item, i) => (
                        <p key={i} className="text-sm text-slate-700">
                          {item.quantity}x {(item as any).name ?? item.itemId}
                        </p>
                      ))}
                      {(order.items?.length ?? 0) > 3 && (
                        <p className="text-xs text-slate-400">+{(order.items?.length ?? 0) - 3} more</p>
                      )}
                      {order.notes && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">⚠ {order.notes}</p>
                      )}
                    </div>

                    {/* Status / progress */}
                    {statusColor[status] ? (
                      <p className={`font-bold text-sm mt-2 capitalize ${statusColor[status]}`}>{order.status}</p>
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
                        {cancellingId === id ? "Cancelling..." : "Cancel order"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ══ DETAIL PANEL ══ */}
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
                      #{selectedOrder.orderNumber ?? `ORD-${selectedOrder.orderId ?? id.slice(-4)}`}
                    </h2>
                    <p className="text-slate-400 text-sm capitalize">{selectedOrder.status ?? "In progress"}</p>
                    {type === "delivery" && (
                      <p className="text-xs text-blue-400 mt-1">
                        📍{" "}
                        {(selectedOrder as any).deliveryAddress ??
                          (selectedOrder as any).customerLocation?.address ??
                          "Delivery order"}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white transition-colors text-xl leading-none">
                    ×
                  </button>
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-sm" />
                    <span className="text-sm font-semibold text-slate-300">Order Items</span>
                  </div>
                  <div className="space-y-2">
                    {(selectedOrder.items ?? []).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-300">
                          {item.quantity}x {(item as any).name ?? item.itemId}
                        </span>
                        <span className="text-white font-medium">${((item as any).price ?? 0) * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-slate-700 pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Subtotal</span>
                    <span>${sub.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-blue-400">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 rounded-xl bg-slate-700 text-sm font-semibold hover:bg-slate-600 transition-colors">
                    🖨 Print
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/orders/${id}/edit`)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-700 text-sm font-semibold hover:bg-slate-600 transition-colors"
                  >
                    ✏ Edit
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
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Updating...
                      </>
                    ) : (
                      "✓ Mark as Ready"
                    )}
                  </button>
                )}

                {canCancel(selectedOrder) && (
                  <button
                    onClick={(e) => handleCancel(id, e)}
                    disabled={cancellingId === id}
                    className="w-full py-2.5 rounded-xl border border-red-500/40 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    {cancellingId === id ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
              </aside>
            </>
          );
        })()}
    </div>
  );
}