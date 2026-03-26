// src/components/Dispatch/modals/OrderSettlementModal.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { updateDispatchStatusFn } from "../hooks/useDispatches";
import { invalidateQuery } from "../../../hook/queryClient";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderSettlementModalProps {
  dispatchId: string;
  orderId?: string;
  totalValue?: number;
  paymentMethod?: string;
  onCancel?: () => void;
  onSuccess?: (data: SettlementData) => void;
}

interface SettlementData {
  collected: number;
  tip: number;
  fullPaid: boolean;
}

interface FormErrors {
  collected?: string;
  tip?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(collected: string, tip: string, totalValue: number, t: any): FormErrors {
  const errors: FormErrors = {};
  const collectedNum = parseFloat(collected);
  const tipNum = parseFloat(tip || "0");

  if (!collected.trim()) {
    errors.collected = t("collectedAmountIsRequired");
  } else if (isNaN(collectedNum)) {
    errors.collected = t("enterAValidNumber");
  } else if (collectedNum < 0) {
    errors.collected = t("amountCannotBeNegative");
  } else if (collectedNum > totalValue * 2) {
    errors.collected = t("amountSeemsTooHighExpectedAround", { amount: totalValue.toFixed(2) });
  }

  if (tip.trim() && (isNaN(tipNum) || tipNum < 0)) {
    errors.tip = t("tipMustBeAPositiveNumber");
  }

  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderSettlementModal({
  dispatchId,
  orderId = "1230",
  totalValue = 195,
  paymentMethod = "Cash on Delivery",
  onCancel,
  onSuccess,
}: OrderSettlementModalProps) {
  const { t } = useTranslation();

  const [collected, setCollected] = useState(totalValue.toString());
  const [tip, setTip] = useState("");
  const [fullPaid, setFullPaid] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({ collected: false, tip: false });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const collectedNum = parseFloat(collected) || 0;
  const tipNum = parseFloat(tip) || 0;
  const remaining = Math.max(0, totalValue - collectedNum);

  const handleCollectedChange = (val: string) => {
    setCollected(val);
    setApiError(null);
    if (touched.collected) {
      const errs = validate(val, tip, totalValue, t);
      setErrors(prev => ({ ...prev, collected: errs.collected }));
    }
  };

  const handleTipChange = (val: string) => {
    setTip(val);
    setApiError(null);
    if (touched.tip) {
      const errs = validate(collected, val, totalValue, t);
      setErrors(prev => ({ ...prev, tip: errs.tip }));
    }
  };

  const handleConfirm = async () => {
    setTouched({ collected: true, tip: true });
    const errs = validate(collected, tip, totalValue, t);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError(null);
    try {
      await updateDispatchStatusFn(dispatchId, { status: "delivered" });
      invalidateQuery("dispatches");
      onSuccess?.({ collected: collectedNum, tip: tipNum, fullPaid });
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ??
          err?.message ??
          t("failedToConfirmSettlementPleaseTryAgain")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("orderDelivered", { orderId })}
        </h2>
        <p className="text-sm text-gray-500 mt-1">{t("completeSettlementDetails")}</p>

        <div className="border-t border-gray-200 my-5" />

        {apiError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{t("totalOrderValue")}</p>
            <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{t("paymentMethod")}</p>
            <div className="flex items-center gap-2 mt-1">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-semibold text-blue-600">{t("cashOnDelivery")}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("collectedAmount")}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={collected}
              onChange={e => handleCollectedChange(e.target.value)}
              onBlur={() => {
                setTouched(prev => ({ ...prev, collected: true }));
                setErrors(validate(collected, tip, totalValue, t));
              }}
              className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm text-gray-800
                focus:outline-none focus:ring-2 shadow-sm transition
                ${errors.collected ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"}`}
            />
            {errors.collected && <p className="text-xs text-red-500 mt-1">{errors.collected}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("driverTip")}
              <span className="text-gray-400 font-normal ml-1">{t("optional")}</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={tip}
              onChange={e => handleTipChange(e.target.value)}
              onBlur={() => {
                setTouched(prev => ({ ...prev, tip: true }));
                setErrors(validate(collected, tip, totalValue, t));
              }}
              className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm text-gray-800
                focus:outline-none focus:ring-2 shadow-sm transition placeholder-gray-400
                ${errors.tip ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"}`}
            />
            {errors.tip && <p className="text-xs text-red-500 mt-1">{errors.tip}</p>}
          </div>
        </div>

        {tipNum > 0 && !errors.tip && (
          <div className="mb-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm text-green-700 font-medium">
            🎉 {t("driverTipSummary", { tip: tipNum.toFixed(2), total: (collectedNum + tipNum).toFixed(2) })}
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">{t("wasFullAmountPaid")}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t("toggleIfTheCustomerPaidTheExactAmount")}</p>
            </div>
            <button
              onClick={() => setFullPaid(!fullPaid)}
              className={`relative w-12 h-6 rounded-full transition-colors ${fullPaid ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  fullPaid ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 px-1">
          <span className="text-sm font-medium text-gray-600">{t("remainingToBeCollected")}</span>
          <span className={`text-xl font-bold ${remaining === 0 ? "text-blue-600" : "text-red-500"}`}>
            ${remaining.toFixed(2)}
          </span>
        </div>

        {!errors.collected && collected && collectedNum !== totalValue && (
          <div
            className={`mb-4 rounded-xl px-4 py-2.5 text-sm font-medium ${
              collectedNum > totalValue
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
            }`}
          >
            {collectedNum > totalValue
              ? t("collectedMoreThanTotal", { amount: (collectedNum - totalValue).toFixed(2) })
              : t("shortBy", { amount: (totalValue - collectedNum).toFixed(2) })}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            {t("cancel")}
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
            {loading ? t("confirming") : t("confirmSettlement")}
          </button>
        </div>
      </div>
    </div>
  );
}