// src/components/Orders/CreateOrder.tsx
import React, { useState } from "react";

const menuItems = [
  { id: 1, name: "Cesar Salad",          description: "Chopped romaine lettuce and garlicky croutons, tossed in a creamy dressing made with eggs", price: 12, image: "🥗" },
  { id: 2, name: "Classic Cheeseburger", description: "Juicy beef patty with cheddar cheese, lettuce, tomato and pickles",                          price: 24, image: "🍔" },
  { id: 3, name: "Pepperoni Pizza (L)",  description: "Large pizza with pepperoni, mozzarella and tomato sauce",                                     price: 18, image: "🍕" },
  { id: 4, name: "Coke Zero",            description: "Cold Coca-Cola Zero 330ml can",                                                               price: 3,  image: "🥤" },
  { id: 5, name: "Grilled Chicken",      description: "Tender grilled chicken breast with herbs and lemon",                                          price: 22, image: "🍗" },
  { id: 6, name: "Chocolate Lava Cake",  description: "Warm chocolate cake with a gooey center, served with vanilla ice cream",                      price: 14, image: "🍫" },
  { id: 7, name: "Caesar Wrap",          description: "Grilled chicken, romaine, and caesar dressing in a toasted wrap",                             price: 16, image: "🌯" },
  { id: 8, name: "Mozzarella Sticks",    description: "Crispy fried mozzarella sticks with marinara dipping sauce",                                   price: 10, image: "🧀" },
];

const categories = ["All Items", "Starters", "Mains", "Desserts", "Drinks"];

export type OrderItem = { id: number; name: string; price: number; quantity: number; note: string };

interface OrderPanelProps {
  orderItems: OrderItem[];
  updateQty: (id: number, delta: number) => void;
  updateNote: (id: number, note: string) => void;
  subtotal: number;
  tax: number;
  total: number;
  finalTotal: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  promoDiscount: number;
  setShowOrder: (v: boolean) => void;
  onCancel?: () => void;
  onConfirm?: () => void;
}

/**
 * OrderPanel is moved outside the main component to avoid creating
 * components during render (ESLint react-hooks/static-components).
 * It receives all needed props from the parent CreateOrder component.
 */
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
  onConfirm
}) => {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold">Current Order</h2>
        {/* Close btn on mobile */}
        <button
          onClick={() => setShowOrder(false)}
          className="lg:hidden text-slate-400 hover:text-white text-lg leading-none"
        >✕</button>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3 overflow-y-auto max-h-48 lg:max-h-none">
        {orderItems.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">No items yet</p>
        )}
        {orderItems.map((item) => (
          <div key={item.id}>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center flex-shrink-0">
                <button onClick={() => updateQty(item.id, 1)}  className="w-5 h-5 flex items-center justify-center bg-slate-700 rounded text-xs hover:bg-slate-600">+</button>
                <span className="text-sm font-bold my-0.5">{item.quantity}</span>
                <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 flex items-center justify-center bg-slate-700 rounded text-xs hover:bg-slate-600">−</button>
              </div>
              <span className="flex-1 text-sm font-medium truncate">{item.name}</span>
              <span className="text-sm font-bold flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <input
              type="text" placeholder="Add note...."
              value={item.note}
              onChange={(e) => updateNote(item.id, e.target.value)}
              className="mt-1 w-full bg-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-600 ml-7"
            />
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-slate-700 pt-3 space-y-1.5">
        <div className="flex justify-between text-sm text-slate-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-sm text-slate-400"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
        <div className="flex justify-between text-base font-bold mt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
      </div>

      {/* Promo */}
      <div className="border-t border-slate-700 pt-3">
        <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2.5">
          <input
            type="text" placeholder="Promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-300 placeholder-slate-500 focus:outline-none"
          />
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-slate-500 flex-shrink-0">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
          </svg>
        </div>
        <div className="flex justify-between text-sm mt-2 text-slate-300"><span>Promo</span><span className="text-red-400">-${promoDiscount}</span></div>
        <div className="flex justify-between text-base font-bold mt-1"><span>Total</span><span>${finalTotal.toFixed(0)}</span></div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-slate-700 text-sm font-semibold hover:bg-slate-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 rounded-xl bg-blue-500 text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          Confirm Order
        </button>
      </div>
    </div>
  );
};

export default function CreateOrder() {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [search,         setSearch]         = useState("");
  const [showOrder,      setShowOrder]      = useState(false); // mobile toggle
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { id: 2, name: "Classic Cheeseburger", price: 24, quantity: 2, note: "" },
    { id: 1, name: "Cesar Salad",          price: 12, quantity: 2, note: "" },
    { id: 4, name: "Coke Zero",            price: 3,  quantity: 2, note: "" },
  ]);
  const [promoCode, setPromoCode] = useState("SAVE20");
  const promoDiscount = 20;

  const filtered = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = (item: typeof menuItems[0]) => {
    setOrderItems((prev) => {
      const existing = prev.find((o) => o.id === item.id);
      if (existing) return prev.map((o) => o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, note: "" }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setOrderItems((prev) =>
      prev.map((o) => o.id === id ? { ...o, quantity: o.quantity + delta } : o).filter((o) => o.quantity > 0)
    );
  };

  const updateNote = (id: number, note: string) => {
    setOrderItems((prev) => prev.map((o) => o.id === id ? { ...o, note } : o));
  };

  const subtotal   = orderItems.reduce((sum, o) => sum + o.price * o.quantity, 0);
  const tax        = subtotal * 0.2;
  const total      = subtotal + tax;
  const finalTotal = total - promoDiscount;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto p-3 sm:p-6">

        {/* Page header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900">Create New Order</h1>
          {/* View order button — mobile only */}
          <button
            onClick={() => setShowOrder(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold"
          >
            🛒 <span>Order ({orderItems.length})</span>
          </button>
        </div>

        {/* Layout — stacks on mobile, side-by-side on lg+ */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">

          {/* ── Left — Menu ── */}
          <div className="flex-1 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 min-w-0">
            {/* Search */}
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </span>
              <input
                type="text" placeholder="Search menu items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-600"
              />
            </div>

            {/* Categories — scrollable */}
            <div className="flex gap-2 mb-4 sm:mb-5 overflow-x-auto pb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeCategory === cat ? "bg-blue-500 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid — 2 col mobile → 3 col md → 4 col xl */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addItem(item)}
                  className="rounded-xl border border-slate-100 p-2.5 sm:p-3 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="w-full aspect-square rounded-lg bg-slate-50 flex items-center justify-center text-3xl sm:text-4xl mb-2 group-hover:scale-105 transition-transform">
                    {item.image}
                  </div>
                  <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{item.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 hidden sm:block">{item.description}</p>
                  <p className="text-blue-600 font-bold text-xs sm:text-sm mt-1">${item.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right — Order Summary (desktop only) ── */}
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
              onCancel={() => { /* keep behavior: no-op or you can clear orderItems */ }}
              onConfirm={() => { /* keep behavior: placeholder */ }}
            />
          </div>
        </div>
      </div>

      {/* ── Mobile Order Drawer ── */}
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
              onCancel={() => setShowOrder(false)}
              onConfirm={() => { /* placeholder for confirm action on mobile */ }}
            />
          </div>
        </div>
      )}
    </div>
  );
}