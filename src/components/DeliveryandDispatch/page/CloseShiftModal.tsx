// src/components/Dispatch/modals/CloseShiftModal.tsx
import { useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ────────────────────────────────────────────────────────────────────

interface CloseShiftModalProps {
  driverName?: string;
  orders?: number;
  collected?: number;
  netToSubmit?: number;
  onCancel?: () => void;
  onClose?: (cashAmount: number) => Promise<void> | void;
}

interface FormErrors {
  cashAmount?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(cashAmount: string): FormErrors {
  const errors: FormErrors = {};
  const val = cashAmount.trim();

  if (!val) {
    errors.cashAmount = "Please enter the actual cash amount received";
    return errors;
  }
  if (isNaN(Number(val))) {
    errors.cashAmount = "Enter a valid number";
    return errors;
  }
  if (Number(val) < 0) {
    errors.cashAmount = "Amount cannot be negative";
    return errors;
  }
  if (Number(val) > 999_999) {
    errors.cashAmount = "Amount seems too high — please verify";
    return errors;
  }

  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CloseShiftModal({
  driverName  = "Mohamed Morsy",
  orders      = 24,
  collected   = 450,
  netToSubmit = 407.5,
  onCancel,
  onClose,
}: CloseShiftModalProps) {
  const [cashAmount, setCashAmount] = useState("");
  const [errors,     setErrors]     = useState<FormErrors>({});
  const [loading,    setLoading]    = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);

  const cashNum  = parseFloat(cashAmount) || 0;
  const variance = cashAmount.trim() ? cashNum - netToSubmit : null;

  const handleConfirm = async () => {
    const errs = validate(cashAmount);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setApiError(null);
    try {
      await onClose?.(cashNum);
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ??
        err?.message ??
        "Failed to close shift. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900">Close Shift & Settle Finances</h2>
        <p className="text-sm text-gray-500 mt-1">
          Settlement for <strong className="text-gray-700">{driverName}</strong>
        </p>

        <div className="border-t border-gray-200 my-5" />

        {/* API Error */}
        {apiError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {apiError}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Orders",        value: String(orders) },
            { label: "Collected",     value: `$${collected.toFixed(2)}` },
            { label: "Net to Submit", value: `$${netToSubmit.toFixed(2)}` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Cash Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Actual Cash Received</label>
          <div className={`bg-white rounded-2xl border flex items-center px-4 py-3 shadow-sm transition
            focus-within:ring-2
            ${errors.cashAmount
              ? "border-red-400 focus-within:ring-red-300"
              : "border-gray-200 focus-within:ring-blue-500 focus-within:border-blue-500"
            }`}
          >
            <span className="text-gray-400 text-sm mr-2">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={cashAmount}
              onChange={e => {
                setCashAmount(e.target.value);
                if (errors.cashAmount) {
                  const errs = validate(e.target.value);
                  setErrors(errs);
                }
                setApiError(null);
              }}
              onBlur={() => setErrors(validate(cashAmount))}
              className="flex-1 text-gray-800 text-sm bg-transparent focus:outline-none"
            />
            <span className="text-gray-400 text-sm ml-2">USD</span>
          </div>
          {errors.cashAmount && (
            <p className="text-xs text-red-500 mt-1">{errors.cashAmount}</p>
          )}
          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Enter the physical cash amount received to check for variance
          </p>
        </div>

        {/* Variance Badge */}
        {variance !== null && !errors.cashAmount && (
          <div className={`mb-5 rounded-xl px-4 py-3 flex items-center justify-between text-sm font-semibold transition-all ${
            variance === 0
              ? "bg-green-50 border border-green-200 text-green-700"
              : variance > 0
              ? "bg-blue-50 border border-blue-200 text-blue-700"
              : "bg-red-50 border border-red-200 text-red-600"
          }`}>
            <span className="flex items-center gap-1.5">
              {variance === 0 && "✅ Exact match — no variance"}
              {variance  > 0 && `⬆ Surplus of $${variance.toFixed(2)}`}
              {variance  < 0 && `⬇ Shortage of $${Math.abs(variance).toFixed(2)}`}
            </span>
            <span className="text-lg font-bold">
              ${Math.abs(variance).toFixed(2)}
            </span>
          </div>
        )}

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
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-60 flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? "Closing..." : "Close Shift"}
          </button>
        </div>
      </div>
    </div>
  );
}