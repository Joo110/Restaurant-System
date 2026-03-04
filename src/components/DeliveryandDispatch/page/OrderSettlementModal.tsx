import { useState } from "react";

interface OrderSettlementModalProps {
  orderId?: string;
  totalValue?: number;
  paymentMethod?: string;
  onCancel?: () => void;
  onConfirm?: (data: { collected: number; tip: number; fullPaid: boolean }) => void;
}

export default function OrderSettlementModal({
  orderId = "1230",
  totalValue = 195,
  paymentMethod = "Cash on Delivery",
  onCancel,
  onConfirm,
}: OrderSettlementModalProps) {
  const [collected, setCollected] = useState(totalValue.toString());
  const [tip, setTip] = useState("00");
  const [fullPaid, setFullPaid] = useState(false);

  const remaining = Math.max(0, totalValue - parseFloat(collected || "0") + parseFloat(tip || "0"));

  const handleConfirm = () => {
    onConfirm?.({
      collected: parseFloat(collected || "0"),
      tip: parseFloat(tip || "0"),
      fullPaid,
    });
  };

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900">Order #{orderId} Delivered</h2>
        <p className="text-sm text-gray-500 mt-1">Complete Settlement details</p>

        <div className="border-t border-gray-200 my-5" />

        {/* Order Value & Payment */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total Order Value</p>
            <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Payment Method</p>
            <div className="flex items-center gap-2 mt-1">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-semibold text-blue-600">{paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Collected & Tip */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Collected Amount</label>
            <input
              type="number"
              value={collected}
              onChange={(e) => setCollected(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Driver Tip (Optional)</label>
            <input
              type="number"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Full Amount Toggle */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Was Full amount paid?</p>
              <p className="text-xs text-gray-500 mt-0.5">Toggle if the customer paid the exact amount</p>
            </div>
            <button
              onClick={() => setFullPaid(!fullPaid)}
              className={`relative w-12 h-6 rounded-full transition-colors ${fullPaid ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${fullPaid ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </div>
        </div>

        {/* Remaining */}
        <div className="flex items-center justify-between mb-6 px-1">
          <span className="text-sm font-medium text-gray-600">Remaining to be collected</span>
          <span className={`text-xl font-bold ${remaining === 0 ? "text-blue-600" : "text-red-500"}`}>
            ${remaining.toFixed(2)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Confirm Settlement
          </button>
        </div>
      </div>
    </div>
  );
}