import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Order = {
  id: string;
  table: string;
  type: "Dine in" | "Take away" | "Delivery";
  items: string[];
  note?: string;
  status?: "Completed" | "Cancelled" | "In Progress";
  timeAgo: string;
  orderItems: { name: string; qty: number; price: number }[];
  subtotal: number;
  tax: number;
  total: number;
  minsReady: number;
};

const orders: Order[] = [
  {
    id: "3918", table: "Table 04", type: "Dine in",
    items: ["2x Pepperoni Pizza (L)", "1x Cesar Salad"],
    status: "Completed", timeAgo: "12m ago",
    orderItems: [
      { name: "Cesar Salad", qty: 1, price: 16 },
      { name: "Pepperoni Pizza (L)", qty: 2, price: 36 },
      { name: "Coke zero", qty: 3, price: 9 },
    ],
    subtotal: 60.50, tax: 12.50, total: 73, minsReady: 12,
  },
  {
    id: "3918", table: "Table 04", type: "Dine in",
    items: ["2x Pepperoni Pizza (L)", "1x Cesar Salad"],
    note: "No onion on salad", timeAgo: "12m ago",
    orderItems: [
      { name: "Cesar Salad", qty: 1, price: 16 },
      { name: "Pepperoni Pizza (L)", qty: 2, price: 36 },
      { name: "Coke zero", qty: 3, price: 9 },
    ],
    subtotal: 60.50, tax: 12.50, total: 73, minsReady: 12,
  },
  {
    id: "3918", table: "Table 04", type: "Take away",
    items: ["2x Pepperoni Pizza (L)", "1x Cesar Salad"],
    note: "No onion on salad", timeAgo: "12m ago",
    orderItems: [
      { name: "Cesar Salad", qty: 1, price: 16 },
      { name: "Pepperoni Pizza (L)", qty: 2, price: 36 },
      { name: "Coke zero", qty: 3, price: 9 },
    ],
    subtotal: 60.50, tax: 12.50, total: 73, minsReady: 12,
  },
  {
    id: "3918", table: "Table 04", type: "Dine in",
    items: ["2x Pepperoni Pizza (L)", "1x Cesar Salad"],
    note: "No onion on salad", timeAgo: "12m ago",
    orderItems: [
      { name: "Cesar Salad", qty: 1, price: 16 },
      { name: "Pepperoni Pizza (L)", qty: 2, price: 36 },
      { name: "Coke zero", qty: 3, price: 9 },
    ],
    subtotal: 60.50, tax: 12.50, total: 73, minsReady: 12,
  },
  {
    id: "3918", table: "Table 04", type: "Take away",
    items: ["2x Pepperoni Pizza (L)", "1x Cesar Salad"],
    status: "Cancelled", timeAgo: "12m ago",
    orderItems: [
      { name: "Cesar Salad", qty: 1, price: 16 },
      { name: "Pepperoni Pizza (L)", qty: 2, price: 36 },
      { name: "Coke zero", qty: 3, price: 9 },
    ],
    subtotal: 60.50, tax: 12.50, total: 73, minsReady: 12,
  },
  {
    id: "3918", table: "Table 04", type: "Dine in",
    items: ["2x Pepperoni Pizza (L)", "1x Cesar Salad"],
    note: "No onion on salad", timeAgo: "12m ago",
    orderItems: [
      { name: "Cesar Salad", qty: 1, price: 16 },
      { name: "Pepperoni Pizza (L)", qty: 2, price: 36 },
      { name: "Coke zero", qty: 3, price: 9 },
    ],
    subtotal: 60.50, tax: 12.50, total: 73, minsReady: 12,
  },
];

const typeBadge: Record<string, string> = {
  "Dine in": "bg-purple-100 text-purple-700",
  "Take away": "bg-green-100 text-green-700",
  "Delivery": "bg-blue-100 text-blue-700",
};

export default function OrdersManagement() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeFilter, setActiveFilter] = useState("All Orders");
  const [search, setSearch] = useState("");

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">

      {/* Main */}
      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          {/* Filters */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </span>
              <input
                type="text"
                placeholder="Search by Order ID, Table, or Item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {["All Orders", "Take away", "Tables", "Delivery", "Drinks"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeFilter === f ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={() => navigate("/dashboard/orders/create")}
              className="ml-auto px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              + Create Order
            </button>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-2 gap-3">
            {orders.map((order, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedOrder(order)}
                className={`rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedOrder === order ? "border-blue-500 bg-blue-50/30" : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">#ORD-{order.id}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-slate-500">🍴 {order.table}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">{order.timeAgo}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeBadge[order.type]}`}>{order.type}</span>
                  </div>
                </div>
                <div className="border-t border-slate-100 my-2" />
                <div className="space-y-0.5">
                  {order.items.map((item, i) => (
                    <p key={i} className="text-sm text-slate-700">{item}</p>
                  ))}
                  {order.note && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <span>⚠</span> {order.note}
                    </p>
                  )}
                </div>
                {order.status === "Completed" && (
                  <p className="text-green-500 font-bold text-sm mt-2">Completed</p>
                )}
                {order.status === "Cancelled" && (
                  <p className="text-red-500 font-bold text-sm mt-2">Cancelled</p>
                )}
                {!order.status && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Order Detail Panel - only when selected */}
      {selectedOrder && (
        <aside className="w-72 bg-slate-900 text-white p-5 flex flex-col gap-4 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-lg">Order #{selectedOrder.id}</h2>
              <p className="text-slate-400 text-sm">{selectedOrder.minsReady} mins to be ready</p>
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
              <span className="text-sm font-semibold text-slate-300">Order Items</span>
            </div>
            <div className="space-y-2">
              {selectedOrder.orderItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-300">{item.qty}x {item.name}</span>
                  <span className="text-white font-medium">${item.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Subtotal</span><span>${selectedOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Tax</span><span>${selectedOrder.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-base">
              <span>Total</span><span className="text-blue-400">${selectedOrder.total}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl bg-slate-700 text-sm font-semibold hover:bg-slate-600 transition-colors flex items-center justify-center gap-1.5">
              🖨 Print Ticket
            </button>
            <button
              onClick={() => navigate(`/dashboard/orders/${selectedOrder.id}/edit`)}
              className="flex-1 py-2.5 rounded-xl bg-slate-700 text-sm font-semibold hover:bg-slate-600 transition-colors flex items-center justify-center gap-1.5"
            >
              ✏ Edit Order
            </button>
          </div>

          <button className="w-full py-3 rounded-xl bg-blue-500 text-sm font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
            ✓ Mark as Ready
          </button>
        </aside>
      )}
    </div>
  );
}