// src/components/Dispatch/page/OrderDetailsPage.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type ModalType = "settlement" | "failed" | "edit" | null;

const failureReasons = [
  "Customer unavailable",
  "Wrong address",
  "Customer refused delivery",
  "Item damaged",
  "Weather conditions",
  "Vehicle breakdown",
  "Other",
];

const timelineSteps = [
  { status: "Out For Delivery",  time: "11:35 AM", detail: "Rider is on the way",       icon: "🛵" },
  { status: "Kitchen Picked Up", time: "11:20 AM", detail: "Sarah L. collected order",  icon: "🏪" },
  { status: "Order Prepared",    time: "11:15 AM", detail: "Kitchen finished cooking",  icon: "👨‍🍳" },
  { status: "Order Confirmed",   time: "11:05 AM", detail: "Payment verified",          icon: "✅" },
];

const orderItems = [
  { name: "Truffle Fries", size: "Large Size", qty: 1, price: 8.5 },
  { name: "Truffle Fries", size: "Large Size", qty: 1, price: 8.5 },
  { name: "Truffle Fries", size: "Large Size", qty: 1, price: 8.5 },
];

/* ─── Settlement Modal ──────────────────────────────────────────── */
function SettlementModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [collected, setCollected] = useState("60");
  const [tip, setTip]             = useState("0");
  const [fullPaid, setFullPaid]   = useState(false);
  const totalValue                = 60;
  const remaining                 = Math.max(0, totalValue - parseFloat(collected || "0"));

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900">Order #{orderId} Delivered</h2>
        <p className="text-sm text-gray-500 mt-1">Complete Settlement details</p>
        <div className="border-t border-gray-200 my-5" />

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total Order Value</p>
            <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Payment Method</p>
            <p className="text-sm font-semibold text-blue-600 mt-1">💵 Cash on Delivery</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Collected Amount</label>
            <input type="number" value={collected} onChange={e => setCollected(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Driver Tip (Optional)</label>
            <input type="number" value={tip} onChange={e => setTip(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Was Full amount paid?</p>
              <p className="text-xs text-gray-500 mt-0.5">Toggle if the customer paid the exact amount</p>
            </div>
            <button onClick={() => setFullPaid(!fullPaid)}
              className={`relative w-12 h-6 rounded-full transition-colors ${fullPaid ? "bg-blue-600" : "bg-gray-300"}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${fullPaid ? "translate-x-6" : ""}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 px-1">
          <span className="text-sm font-medium text-gray-600">Remaining to be collected</span>
          <span className={`text-xl font-bold ${remaining === 0 ? "text-blue-600" : "text-red-500"}`}>
            ${remaining.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md">
            Confirm Settlement
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delivery Failed Modal ─────────────────────────────────────── */
function DeliveryFailedModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [reason, setReason]   = useState("");
  const [notes, setNotes]     = useState("");
  const [dropOpen, setDrop]   = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Delivery Failed</h2>
            <p className="text-sm text-gray-500">Report an issue with order #{orderId}</p>
          </div>
        </div>
        <div className="border-t border-gray-200 my-5" />

        <div className="mb-5 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Failure</label>
          <button onClick={() => setDrop(!dropOpen)}
            className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm text-left flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${reason ? "border-blue-300 text-gray-800" : "border-gray-200 text-gray-400"}`}>
            {reason || "Select a reason"}
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {dropOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
              {failureReasons.map(r => (
                <button key={r} onClick={() => { setReason(r); setDrop(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition ${reason === r ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"}`}>
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
          <textarea placeholder="Provide more details about the failed delivery attempt....." value={notes}
            onChange={e => setNotes(e.target.value)} rows={4}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm" />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition">
            Back
          </button>
          <button onClick={onClose} disabled={!reason}
            className={`px-6 py-2.5 rounded-2xl text-white text-sm font-semibold transition shadow-md ${reason ? "bg-red-500 hover:bg-red-600" : "bg-red-300 cursor-not-allowed"}`}>
            Mark as Failed
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit Order Modal ──────────────────────────────────────────── */
function EditOrderModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [phone, setPhone]     = useState("+(20) 0123456");
  const [address, setAddress] = useState("123 Gomhoria Street, Mansoura");
  const [notes, setNotes]     = useState("");
  const [items, setItems]     = useState(orderItems.map(i => ({ ...i, note: "" })));

  const subtotal    = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax         = 3.5;
  const deliveryFee = 21.5;
  const total       = subtotal + tax + deliveryFee;

  const updateQty  = (idx: number, d: number) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, it.qty + d) } : it));
  const updateNote = (idx: number, note: string) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, note } : it));

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900">Edit Delivery Order</h2>
        <p className="text-sm text-gray-500 mt-1">Order ID : #{orderId}</p>
        <div className="border-t border-gray-200 my-5" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Number</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea placeholder="e.g. No onions please" value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm" />
        </div>

        <div className="space-y-3 mb-5">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex flex-col items-center gap-0.5">
                  <button onClick={() => updateQty(idx, 1)}
                    className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition text-xs font-bold">+</button>
                  <span className="text-sm font-bold text-gray-800">{item.qty}</span>
                  <button onClick={() => updateQty(idx, -1)}
                    className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition text-xs font-bold">−</button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                    <span className="text-sm font-bold text-gray-800">${item.price.toFixed(2)}</span>
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
              <span>{l}</span><span className="font-semibold">${Number(v).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span><span>${total.toFixed(2)}</span>
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

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function OrderDetailsPage() {
  const navigate          = useNavigate();
  const { id }            = useParams<{ id: string }>();
  const orderId           = id ?? "2025";
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Modals */}
      {modal === "settlement" && <SettlementModal    orderId={orderId} onClose={() => setModal(null)} />}
      {modal === "failed"     && <DeliveryFailedModal orderId={orderId} onClose={() => setModal(null)} />}
      {modal === "edit"       && <EditOrderModal      orderId={orderId} onClose={() => setModal(null)} />}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <nav className="text-xs text-gray-400 mb-1 flex items-center gap-1">
          <button onClick={() => navigate("/dashboard/dispatch")} className="hover:text-blue-600 transition">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/dashboard/dispatch")} className="hover:text-blue-600 transition">Orders</button>
          <span>/</span>
          <span className="text-blue-600">Order Details</span>
        </nav>
        <h1 className="text-lg font-bold text-blue-600">Dispatch Overview</h1>
        <p className="text-sm text-gray-500">Mansoura Branch</p>
      </div>

      <div className="p-4 sm:p-6 space-y-5">

        {/* Order Header */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">🛵</div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">#ORD-{orderId}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">• Out For Delivery</span>
              </div>
              <p className="text-xs text-gray-500">Placed on Oct 24, 2023 at 11:05 AM</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setModal("edit")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition">
              ✏️ Edit Order
            </button>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">$60.00</p>
            </div>
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Customer & Delivery */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-xl mb-4">
              📍 Customer & Delivery
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-base font-bold text-gray-900">Mohamed Morsy</p>
                <p className="text-xs text-gray-500">Frequent Customer (12 orders)</p>
              </div>
              {[
                { icon: "📞", label: "CONTACT NUMBER",   value: "+(20) 0123456" },
                { icon: "📍", label: "DELIVERY ADDRESS", value: "123 Gomhoria Street, Mansoura, Ahmed Maher" },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="text-base flex-shrink-0 mt-0.5">{row.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{row.label}</p>
                    <p className="text-sm text-gray-800">{row.value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <span className="text-base flex-shrink-0 mt-0.5">💳</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">PAYMENT METHOD</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-800">Card •••• 1234</p>
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-md font-semibold">PAID</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-xl">
                📋 Order Items
              </div>
              <span className="bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg">3 Items</span>
            </div>
            <div className="grid grid-cols-3 text-xs font-bold text-white bg-gray-900 rounded-xl px-3 py-2 mb-3">
              <span>ITEM</span><span className="text-center">QTY</span><span className="text-right">PRICE</span>
            </div>
            <div className="space-y-2 mb-4">
              {orderItems.map((item, i) => (
                <div key={i} className="grid grid-cols-3 text-sm px-3 py-2 hover:bg-gray-50 rounded-xl transition">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.size}</p>
                  </div>
                  <p className="text-center text-gray-600 self-center">{item.qty}</p>
                  <p className="text-right font-semibold text-gray-800 self-center">${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 rounded-xl p-3 mb-4 border border-blue-100">
              <p className="text-xs font-bold text-blue-700 mb-1">KITCHEN NOTES</p>
              <p className="text-xs text-blue-700 italic">"No onions on the burgers please. Customer has mild allergy."</p>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-gray-100">
              {[["Subtotal","$25.50"],["Tax (10%)","$3.50"],["Delivery Fee","$21.50"]].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm text-gray-600">
                  <span>{l}</span><span>{v}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span><span className="text-blue-600">$60.00</span>
              </div>
            </div>
          </div>

          {/* Rider & Timeline */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-xl mb-4">
              ⏱ Rider & Timeline
            </div>
            <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between mb-5 border border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Sarah L.</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-xs text-gray-600 font-semibold">4.9</span>
                  <span className="text-xs text-gray-400">• 1,204 Deliveries</span>
                </div>
              </div>
              <button className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition text-lg">📞</button>
            </div>

            <div className="relative space-y-3 mb-5">
              {timelineSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm flex-shrink-0">{step.icon}</div>
                    {i < timelineSteps.length - 1 && <div className="w-0.5 h-5 bg-blue-200 mt-1" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600">{step.status}</p>
                    <p className="text-xs text-gray-500">{step.time} • {step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Action Buttons ── */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-700 font-semibold hover:bg-gray-50 transition">
                  🖨 Receipt
                </button>
                <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-700 font-semibold hover:bg-gray-50 transition">
                  💬 Contact
                </button>
              </div>

              {/* ✅ Confirm Settlement */}
              <button onClick={() => setModal("settlement")}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
                ✅ Confirm Settlement
              </button>

              {/* ❌ Mark as Failed */}
              <button onClick={() => setModal("failed")}
                className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-red-100 transition">
                ❌ Mark as Failed
              </button>

              {/* Cancel Order → back to dispatch */}
              <button onClick={() => navigate("/dashboard/dispatch")}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-500 rounded-xl py-2 text-xs font-semibold hover:bg-gray-50 transition">
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}