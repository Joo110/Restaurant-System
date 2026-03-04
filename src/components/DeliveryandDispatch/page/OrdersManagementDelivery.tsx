import { useState } from "react";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface BasketItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  note: string;
}

interface OrdersManagementDeliveryProps {
  onConfirmDispatch?: (data: {
    customer: string;
    phone: string;
    address: string;
    notes: string;
    items: BasketItem[];
  }) => void;
}

const menuItems: MenuItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: i % 3 === 0 ? "Caesar Salad" : i % 3 === 1 ? "Classic Burger" : "Truffle Fries",
  description:
    i % 3 === 0
      ? "chopped romaine lettuce and garlicky croutons, tossed in a creamy dressing made with eggs"
      : i % 3 === 1
      ? "beef patty with cheese, lettuce, tomato and special sauce"
      : "crispy fries with truffle oil and parmesan cheese",
  price: i % 3 === 0 ? 12 : i % 3 === 1 ? 24 : 18,
  image: "🥗",
}));

const tabs = ["All Orders", "Take away", "Tables", "Delivery", "Drinks"];

export default function OrdersManagementDelivery({ onConfirmDispatch }: OrdersManagementDeliveryProps) {
  const [activeTab, setActiveTab] = useState("Delivery");
  const [search, setSearch] = useState("");
  const [basket, setBasket] = useState<BasketItem[]>([
    { id: 1, name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
    { id: 2, name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
    { id: 3, name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
  ]);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  const subtotal = basket.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = 12.5;
  const deliveryFee = 7.5;
  const total = subtotal + tax + deliveryFee;

  const addToBasket = (item: MenuItem) => {
    setBasket((prev) => {
      const existing = prev.find((b) => b.name === item.name);
      if (existing) {
        return prev.map((b) => (b.name === item.name ? { ...b, quantity: b.quantity + 1 } : b));
      }
      return [...prev, { id: Date.now(), name: item.name, quantity: 1, price: item.price, note: "" }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setBasket((prev) =>
      prev
        .map((b) => (b.id === id ? { ...b, quantity: b.quantity + delta } : b))
        .filter((b) => b.quantity > 0)
    );
  };

  const updateNote = (id: number, note: string) => {
    setBasket((prev) => prev.map((b) => (b.id === id ? { ...b, note } : b)));
  };

  const filtered = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col lg:flex-row">
      {/* Left: Menu */}
      <div className="flex-1 p-4 sm:p-6">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-sm text-gray-500">Mansoura Branch</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search by Order ID, Table, or Item...."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => addToBasket(item)}
              className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition text-left group"
            >
              <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-3xl mb-2 group-hover:bg-blue-50 transition">
                {item.image}
              </div>
              <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-gray-400 line-clamp-2 mt-0.5 leading-tight">{item.description}</p>
              <p className="text-xs font-bold text-blue-600 mt-1">${item.price}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Order Panel */}
      <div className="w-full lg:w-80 xl:w-96 bg-gray-900 text-white flex flex-col lg:min-h-screen">
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Customer Details */}
          <div className="mb-5">
            <h3 className="text-base font-bold text-white mb-3">Customer Details</h3>
            <div className="space-y-2.5">
              <input
                type="text"
                placeholder="Customer Name"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Delivery Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Order Notes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Order Basket */}
          <div>
            <h3 className="text-base font-bold text-white mb-3">Order Basket</h3>
            {basket.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">No items added yet</p>
            ) : (
              <div className="space-y-3">
                {basket.map((item) => (
                  <div key={item.id} className="bg-gray-800 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Qty Controls */}
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-5 h-5 rounded bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white transition"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <span className="text-sm font-bold text-white w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-5 h-5 rounded bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white transition"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-white">{item.name}</span>
                          <span className="text-sm font-bold text-white">${item.price}</span>
                        </div>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Add note...."
                      value={item.note}
                      onChange={(e) => updateNote(item.id, e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary + Actions */}
        <div className="p-5 border-t border-gray-700">
          <div className="space-y-1.5 mb-4">
            {[
              { label: "Subtotal", value: `$${subtotal.toFixed(2)}` },
              { label: "Tax", value: `$${tax.toFixed(2)}` },
              { label: "Delivery Fee", value: `$${deliveryFee.toFixed(2)}` },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm text-gray-400">
                <span>{row.label}</span>
                <span>{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-gray-700">
              <span>Total</span>
              <span>${total.toFixed(0)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setBasket([]);
                setCustomer("");
                setPhone("");
                setAddress("");
                setOrderNotes("");
              }}
              className="flex-1 border border-gray-600 text-gray-300 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                onConfirmDispatch?.({ customer, phone, address, notes: orderNotes, items: basket })
              }
              className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition"
            >
              Confirm & Dispatch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}