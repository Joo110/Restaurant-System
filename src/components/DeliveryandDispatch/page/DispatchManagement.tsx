// src/components/Dispatch/page/DispatchManagement.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ══════════════════════════════════════════════════════════════════
   Data
══════════════════════════════════════════════════════════════════ */
interface Order {
  id: string;
  customer: string;
  area: string;
  phone: string;
  time: string;
  amount: string;
  rider: string;
  status: string;
}

interface Driver {
  name: string;
  vehicle: string;
  status: string;
  deliveries: number;
}

const initOrders: Order[] = [
  { id: "ORD-9925", customer: "Ahmed Ali", area: "Gehan street villa 7", phone: "012128551", time: "12:45 PM", amount: "$25", rider: "Ahmed Adel", status: "Assigned"  },
  { id: "ORD-9926", customer: "Ahmed Ali", area: "Gehan street villa 7", phone: "012128551", time: "12:45 PM", amount: "$25", rider: "",           status: "Assigned"  },
  { id: "ORD-9927", customer: "Ahmed Ali", area: "Gehan street villa 7", phone: "012128551", time: "12:45 PM", amount: "$25", rider: "Hady Waleed", status: "Preparing" },
  { id: "ORD-9928", customer: "Ahmed Ali", area: "Gehan street villa 7", phone: "012128551", time: "12:45 PM", amount: "$25", rider: "",           status: "Assigned"  },
  { id: "ORD-9929", customer: "Ahmed Ali", area: "Gehan street villa 7", phone: "012128551", time: "12:45 PM", amount: "$25", rider: "",           status: "Assigned"  },
  { id: "ORD-9930", customer: "Ahmed Ali", area: "Gehan street villa 7", phone: "012128551", time: "12:45 PM", amount: "$25", rider: "Ahmed Adel", status: "Confirmed" },
];

const initDrivers: Driver[] = [
  { name: "Ahmed Ali", vehicle: "Scoter", status: "Present", deliveries: 1408 },
  { name: "Ahmed Ali", vehicle: "E-BIKE", status: "Busy",    deliveries: 1408 },
  { name: "Ahmed Ali", vehicle: "Scoter", status: "Offline", deliveries: 1408 },
  { name: "Ahmed Ali", vehicle: "Scoter", status: "Present", deliveries: 1408 },
];

const recentActivity = [
  { id: "#ORD-9882", action: "Delivered",        time: "2 mins ago",  by: "Rider Sam",            color: "text-green-600",  dot: "bg-green-500"  },
  { id: "#ORD-9903", action: "Out for Delivery",  time: "5 mins ago",  by: "Rider Sam",            color: "text-blue-600",   dot: "bg-blue-500"   },
  { id: "#ORD-9871", action: "Delivery Failed",   time: "12 mins ago", by: "Customer unavailable", color: "text-red-600",    dot: "bg-red-500"    },
  { id: "#ORD-9905", action: "New Order",         time: "15 mins ago", by: "from Website",         color: "text-orange-600", dot: "bg-orange-500" },
];

const statusColors: Record<string, string> = {
  Assigned:  "bg-blue-100 text-blue-700",
  Preparing: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
};

const driverStatusColors: Record<string, string> = {
  Present: "bg-green-100 text-green-700",
  Busy:    "bg-blue-100 text-blue-700",
  Offline: "bg-orange-100 text-orange-700",
};

const allRiders   = ["Assign Rider", "Ahmed Adel", "Hady Waleed", "Rider Sam"];
const allStatuses = ["Assigned", "Preparing", "Confirmed", "Delivered"];

