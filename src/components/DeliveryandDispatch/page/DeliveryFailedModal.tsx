// src/components/Dispatch/modals/DeliveryFailedModal.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { markDispatchFailedFn } from "../hooks/useDispatches";
import { invalidateQuery } from "../../../hook/queryClient";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeliveryFailedModalProps {
  dispatchId: string;
  orderId?: string;
  onBack?: () => void;
  onSuccess?: () => void;
}

interface FormErrors {
  reason?: string;
  notes?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FAILURE_REASONS: { labelKey: string; value: string }[] = [
  { labelKey: "customerUnavailable", value: "customer-unavailable" },
  { labelKey: "wrongAddress", value: "wrong-address" },
  { labelKey: "customerRefusedDelivery", value: "customer-refused" },
  { labelKey: "itemDamaged", value: "item-damaged" },
  { labelKey: "weatherConditions", value: "weather-conditions" },
  { labelKey: "vehicleBreakdown", value: "vehicle-breakdown" },
  { labelKey: "other", value: "other" },
];

const MAX_NOTES = 500;

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(reason: string, notes: string, t: any): FormErrors {
  const errors: FormErrors = {};
  if (!reason) errors.reason = t("pleaseSelectAReasonForFailure");
  if (notes.length > MAX_NOTES) errors.notes = t("notesMustBeUnder500Characters");
  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DeliveryFailedModal({
  dispatchId,
  orderId = "—",
  onBack,
  onSuccess,
}: DeliveryFailedModalProps) {
  const { t } = useTranslation();

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const selectedLabel = FAILURE_REASONS.find(r => r.value === reason)?.labelKey ?? "";

  const handleReasonSelect = (value: string) => {
    setReason(value);
    setOpen(false);
    setErrors(prev => ({ ...prev, reason: undefined }));
    setApiError(null);
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (val.length > MAX_NOTES)
      setErrors(prev => ({ ...prev, notes: t("notesMustBeUnder500Characters") }));
    else
      setErrors(prev => ({ ...prev, notes: undefined }));
  };

  const handleSubmit = async () => {
    const errs = validate(reason, notes, t);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError(null);
    try {
      await markDispatchFailedFn(dispatchId, {
        status: "failed",
        failureReason: reason,
        failureNotes: notes.trim() || undefined,
      });
      invalidateQuery("dispatches");
      onSuccess?.();
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ??
          err?.message ??
          t("failedToMarkDispatchAsFailedPleaseTryAgain")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("deliveryFailed")}</h2>
            <p className="text-sm text-gray-500">{t("reportAnIssueWithOrder", { orderId })}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 my-5" />

        {apiError && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {apiError}
          </div>
        )}

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("reasonForFailure")}
          </label>
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm text-left flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 transition ${
                errors.reason
                  ? "border-red-400 focus:ring-red-300"
                  : reason
                  ? "border-blue-300 focus:ring-blue-500 text-gray-800"
                  : "border-gray-200 focus:ring-blue-500 text-gray-400"
              }`}
            >
              {selectedLabel ? t(selectedLabel) : t("selectAReason")}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                {FAILURE_REASONS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => handleReasonSelect(r.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition ${
                      reason === r.value ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                    }`}
                  >
                    {t(r.labelKey)}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("additionalNotes")}
            <span className="text-gray-400 font-normal ml-1">{t("optional")}</span>
          </label>
          <textarea
            placeholder={t("provideMoreDetailsAboutTheFailedDeliveryAttempt")}
            value={notes}
            onChange={e => handleNotesChange(e.target.value)}
            rows={5}
            className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 resize-none shadow-sm transition ${
              errors.notes ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
            }`}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.notes ? <p className="text-xs text-red-500">{errors.notes}</p> : <span />}
            <p className={`text-xs ml-auto ${notes.length > MAX_NOTES ? "text-red-500" : "text-gray-400"}`}>
              {notes.length}/{MAX_NOTES}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onBack}
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            {t("back")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || loading || notes.length > MAX_NOTES}
            className={`px-6 py-2.5 rounded-2xl text-white text-sm font-semibold transition shadow-md flex items-center gap-2 ${
              reason && !loading && notes.length <= MAX_NOTES
                ? "bg-red-500 hover:bg-red-600"
                : "bg-red-300 cursor-not-allowed"
            }`}
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? t("marking") : t("markAsFailed")}
          </button>
        </div>
      </div>
    </div>
  );
}