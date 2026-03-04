// src/components/Dispatch/page/RiderShiftSettlement.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockShiftOrders = [
  { id: "ORD-9925", time: "12:45 PM", status: "Delivered", collected: "$25", deliveryFee: "$25", commission: "-$5", netAmount: "$45" },
  { id: "ORD-9926", time: "12:45 PM", status: "Delivered", collected: "$25", deliveryFee: "$25", commission: "-$5", netAmount: "$45" },
  { id: "ORD-9927", time: "12:45 PM", status: "Failed",    collected: "$00", deliveryFee: "$00", commission: "$00", netAmount: "$00" },
  { id: "ORD-9928", time: "12:45 PM", status: "Delivered", collected: "$25", deliveryFee: "$25", commission: "-$5", netAmount: "$45" },
  { id: "ORD-9929", time: "12:45 PM", status: "Delivered", collected: "$25", deliveryFee: "$25", commission: "-$5", netAmount: "$45" },
  { id: "ORD-9930", time: "12:45 PM", status: "Delivered", collected: "$25", deliveryFee: "$25", commission: "-$5", netAmount: "$45" },
];

/* ─── Close Shift Modal ─────────────────────────────────────────── */
function CloseShiftModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const [cashAmount, setCashAmount] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900">Close Shift & Settle Finances</h2>
        <p className="text-sm text-gray-500 mt-1">
          Settlement for <strong className="text-gray-700">Mohamed Morsy</strong>
        </p>
        <div className="border-t border-gray-200 my-5" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Orders",        value: "24"      },
            { label: "Collected",     value: "$450.00" },
            { label: "Net to Submit", value: "$407.50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Cash Input */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Actual Cash Received</label>
          <div className="bg-white rounded-2xl border border-gray-200 flex items-center px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition">
            <span className="text-gray-400 text-sm mr-2">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={cashAmount}
              onChange={e => setCashAmount(e.target.value)}
              className="flex-1 text-gray-800 text-sm bg-transparent focus:outline-none"
            />
            <span className="text-gray-400 text-sm ml-2">USD</span>
          </div>
          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Enter the physical cash amount received to check for variance
          </p>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border-l-4 border-red-400 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-600">
              Closing the shift will <strong>lock all records</strong> for this period and cannot be undone. Please verify all amounts.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button onClick={onCancel}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md">
            Close shift
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function RiderShiftSettlement() {
  const navigate                      = useNavigate();
  const [page, setPage]               = useState(1);
  const [showCloseModal, setShowClose] = useState(false);

  const handleShiftClosed = () => {
    setShowClose(false);
    // After closing shift → back to dispatch main
    navigate("/dashboard/dispatch");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Close Shift Modal */}
      {showCloseModal && (
        <CloseShiftModal
          onCancel={() => setShowClose(false)}
          onConfirm={handleShiftClosed}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <nav className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <button onClick={() => navigate("/dashboard/dispatch")} className="hover:text-blue-600 transition">
              Home / Orders /
            </button>
            <span className="text-blue-600">Dispatch</span>
          </nav>
          <h1 className="text-xl font-bold text-gray-900">Rider Shift & Settlement</h1>
          <p className="text-sm text-gray-500">
            Review shift performance and settle finances for <strong>Mohamed Morsy</strong>
          </p>
        </div>
        {/* Close Shift → opens modal */}
        <button
          onClick={() => setShowClose(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition self-start sm:self-auto"
        >
          Close Shift
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Total orders</p>
            <p className="text-3xl font-bold text-gray-900">24</p>
            <p className="text-xs text-gray-500 mt-1">22 Delivered / 2 Failed</p>
            <p className="text-xs text-green-600 font-semibold mt-0.5">Success Rate: 91.6%</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Total Cash Collected</p>
            <p className="text-3xl font-bold text-gray-900">$4,250</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Commission</p>
            <p className="text-3xl font-bold text-red-500">$50-</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Net amount</p>
            <p className="text-3xl font-bold text-gray-900">4,200</p>
            <p className="text-xs text-gray-500 mt-1">After commission deduction</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["ORDER ID","TIME","STATUS","COLLECTED","DELIVERY FEE","COMMISSION","NET AMOUNT","ACTION"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockShiftOrders.map((order, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">#{order.id}</td>
                    <td className="px-4 py-3 text-gray-600">{order.time}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{order.collected}</td>
                    <td className="px-4 py-3 text-gray-700">{order.deliveryFee}</td>
                    <td className={`px-4 py-3 font-medium ${order.commission.includes("-") ? "text-red-500" : "text-gray-700"}`}>
                      {order.commission}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{order.netAmount}</td>
                    <td className="px-4 py-3">
                      {/* View order details */}
                      <button
                        onClick={() => navigate(`/dashboard/dispatch/order/${order.id}`)}
                        className="text-gray-400 hover:text-blue-600 transition p-1"
                        title="View Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Showing <strong>1-6</strong> from <strong>100</strong> data</span>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50">‹</button>
              {[1, 2, 3].map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold ${page === p ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}
                >
                  {p}
                </button>
              ))}
              <button className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}