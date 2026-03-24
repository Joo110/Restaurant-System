// src/components/Order/page/CreateOrder.tsx
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useItems } from "../../Menu/hook/useItems";
import { createOrderFn } from "../hook/useOrders";
import { invalidateQuery } from "../../../hook/queryClient";
import type { ApiBranch } from "../../layout/Topbar";

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ── types ── */
export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note: string;
};

// ─── OrderPanel ───────────────────────────────────────────────────────────────

interface OrderPanelProps {
  orderItems: OrderItem[];
  updateQty: (id: string, delta: number) => void;
  updateNote: (id: string, note: string) => void;
  subtotal: number;
  tax: number;
  total: number;
  finalTotal: number;
  promoCode: string;
  setPromoCode: (v: string) => void;
  promoDiscount: number;
  setShowOrder: (v: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const OrderPanel: React.FC<OrderPanelProps> = ({
  orderItems,
  updateQty,
  updateNote,
  subtotal,
  tax,
  total,
  finalTotal,
  promoCode,
  setPromoCode,
  promoDiscount,
  setShowOrder,
  onCancel,
  onConfirm,
  isSubmitting,
}) => (
  <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <h2 className="text-base sm:text-lg font-bold">Current Order</h2>
      <button
        onClick={() => setShowOrder(false)}
        className="lg:hidden text-slate-400 hover:text-white text-lg leading-none"
      >
        ✕
      </button>
    </div>

    <div className="flex flex-col gap-3 overflow-y-auto max-h-48 lg:max-h-[320px]">
      {orderItems.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-4">No items yet</p>
      )}

      {orderItems.map((item) => (
        <div key={item.id}>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center flex-shrink-0">
              <button
                onClick={() => updateQty(item.id, 1)}
                className="w-5 h-5 flex items-center justify-center bg-slate-700 rounded text-xs hover:bg-slate-600"
              >
                +
              </button>
              <span className="text-sm font-bold my-0.5">{item.quantity}</span>
              <button
                onClick={() => updateQty(item.id, -1)}
                className="w-5 h-5 flex items-center justify-center bg-slate-700 rounded text-xs hover:bg-slate-600"
              >
                −
              </button>
            </div>
            <span className="flex-1 text-sm font-medium truncate">{item.name}</span>
            <span className="text-sm font-bold flex-shrink-0">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>

          <input
            type="text"
            placeholder="Add note..."
            value={item.note}
            onChange={(e) => updateNote(item.id, e.target.value)}
            className="mt-1 w-full bg-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-600 ml-7"
          />
        </div>
      ))}
    </div>

    <div className="border-t border-slate-700 pt-3 space-y-1.5">
      <div className="flex justify-between text-sm text-slate-400">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm text-slate-400">
        <span>Tax (20%)</span>
        <span>${tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-base font-bold mt-2">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>

    <div className="border-t border-slate-700 pt-3">
      <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2.5">
        <input
          type="text"
          placeholder="Promo code"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-300 placeholder-slate-500 focus:outline-none"
        />
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          className="text-slate-500 flex-shrink-0"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      </div>

      {promoDiscount > 0 && (
        <div className="flex justify-between text-sm mt-2 text-slate-300">
          <span>Promo</span>
          <span className="text-red-400">-${promoDiscount.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between text-base font-bold mt-1">
        <span>Final Total</span>
        <span>${finalTotal.toFixed(2)}</span>
      </div>
    </div>

    <div className="flex gap-2 mt-1">
      <button
        onClick={onCancel}
        className="flex-1 py-3 rounded-xl bg-slate-700 text-sm font-semibold hover:bg-slate-600 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={isSubmitting || orderItems.length === 0}
        className="flex-1 py-3 rounded-xl bg-blue-500 text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Placing...
          </>
        ) : (
          "Confirm Order"
        )}
      </button>
    </div>
  </div>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["All Items", "Starters", "Mains", "Desserts", "Drinks"];
const PROMO_CODES: Record<string, number> = { SAVE20: 20, SAVE10: 10 };

/** 24-hex MongoDB ObjectId guard */
const isObjectId = (v?: string | null): v is string =>
  typeof v === "string" && /^[a-f\d]{24}$/i.test(v.trim());

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CreateOrder() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("All Items");
  const [search, setSearch] = useState("");
  const [showOrder, setShowOrder] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway" | "delivery">("dine-in");
  const [tableNumber, setTableNumber] = useState("");

  const outlet = useOutletContext<{ activeBranch?: ApiBranch | null } | undefined>();
  const activeBranch = outlet?.activeBranch ?? null;

  const { data: itemsData, isLoading: itemsLoading } = useItems({
    category: activeCategory === "All Items" ? undefined : activeCategory,
    keyword: search || undefined,
    limit: 50,
  });

  const menuItems = (itemsData?.data ?? []) as {
    _id: string;
    id?: string;
    name: string;
    description?: string;
    price: number;
    image?: string | null;
    category?: string;
  }[];

  const promoDiscount = PROMO_CODES[promoCode.toUpperCase()] ?? 0;

  const subtotal = orderItems.reduce((s, o) => s + o.price * o.quantity, 0);
  const tax = subtotal * 0.2;
  const total = subtotal + tax;
  const finalTotal = Math.max(0, total - promoDiscount);

  const addItem = (item: typeof menuItems[0]) => {
    const id = item._id ?? item.id ?? "";
    setOrderItems((prev) => {
      const ex = prev.find((o) => o.id === id);
      if (ex) return prev.map((o) => (o.id === id ? { ...o, quantity: o.quantity + 1 } : o));
      return [...prev, { id, name: item.name, price: item.price, quantity: 1, note: "" }];
    });
  };

  const updateQty = (id: string, delta: number) =>
    setOrderItems((prev) =>
      prev.map((o) => (o.id === id ? { ...o, quantity: o.quantity + delta } : o)).filter((o) => o.quantity > 0)
    );

  const updateNote = (id: string, note: string) =>
    setOrderItems((prev) => prev.map((o) => (o.id === id ? { ...o, note } : o)));

  // branchId always string now, so CreateOrderDTO won't complain
  const branchId =
    isObjectId(activeBranch?.id)
      ? activeBranch!.id
      : isObjectId(activeBranch?._id)
        ? activeBranch!._id
        : "";

  const handleConfirm = async () => {
    if (orderItems.length === 0) return;

    if (orderType === "dine-in" && !String(tableNumber).trim()) {
      alert("Table number is required for dine-in orders.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrderFn({
        orderType,
        tableNumber: orderType === "dine-in" ? String(tableNumber).trim() : undefined,
        items: orderItems.map((o) => ({
          itemId: o.id,
          quantity: o.quantity,
          notes: o.note || undefined,
        })),
        paymentMethod: "cash",
        branchId,
        notes: orderItems.filter((o) => o.note).map((o) => `${o.name}: ${o.note}`).join(" | ") || undefined,
      });

      invalidateQuery("orders");

      if (orderType === "delivery") {
        await new Promise((r) => setTimeout(r, 800));
        invalidateQuery("dispatches");
        navigate("/dashboard/orders");
      } else {
        navigate("/dashboard/dispatches");
      }
    } catch (err: any) {
      const resp = err?.response?.data;
      if (resp && Array.isArray(resp.errors)) {
        const messages = resp.errors.map((e: any) => `${e.path ?? "field"}: ${e.msg}`).join("\n");
        alert(`Failed to place order:\n${messages}`);
      } else {
        console.error(err);
        alert(resp?.message ?? "Failed to place order. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto p-3 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900">Create New Order</h1>

            <div className="flex flex-wrap gap-2 mt-2 items-center">
              {(["dine-in", "takeaway", "delivery"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all capitalize ${
                    orderType === t
                      ? t === "delivery"
                        ? "bg-blue-600 text-white ring-2 ring-blue-300"
                        : "bg-blue-500 text-white"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  {t === "delivery" ? "🛵 Delivery" : t === "takeaway" ? "🥡 Takeaway" : "🍽 Dine-in"}
                </button>
              ))}

              {orderType === "dine-in" && (
                <input
                  type="text"
                  placeholder="Table #"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="px-3 py-1 rounded-full text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-400 w-20"
                />
              )}
            </div>
          </div>

          <button
            onClick={() => setShowOrder(true)}
            className="lg:hidden relative flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold"
          >
            🛒
            {orderItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                {orderItems.reduce((s, o) => s + o.quantity, 0)}
              </span>
            )}
            <span>Order</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <div className="flex-1 min-w-0 space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-600"
                />
              </div>

              <div className="flex gap-2 mb-4 sm:mb-5 overflow-x-auto pb-0.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      activeCategory === cat
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {itemsLoading && (
                <div className="flex justify-center items-center py-16 text-slate-400 text-sm gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Loading menu...
                </div>
              )}

              {!itemsLoading && (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                  {menuItems.map((item) => {
                    const id = item._id ?? item.id ?? "";
                    const inCart = orderItems.find((o) => o.id === id);
                    return (
                      <div
                        key={id}
                        onClick={() => addItem(item)}
                        className={`rounded-xl border p-2.5 sm:p-3 cursor-pointer transition-all group relative ${
                          inCart
                            ? "border-blue-400 bg-blue-50 shadow-sm"
                            : "border-slate-100 hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        {inCart && (
                          <span className="absolute top-2 right-2 w-5 h-5 bg-blue-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                            {inCart.quantity}
                          </span>
                        )}
                        <div className="w-full aspect-square rounded-lg bg-slate-100 overflow-hidden mb-2 group-hover:scale-105 transition-transform">
                          {item.image && item.image.startsWith("http") ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full items-center justify-center text-3xl sm:text-4xl bg-slate-100"
                            style={{ display: item.image && item.image.startsWith("http") ? "none" : "flex" }}
                          >
                            🍽
                          </div>
                        </div>
                        <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{item.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 hidden sm:block">{item.description}</p>
                        <p className="text-blue-600 font-bold text-xs sm:text-sm mt-1">${item.price}</p>
                      </div>
                    );
                  })}

                  {!itemsLoading && menuItems.length === 0 && (
                    <p className="col-span-4 text-center text-slate-400 text-sm py-8">No items found.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block w-72 shrink-0 sticky top-6 self-start">
            <OrderPanel
              orderItems={orderItems}
              updateQty={updateQty}
              updateNote={updateNote}
              subtotal={subtotal}
              tax={tax}
              total={total}
              finalTotal={finalTotal}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              promoDiscount={promoDiscount}
              setShowOrder={setShowOrder}
              onCancel={() => navigate("/dashboard/orders")}
              onConfirm={handleConfirm}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>

      {showOrder && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowOrder(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-slate-900 overflow-y-auto p-4 shadow-2xl">
            <OrderPanel
              orderItems={orderItems}
              updateQty={updateQty}
              updateNote={updateNote}
              subtotal={subtotal}
              tax={tax}
              total={total}
              finalTotal={finalTotal}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              promoDiscount={promoDiscount}
              setShowOrder={setShowOrder}
              onCancel={() => {
                setShowOrder(false);
                navigate("/dashboard/orders");
              }}
              onConfirm={handleConfirm}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}