/* ══════════════════════════════════════════════════════════════════
   Add Driver Modal
══════════════════════════════════════════════════════════════════ */
function AddDriverModal({ onClose }: { onClose: () => void }) {
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [vehicle, setVehicle] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900">Add New Driver</h2>
        <p className="text-sm text-gray-500 mt-1">Register a new delivery partner to your fleet.</p>
        <div className="border-t border-gray-200 my-5" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mohamed Morsy"
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+(20) 20522463"
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
          <input value={vehicle} onChange={e => setVehicle(e.target.value)} placeholder="e.g. Bike"
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Document upload</h3>
          <div className="grid grid-cols-2 gap-4">
            {["Driving License", "Insurance Policy"].map(doc => (
              <div key={doc}>
                <p className="text-xs font-semibold text-gray-600 mb-2">{doc}</p>
                <label className="border-2 border-dashed border-gray-300 bg-white rounded-2xl py-4 px-3 flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-xs font-medium text-gray-500">Upload PDF / JPG</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md">
            Add Driver
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Edit Order Modal  (inline — no navigation needed)
══════════════════════════════════════════════════════════════════ */
interface EditItem { name: string; quantity: number; price: number; note: string }

function EditOrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [phone,   setPhone]   = useState(order.phone);
  const [address, setAddress] = useState(order.area);
  const [notes,   setNotes]   = useState("");
  const [items,   setItems]   = useState<EditItem[]>([
    { name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
    { name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
    { name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
  ]);

  const subtotal    = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax         = 12.5;
  const deliveryFee = 7.5;
  const total       = subtotal + tax + deliveryFee;

  const updateQty  = (idx: number, d: number) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, it.quantity + d) } : it));
  const updateNote = (idx: number, note: string) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, note } : it));

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900">Edit Delivery Order</h2>
        <p className="text-sm text-gray-500 mt-1">Order ID : #{order.id}</p>
        <div className="border-t border-gray-200 my-5" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="e.g. No onions please"
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm" />
        </div>

        <div className="flex items-center justify-end mb-4">
          <button className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
            Add Items →
          </button>
        </div>

        <div className="space-y-3 mb-5">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                {/* qty control */}
                <div className="flex flex-col items-center gap-0.5 border border-gray-200 rounded-xl px-1 py-1">
                  <button onClick={() => updateQty(idx,  1)} className="text-gray-500 hover:text-blue-600 transition text-xs font-bold leading-none">+</button>
                  <span className="text-sm font-bold text-gray-800 w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(idx, -1)} className="text-gray-500 hover:text-blue-600 transition text-xs font-bold leading-none">−</button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                    <span className="text-sm font-bold text-gray-800">${item.price}</span>
                  </div>
                  <input type="text" placeholder="Add note...." value={item.note} onChange={e => updateNote(idx, e.target.value)}
                    className="w-full mt-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 space-y-2">
          {[["Subtotal", subtotal], ["Tax", tax], ["Delivery Fee", deliveryFee]].map(([l, v]) => (
            <div key={String(l)} className="flex justify-between text-sm text-gray-600">
              <span>{l}</span>
              <span className="font-semibold">${Number(v).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════════════════════ */
export default function DispatchManagement() {
  const navigate = useNavigate();

  const [search,          setSearch]          = useState("");
  const [orders,          setOrders]          = useState(initOrders);
  const [showAddDriver,   setShowAddDriver]   = useState(false);
  const [editingOrder,    setEditingOrder]    = useState<Order | null>(null);

  /* order table helpers */
  const handleRiderChange  = (i: number, rider: string)  =>
    setOrders(prev => prev.map((o, idx) => idx === i ? { ...o, rider }  : o));
  const handleStatusChange = (i: number, status: string) =>
    setOrders(prev => prev.map((o, idx) => idx === i ? { ...o, status } : o));

  const filtered = orders.filter(o =>
    [o.id, o.customer, o.area].some(f => f.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ══ Modals ═══════════════════════════════════════════════════ */}
      {showAddDriver  && <AddDriverModal  onClose={() => setShowAddDriver(false)} />}
      {editingOrder   && <EditOrderModal  order={editingOrder} onClose={() => setEditingOrder(null)} />}

      {/* ══ Header ═══════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-blue-600">Dispatch Management</h1>
          <p className="text-sm text-gray-500">Mansoura Branch</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search Order, Delivery,..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Rider Shift → /dashboard/dispatch/rider-shift */}
          <button onClick={() => navigate("/dashboard/dispatch/rider-shift")}
            className="bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition whitespace-nowrap">
            Rider Shift
          </button>

          {/* New Order → /dashboard/dispatch/new-order */}
          <button onClick={() => navigate("/dashboard/dispatch/new-order")}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition whitespace-nowrap">
            + New Order
          </button>

          {/* Add Driver → opens inline modal */}
          <button onClick={() => setShowAddDriver(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition whitespace-nowrap">
            + Add Driver
          </button>
        </div>
      </div>

      {/* ══ Body ═════════════════════════════════════════════════════ */}
      <div className="p-4 sm:p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total orders",     value: "85",      sub: "+12% vs last month", subColor: "text-green-600" },
            { label: "Active Orders",    value: "35",      bar: { filled: 35, total: 100, color: "bg-blue-500"   } },
            { label: "Out for Delivery", value: "16 / 35", bar: { filled: 16, total: 35,  color: "bg-orange-500" } },
            { label: "Delivered",        value: "50",      bar: { filled: 50, total: 85,  color: "bg-red-500"    } },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              {"sub" in stat && stat.sub && <p className={`text-xs mt-1 font-medium ${stat.subColor}`}>{stat.sub}</p>}
              {"bar" in stat && stat.bar && (
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.bar.color} rounded-full`}
                    style={{ width: `${(stat.bar.filled / stat.bar.total) * 100}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["ORDER ID","CUSTOMER","AREA","TIME","AMOUNT","PHONE NUMBER","RIDER","STATUS","ACTION"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">#{order.id}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{order.customer}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">{order.area}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{order.time}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{order.amount}</td>
                    <td className="px-4 py-3 text-gray-600">{order.phone}</td>

                    {/* Rider dropdown */}
                    <td className="px-4 py-3">
                      <select value={order.rider || "Assign Rider"} onChange={e => handleRiderChange(i, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        {allRiders.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </td>

                    {/* Status dropdown */}
                    <td className="px-4 py-3">
                      <select value={order.status} onChange={e => handleStatusChange(i, e.target.value)}
                        className={`text-xs rounded-lg px-2 py-1.5 border-0 font-medium focus:outline-none ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {allStatuses.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">

                        {/* 👁 View → OrderDetailsPage (confirm payment / mark failed) */}
                        <button
                          onClick={() => navigate(`/dashboard/dispatch/order/${order.id}`)}
                          title="View / Confirm Payment"
                          className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* ✏️ Edit → opens EditOrderModal inline */}
                        <button
                          onClick={() => setEditingOrder(order)}
                          title="Edit Order"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Showing <strong>1-6</strong> from <strong>100</strong> data</span>
            <div className="flex items-center gap-1">
              {[1,2,3].map(p => (
                <button key={p} className={`w-7 h-7 rounded-lg text-xs font-semibold ${p === 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}>{p}</button>
              ))}
              <button className="w-7 h-7 rounded-lg hover:bg-gray-100 text-gray-600 text-xs">›</button>
            </div>
          </div>
        </div>

        {/* Bottom: Drivers + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Drivers Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["DRIVER","VEHICLE TYPE","STATUS","DELIVERIES","ACTION"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {initDrivers.map((d, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{d.name}</td>
                      <td className="px-4 py-3 text-gray-600">{d.vehicle}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${driverStatusColors[d.status]}`}>{d.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{d.deliveries.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">⚡</span>
              <h3 className="font-bold text-gray-800">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.dot}`} />
                  <div>
                    <p className={`text-sm font-semibold ${item.color}`}>{item.id} {item.action}</p>
                    <p className="text-xs text-gray-400">{item.time} · {item.by}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 border border-gray-200 text-gray-600 text-xs font-semibold py-2 rounded-xl hover:bg-gray-50 transition">
              VIEW FULL AUDIT LOG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}