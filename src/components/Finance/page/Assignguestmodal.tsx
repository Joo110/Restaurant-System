// src/components/Tables/AssignGuestModal.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { assignTableFn, reserveTableFn } from "../../Tables/hook/useTables";
import { invalidateQuery } from "../../../hook/queryClient";

interface AssignGuestModalProps {
  isOpen: boolean;
  tableId: string; // table number for display
  realId: string; // actual DB id for API call
  onClose: () => void;
  onConfirm: (data: { guestName: string; guests: number; waiterId: string }) => void;
}

type FormErrors = {
  guestName?: string;
  customerPhone?: string;
  reservedFor?: string;
  general?: string;
};

const WAITERS = ["Mohamed Morsy", "Ahmed Hassan", "Sara Ali", "Omar Khaled"];
const GUEST_COUNT = [1, 2, 3, 4, 5, 6, 7, 8];
const ASSIGN_MODES = ["assignNow", "reserve"] as const;
type AssignMode = typeof ASSIGN_MODES[number];

export default function AssignGuestModal({
  isOpen,
  tableId,
  realId,
  onClose,
  onConfirm,
}: AssignGuestModalProps) {
  const { t } = useTranslation();

  const [mode, setMode] = useState<AssignMode>("assignNow");
  const [guestName, setGuestName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [guests, setGuests] = useState(1);
  const [waiterId, setWaiterId] = useState("");
  const [reservedFor, setReservedFor] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!guestName.trim()) e.guestName = t("guestNameIsRequired");
    else if (guestName.trim().length < 2) e.guestName = t("nameMustBeAtLeast2Characters");

    if (customerPhone && !/^[+\d\s\-()]{7,20}$/.test(customerPhone))
      e.customerPhone = t("enterAValidPhoneNumber");

    if (mode === "reserve" && !reservedFor) e.reservedFor = t("pleaseSelectAReservationDateAndTime");

    return e;
  };

  const reset = () => {
    setGuestName("");
    setCustomerPhone("");
    setGuests(1);
    setWaiterId("");
    setReservedFor("");
    setErrors({});
    setMode("assignNow");
  };

  const handleConfirm = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    try {
      if (mode === "reserve") {
        await reserveTableFn(realId, {
          customerName: guestName.trim(),
          customerPhone: customerPhone.trim(),
          reservedFor: new Date(reservedFor).toISOString(),
        });
      } else {
        await assignTableFn(realId, {
          customerName: guestName.trim(),
          customerPhone: customerPhone.trim(),
        });
      }
      invalidateQuery("tables");
      onConfirm({ guestName: guestName.trim(), guests, waiterId });
      reset();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? t("somethingWentWrong");
      setErrors(p => ({ ...p, general: msg }));
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (hasError?: string) =>
    `w-full appearance-none px-4 py-3 rounded-xl border text-slate-700 text-sm focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-red-300 bg-red-50/50 focus:ring-red-200"
        : "border-slate-200 bg-white focus:ring-blue-500"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-blue-50 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900">
          {mode === "reserve" ? t("reserveTable") : t("assignGuest")}
        </h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          {mode === "reserve" ? t("reserve") : t("assignAGuestTo")} {tableId}
        </p>

        <div className="flex gap-2 mb-5">
          {ASSIGN_MODES.map(m => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setErrors({});
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                mode === m
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t(m)}
            </button>
          ))}
        </div>

        <div className="h-px bg-slate-200 mb-5" />

        {errors.general && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t("guestName")} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder={t("enterGuestName")}
            value={guestName}
            onChange={e => {
              setGuestName(e.target.value);
              if (errors.guestName) setErrors(p => ({ ...p, guestName: undefined }));
            }}
            className={inputCls(errors.guestName)}
          />
          {errors.guestName && <p className="text-xs text-red-500 mt-1.5">⚠ {errors.guestName}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t("phoneNumber")}
          </label>
          <input
            type="tel"
            placeholder={t("phonePlaceholder")}
            value={customerPhone}
            onChange={e => {
              setCustomerPhone(e.target.value);
              if (errors.customerPhone) setErrors(p => ({ ...p, customerPhone: undefined }));
            }}
            className={inputCls(errors.customerPhone)}
          />
          {errors.customerPhone && <p className="text-xs text-red-500 mt-1.5">⚠ {errors.customerPhone}</p>}
        </div>

        {mode === "reserve" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("reservedFor")} <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={reservedFor}
              onChange={e => {
                setReservedFor(e.target.value);
                if (errors.reservedFor) setErrors(p => ({ ...p, reservedFor: undefined }));
              }}
              className={inputCls(errors.reservedFor)}
            />
            {errors.reservedFor && <p className="text-xs text-red-500 mt-1.5">⚠ {errors.reservedFor}</p>}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t("numberOfGuests")}
          </label>
          <div className="relative">
            <select
              value={guests}
              onChange={e => setGuests(Number(e.target.value))}
              className={`${inputCls()} pr-10 appearance-none`}
            >
              {GUEST_COUNT.map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▾</span>
          </div>
        </div>

        {mode === "assignNow" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("assignWaiter")}
            </label>
            <div className="relative">
              <select
                value={waiterId}
                onChange={e => setWaiterId(e.target.value)}
                className={`${inputCls()} pr-10 appearance-none`}
              >
                <option value="">{t("selectAWaiter")}</option>
                {WAITERS.map(w => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▾</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {isLoading ? t("saving") : mode === "reserve" ? t("confirmReservation") : t("confirmAssignment")}
          </button>
        </div>
      </div>
    </div>
  );
}