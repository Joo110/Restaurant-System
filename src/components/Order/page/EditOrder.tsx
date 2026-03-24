// src/components/Orders/EditOrder.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderByIdFn, updateOrderFn } from "../hook/useOrders";
import { useItems } from "../../Menu/hook/useItems";
import { invalidateQuery } from "../../../hook/queryClient";

type LocalItem = {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
};
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function EditOrder() {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();

  /* ── state ── */
  const [items,         setItems]         = useState<LocalItem[]>([]);
  const [instructions,  setInstructions]  = useState("");
  const [tableNumber,   setTableNumber]   = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [orderMeta,     setOrderMeta]     = useState<{
    orderNumber?: string;
    branch?: string;
    orderType?: string;
    status?: string;
    subtotal?: number;
    tax?: number;
    total?: number;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
  }>({});
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddItems, setShowAddItems] = useState(false);
  const [addSearch,    setAddSearch]    = useState("");
  const [error,        setError]        = useState<string | null>(null);

  /* ── load existing order ── */
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getOrderByIdFn(id)
      .then((res: any) => {
        // API returns { message, data: { ... } }
        const order = res?.data ?? res;

        // Map items — API shape: { id, name, quantity, price, totalPrice }
        const mapped: LocalItem[] = (order.items ?? []).map((i: any) => ({
          id:        i.id        ?? i._id    ?? i.itemId ?? "",
          name:      i.name      ?? i.itemId ?? "Item",
          qty:       i.quantity  ?? 1,
          unitPrice: i.price     ?? 0,
        }));

        setItems(mapped);
        setInstructions(order.notes ?? "");
        setTableNumber(order.tableNumber ?? "");
        setPaymentMethod(order.paymentMethod ?? "cash");

        // Store read-only meta for display
        setOrderMeta({
          orderNumber: order.orderNumber,
          branch:      order.branch,
          orderType:   order.orderType,
          status:      order.status,
          subtotal:    order.subtotal,
          tax:         order.tax,
          total:       order.total,
          createdBy:   order.createdBy,
          updatedBy:   order.updatedBy,
          createdAt:   order.createdAt,
          updatedAt:   order.updatedAt,
        });
      })
      .catch(() => setError("Failed to load order."))
      .finally(() => setIsLoading(false));
  }, [id]);

  /* ── menu for add-items panel ── */
  const { data: menuData } = useItems({
    keyword: addSearch || undefined,
    limit: 30,
  });
  const menuItems = (menuData?.data ?? []) as {
    _id?: string; id?: string; name: string; price: number; image?: string;
  }[];

  /* ── cart actions ── */
  const updateQty = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => i.id === itemId ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0)
    );
  };

  const addFromMenu = (menu: typeof menuItems[0]) => {
    const mid = menu._id ?? menu.id ?? "";
    setItems((prev) => {
      const ex = prev.find((i) => i.id === mid);
      if (ex) return prev.map((i) => i.id === mid ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: mid, name: menu.name, qty: 1, unitPrice: menu.price }];
    });
  };

  /* ── math (recalculated locally from items) ── */
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const tax      = parseFloat((subtotal * 0.14).toFixed(2));   // 14% — adjust if needed
  const total    = parseFloat((subtotal + tax).toFixed(2));

  /* ── submit ── */
  const handleUpdate = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await updateOrderFn(id, {
        notes:         instructions || undefined,
        tableNumber:   tableNumber  || null,
        paymentMethod,
        // Uncomment if your API accepts items in update:
        // items: items.map(i => ({ itemId: i.id, quantity: i.qty })),
      });
      invalidateQuery("orders");
      navigate("/dashboard/orders");
    } catch (err) {
      console.error(err);
      alert("Failed to update order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── status badge color ── */
  const statusColors: Record<string, string> = {
    pending:            "bg-yellow-100 text-yellow-700",
    "out-for-delivery": "bg-blue-100 text-blue-700",
    delivered:          "bg-green-100 text-green-700",
    cancelled:          "bg-red-100 text-red-700",
    ready:              "bg-purple-100 text-purple-700",
    completed:          "bg-green-100 text-green-700",
  };

  /* ── loading / error states ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Loading order...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-3">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={() => navigate("/dashboard/orders")}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  /* ── render ── */
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <button
              onClick={() => navigate("/dashboard/orders")}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-sm mb-2 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Edit Order {orderMeta.orderNumber ? `#${orderMeta.orderNumber}` : `#${id?.slice(-4)}`}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {orderMeta.branch && (
                <span className="text-xs text-slate-400">📍 {orderMeta.branch}</span>
              )}
              {orderMeta.status && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[orderMeta.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {orderMeta.status.replace(/-/g, " ")}
                </span>
              )}
              {orderMeta.orderType && (
                <span className="text-xs text-slate-400 capitalize">· {orderMeta.orderType}</span>
              )}
            </div>
          </div>

          {/* Order meta (right side) */}
          <div className="hidden sm:flex flex-col gap-1.5 items-end">
            {tableNumber && (
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-slate-500">🍴 Table</span>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-transparent w-10 focus:outline-none"
                />
              </div>
            )}
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl focus:outline-none"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
            {orderMeta.createdBy && (
              <span className="text-xs text-slate-400">Created by: {orderMeta.createdBy}</span>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 mb-6" />

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ══ LEFT — Items ══ */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
              <div className="space-y-4">
                {items.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-6">No items. Add some below.</p>
                )}
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 sm:gap-4 py-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 border border-slate-200 rounded-xl px-2 py-1.5 shrink-0">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-red-500 font-bold transition-colors"
                      >−</button>
                      <span className="w-5 text-center font-bold text-slate-800 text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-blue-500 font-bold transition-colors"
                      >+</button>
                    </div>
                    <span className="flex-1 text-slate-700 font-medium text-sm sm:text-base truncate">{item.name}</span>
                    <div className="text-right shrink-0">
                      <span className="text-blue-500 font-bold text-sm sm:text-base block">
                        ${(item.unitPrice * item.qty).toFixed(2)}
                      </span>
                      {item.qty > 1 && (
                        <span className="text-xs text-slate-400">${item.unitPrice} each</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add more items toggle */}
              <button
                onClick={() => setShowAddItems((v) => !v)}
                className="mt-4 w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-slate-400 text-sm font-medium hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-lg">{showAddItems ? "−" : "⊕"}</span>
                {showAddItems ? "Hide menu" : "Add More Items"}
              </button>

              {/* Add items panel */}
              {showAddItems && (
                <div className="mt-4 border border-slate-100 rounded-xl p-3">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={addSearch}
                    onChange={(e) => setAddSearch(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {menuItems.map((m) => (
                      <button
                        key={m._id ?? m.id}
                        onClick={() => addFromMenu(m)}
                        className="text-left p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        <p className="text-sm font-semibold text-slate-700 truncate">{m.name}</p>
                        <p className="text-xs text-blue-500 font-bold mt-0.5">${m.price}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Special Instructions */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Special Instructions</h3>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                placeholder="Any special notes..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Timestamps (read-only info) */}
            {(orderMeta.createdAt || orderMeta.updatedAt) && (
              <div className="mt-4 flex gap-4 flex-wrap">
                {orderMeta.createdAt && (
                  <p className="text-xs text-slate-400">
                    Created: {new Date(orderMeta.createdAt).toLocaleString()}
                  </p>
                )}
                {orderMeta.updatedAt && (
                  <p className="text-xs text-slate-400">
                    Updated: {new Date(orderMeta.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ══ RIGHT — Summary ══ */}
          <div className="w-full lg:w-64 bg-slate-900 rounded-2xl p-5 text-white flex flex-col gap-4 h-fit lg:sticky lg:top-6">
            <h2 className="text-lg font-bold">Order Summary</h2>

            {/* Items count */}
            <p className="text-slate-400 text-xs -mt-2">
              {items.length} item{items.length !== 1 ? "s" : ""} ·{" "}
              {items.reduce((s, i) => s + i.qty, 0)} qty total
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Tax (14%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-3">
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <div className="text-right">
                  <span className="text-blue-400 text-xl">${total}</span>
                  <p className="text-slate-500 text-xs font-normal">Includes all taxes</p>
                </div>
              </div>
            </div>

            {/* Original totals from API (read-only reference) */}
            {(orderMeta.total != null) && (
              <div className="bg-slate-800 rounded-xl p-3 space-y-1">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Original</p>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span><span>${orderMeta.subtotal?.toFixed(2) ?? "—"}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Tax</span><span>${orderMeta.tax?.toFixed(2) ?? "—"}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300 font-semibold">
                  <span>Total</span><span>${orderMeta.total?.toFixed(2) ?? "—"}</span>
                </div>
              </div>
            )}

            <div className="mt-auto flex flex-col gap-2 pt-2">
              <button
                onClick={() => navigate("/dashboard/orders")}
                className="w-full py-3 rounded-xl bg-slate-700 text-sm font-semibold hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isSubmitting || items.length === 0}
                className="w-full py-3 rounded-xl bg-blue-500 text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Updating...
                  </>
                ) : "Update Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}