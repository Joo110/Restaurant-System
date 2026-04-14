import { useState } from "react";
import { useTranslation } from "react-i18next";

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (table: { tableNumber: string; seats: number; area: string; branchId?: string }) => Promise<void> | void;
  branchId?: string;
  branchName?: string;
}

type FormErrors = {
  tableNumber?: string;
  seats?: string;
  area?: string;
  general?: string;
};

export default function AddTableModal({
  isOpen,
  onClose,
  onAdd,
  branchId,
  branchName,
}: AddTableModalProps) {
  const { t } = useTranslation();

  const AREAS = [
    { value: "indoor", label: t("tables.addTableModal.areas.indoor") },
    { value: "outdoor", label: t("tables.addTableModal.areas.outdoor") },
  ];

  const [tableNumber, setTableNumber] = useState("");
  const [seats, setSeats] = useState("");
  const [area, setArea] = useState("indoor");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    const k = "tables.addTableModal.errors";

    if (!tableNumber.trim()) e.tableNumber = t(`${k}.tableNumberRequired`);
    else if (tableNumber.trim().length < 2) e.tableNumber = t(`${k}.tableNumberTooShort`);

    if (!seats.trim()) e.seats = t(`${k}.seatsRequired`);
    else if (isNaN(Number(seats)) || Number(seats) <= 0) e.seats = t(`${k}.seatsInvalid`);
    else if (Number(seats) > 50) e.seats = t(`${k}.seatsTooMany`);

    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    try {
      await onAdd({
        tableNumber: tableNumber.trim().toUpperCase(),
        seats: parseInt(seats),
        area,
        ...(branchId ? { branchId } : {}),
      });

      setTableNumber("");
      setSeats("");
      setArea("indoor");
      setErrors({});
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? t("tables.addTableModal.errors.failed");
      setErrors((prev) => ({ ...prev, general: msg }));
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (hasError?: string) =>
    `w-full px-4 py-3 rounded-xl border text-slate-700 text-sm focus:outline-none focus:ring-2 transition-all ${
      hasError ? "border-red-300 bg-red-50/50 focus:ring-red-200" : "border-slate-200 bg-white focus:ring-blue-500"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-blue-50 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900">{t("tables.addTableModal.title")}</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">{t("tables.addTableModal.subtitle")}</p>

        <div className="h-px bg-slate-200 mb-6" />

        {/* General Error */}
        {errors.general && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Branch info */}
        {branchId && (
          <div className="flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-xl px-3 py-2 mb-4">
            <span className="text-blue-600 text-xs">📍</span>
            <p className="text-xs text-blue-700 font-medium">
              {t("tables.addTableModal.branch")}: {branchName ?? branchId}
            </p>
          </div>
        )}

        {/* Table Number + Seats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("tables.addTableModal.tableNumber")}{" "}
              <span className="text-red-400">{t("tables.addTableModal.required")}</span>
            </label>
            <input
              type="text"
              placeholder={t("tables.addTableModal.tableNumberPlaceholder")}
              value={tableNumber}
              onChange={(e) => {
                setTableNumber(e.target.value);
                if (errors.tableNumber) setErrors((p) => ({ ...p, tableNumber: undefined }));
              }}
              className={inputCls(errors.tableNumber)}
            />
            {errors.tableNumber && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <span>⚠</span> {errors.tableNumber}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("tables.addTableModal.seats")}{" "}
              <span className="text-red-400">{t("tables.addTableModal.required")}</span>
            </label>
            <input
              type="number"
              placeholder={t("tables.addTableModal.seatsPlaceholder")}
              value={seats}
              min={1}
              max={50}
              onChange={(e) => {
                setSeats(e.target.value);
                if (errors.seats) setErrors((p) => ({ ...p, seats: undefined }));
              }}
              className={inputCls(errors.seats)}
            />
            {errors.seats && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <span>⚠</span> {errors.seats}
              </p>
            )}
          </div>
        </div>

        {/* Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {t("tables.addTableModal.area")}
          </label>
          <div className="relative">
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            >
              {AREAS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▾</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              setErrors({});
            }}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {t("tables.addTableModal.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" d="M4 12a8 8 0 018-8v8z" fill="currentColor" />
              </svg>
            )}
            {isLoading ? t("tables.addTableModal.creating") : t("tables.addTableModal.createTable")}
          </button>
        </div>
      </div>
    </div>
  );
}