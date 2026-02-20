import { useState } from "react";

const menuItems = [
  { id: 1, name: "Cesar Salad", description: "Chopped romaine lettuce and garlicky croutons, tossed in a creamy dressing made with eggs", price: 12, image: "🥗" },
  { id: 2, name: "Classic Cheeseburger", description: "Juicy beef patty with cheddar cheese, lettuce, tomato and pickles", price: 24, image: "🍔" },
  { id: 3, name: "Pepperoni Pizza (L)", description: "Large pizza with pepperoni, mozzarella and tomato sauce", price: 18, image: "🍕" },
  { id: 4, name: "Coke Zero", description: "Cold Coca-Cola Zero 330ml can", price: 3, image: "🥤" },
  { id: 5, name: "Grilled Chicken", description: "Tender grilled chicken breast with herbs and lemon", price: 22, image: "🍗" },
  { id: 6, name: "Chocolate Lava Cake", description: "Warm chocolate cake with a gooey center, served with vanilla ice cream", price: 14, image: "🍫" },
  { id: 7, name: "Caesar Wrap", description: "Grilled chicken, romaine, and caesar dressing in a toasted wrap", price: 16, image: "🌯" },
  { id: 8, name: "Mozzarella Sticks", description: "Crispy fried mozzarella sticks with marinara dipping sauce", price: 10, image: "🧀" },
];

const categories = ["All Items", "Starters", "Mains", "Desserts", "Drinks"];

type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  note: string;
};

export default function CreateOrder() {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [search, setSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { id: 2, name: "Classic Cheeseburger", price: 24, quantity: 2, note: "" },
    { id: 1, name: "Cesar Salad", price: 12, quantity: 2, note: "" },
    { id: 4, name: "Coke Zero", price: 3, quantity: 2, note: "" },
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
      if (existing) {
        return prev.map((o) => o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, note: "" }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((o) => o.id === id ? { ...o, quantity: o.quantity + delta } : o)
        .filter((o) => o.quantity > 0)
    );
  };

  const updateNote = (id: number, note: string) => {
    setOrderItems((prev) => prev.map((o) => o.id === id ? { ...o, note } : o));
  };

  const subtotal = orderItems.reduce((sum, o) => sum + o.price * o.quantity, 0);
  const tax = subtotal * 0.2;
  const total = subtotal + tax;
  const finalTotal = total - promoDiscount;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Create New Order</h1>
        <div className="flex gap-6">
          {/* Left - Menu */}
          <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            {/* Search */}
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </span>
              <input
                type="text"
                placeholder="Search menu items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-600"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-blue-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 gap-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addItem(item)}
                  className="rounded-xl border border-slate-100 p-3 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="w-full aspect-square rounded-lg bg-slate-50 flex items-center justify-center text-4xl mb-2 group-hover:scale-105 transition-transform">
                    {item.image}
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-3">{item.description}</p>
                  <p className="text-blue-600 font-bold text-sm mt-1">${item.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="w-72 bg-slate-900 rounded-2xl p-5 text-white flex flex-col gap-4 h-fit sticky top-6">
            <h2 className="text-lg font-bold">Current Order</h2>

            <div className="flex flex-col gap-3">
              {orderItems.map((item) => (
                <div key={item.id}>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 flex items-center justify-center bg-slate-700 rounded text-xs hover:bg-slate-600">+</button>
                      <span className="text-sm font-bold my-0.5">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 flex items-center justify-center bg-slate-700 rounded text-xs hover:bg-slate-600">−</button>
                    </div>
                    <span className="flex-1 text-sm font-medium">{item.name}</span>
                    <span className="text-sm font-bold">${item.price * item.quantity}</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Add note...."
                    value={item.note}
                    onChange={(e) => updateNote(item.id, e.target.value)}
                    className="mt-1 w-full bg-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-600 ml-7"
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-slate-700 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Tax</span><span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold mt-2">
                <span>Total</span><span>${total.toFixed(2)}</span>
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
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-slate-500"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <div className="flex justify-between text-sm mt-2 text-slate-300">
                <span>Promo</span><span className="text-red-400">-${promoDiscount}</span>
              </div>
              <div className="flex justify-between text-base font-bold mt-1">
                <span>Total</span><span>${(finalTotal).toFixed(0)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-1">
              <button className="flex-1 py-3 rounded-xl bg-slate-700 text-sm font-semibold hover:bg-slate-600 transition-colors">Cancel</button>
              <button className="flex-1 py-3 rounded-xl bg-blue-500 text-sm font-semibold hover:bg-blue-600 transition-colors">Confirm Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}