import { useState } from "react";

interface CloseShiftModalProps {
  driverName?: string;
  orders?: number;
  collected?: string;
  netToSubmit?: string;
  onCancel?: () => void;
  onClose?: (cashAmount: string) => void;
}

export default function CloseShiftModal({
  driverName = "Mohamed Morsy",
  orders = 24,
  collected = "$450.00",
  netToSubmit = "$407.50",
  onCancel,
  onClose,
}: CloseShiftModalProps) {
  const [cashAmount, setCashAmount] = useState("");

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900">Close Shift & Settle Finances</h2>
        <p className="text-sm text-gray-500 mt-1">
          Settlement for <strong className="text-gray-700">{driverName}</strong>
        </p>

        <div className="border-t border-gray-200 my-5" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Collected</p>
            <p className="text-xl font-bold text-gray-900">{collected}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Net to Submit</p>
            <p className="text-xl font-bold text-gray-900">{netToSubmit}</p>
          </div>
        </div>

        {/* Cash Input */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Actual Cash Received</label>
          <div className="bg-white rounded-2xl border border-gray-200 flex items-center px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
            <span className="text-gray-400 text-sm mr-2">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
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

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onClose?.(cashAmount)}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Close shift
          </button>
        </div>
      </div>
    </div>
  );
}