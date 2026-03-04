// src/components/Orders/OrdersManagement.tsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders, cancelOrderFn, updateOrderStatusFn } from "../hook/useOrders";
import { invalidateQuery } from "../../../hook/queryClient";
import type { Order } from "../services/orderService";
/* eslint-disable @typescript-eslint/no-explicit-any */

/* ── helpers ────────────────────────────────────────── */
const typeBadge: Record<string, string> = {
  "dine-in":  "bg-purple-100 text-purple-700",
  "takeaway": "bg-green-100  text-green-700",
  "delivery": "bg-blue-100   text-blue-700",
};
const typeLabel: Record<string, string> = {
  "dine-in":  "Dine in",
  "takeaway": "Take away",
  "delivery": "Delivery",
};
const statusColor: Record<string, string> = {
  completed: "text-green-500",
  cancelled:  "text-red-500",
  ready:      "text-blue-500",
};

function timeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 60000;
  if (diff < 1)  return "just now";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

const FILTERS = ["All Orders", "dine-in", "takeaway", "delivery"];

/* ═══════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════ */
export default function OrdersManagement() {
  const navigate = useNavigate();

  /* ── state ── */
  const [selectedOrder,  setSelectedOrder]  = useState<Order | null>(null);
  const [activeFilter,   setActiveFilter]   = useState("All Orders");
  const [search,         setSearch]         = useState("");
  const [cancellingId,   setCancellingId]   = useState<string | null>(null);
  const [markingId,      setMarkingId]      = useState<string | null>(null);

  /* ── data ── */
  const { data, isLoading, isError, refetch } = useOrders({
    status: activeFilter === "All Orders" ? undefined : activeFilter,
    keyword: search || undefined,
    limit: 50,
  });

  const orders: Order[] = data?.data ?? [];

  /* ── actions ── */
  const handleCancel = useCallback(async (id: string, e: React.MouseEvent) => {
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
  }, [selectedOrder]);

  const handleMarkReady = useCallback(async (id: string) => {
    setMarkingId(id);
    try {
      await updateOrderStatusFn(id, { status: "ready" });
      invalidateQuery("orders");
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setMarkingId(null);
    }
  }, []);

  /* ── derived ── */
  const orderId = (o: Order) => (o.id ?? o._id ?? "") as string;
  const canCancel = (o: Order) => !["cancelled", "completed"].includes((o.status ?? "").toLowerCase());
  const canMarkReady = (o: Order) => !["ready", "completed", "cancelled"].includes((o.status ?? "").toLowerCase());

  /* ── render ── */
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans relative">

      {/* ══ MAIN ══════════════════════════════════════════════ */}
      <main className="flex-1 p-4 sm:p-6 min-w-0">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">

          {/* ── Filters bar ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-5 flex-wrap">
            {/* Search */}
            <div className="relative w-full sm:flex-1 sm:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
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
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
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

          {/* ── States ── */}
          {isLoading && (
            <div className="flex justify-center items-center py-16 text-slate-400 text-sm gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Loading orders...
            </div>
          )}

          {isError && (
            <div className="text-center py-16">
              <p className="text-red-500 text-sm mb-3">Failed to load orders.</p>
              <button onClick={refetch} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm hover:bg-slate-200">
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && orders.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-sm">No orders found.</div>
          )}

          {/* ── Orders grid ── */}
          {!isLoading && !isError && orders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {orders.map((order) => {
                const id     = orderId(order);
                const status = (order.status ?? "").toLowerCase();
                const type   = (order.orderType ?? "").toLowerCase();

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
                          #ORD-{order.orderId ?? id.slice(-4)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-slate-500">
                            🍴 {order.tableNumber ? `Table ${order.tableNumber}` : "—"}
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
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                          ⚠ {order.notes}
                        </p>
                      )}
                    </div>

                    {/* Status / progress */}
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

                    {/* Cancel inline button */}
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

      {/* ══ DETAIL PANEL ══════════════════════════════════════ */}
      {selectedOrder && (() => {
        const id     = orderId(selectedOrder);
        const total  = (selectedOrder as any).total ?? 0;
        const sub    = (selectedOrder as any).subtotal ?? 0;
        const tax    = (selectedOrder as any).tax ?? 0;

        return (
          <>
            {/* Mobile overlay */}
            <div
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setSelectedOrder(null)}
            />

            <aside className="
              fixed lg:static bottom-0 lg:bottom-auto
              left-0 right-0 lg:left-auto lg:right-auto
              z-50 lg:z-auto
              w-full lg:w-72
              max-h-[85vh] lg:max-h-none
              overflow-y-auto
              bg-slate-900 text-white
              p-5 flex flex-col gap-4
              rounded-t-2xl lg:rounded-none shrink-0
            ">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-lg">
                    Order #{selectedOrder.orderId ?? id.slice(-4)}
                  </h2>
                  <p className="text-slate-400 text-sm capitalize">
                    {selectedOrder.status ?? "In progress"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
                >×</button>
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
                      <span className="text-white font-medium">
                        ${((item as any).price ?? 0) * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-slate-700 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal</span><span>${sub.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Tax</span><span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-blue-400">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions row */}
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

              {/* Mark ready */}
              {canMarkReady(selectedOrder) && (
                <button
                  onClick={() => handleMarkReady(id)}
                  disabled={markingId === id}
                  className="w-full py-3 rounded-xl bg-blue-500 text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {markingId === id ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Updating...
                    </>
                  ) : "✓ Mark as Ready"}
                </button>
              )}

              {/* Cancel from panel */}
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