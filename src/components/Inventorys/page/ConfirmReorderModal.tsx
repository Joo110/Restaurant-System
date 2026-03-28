// src/components/Inventory/page/ConfirmReorderModal.tsx
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { InventoryItem } from "../services/inventoryService";
import { restockInventoryFn } from "../hook/useInventory";
import { useSuppliers } from "../../Supplier/hook/useSuppliers";
import { invalidateQuery } from "../../../hook/queryClient";

type Props = {
  item:       InventoryItem;
  onClose:    () => void;
  onSuccess?: () => void;
};

type FormState = {
  quantity:          string;
  estimatedDelivery: string;
  supplierId:        string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): FormErrors {
  const errors: FormErrors = {};
  const qty = parseFloat(f.quantity);
  if (!f.quantity || isNaN(qty) || qty <= 0)
    errors.quantity = "Quantity must be a positive number.";
  if (f.estimatedDelivery) {
    const d = new Date(f.estimatedDelivery);
    if (isNaN(d.getTime()))  errors.estimatedDelivery = "Enter a valid date.";
    else if (d < new Date()) errors.estimatedDelivery = "Delivery date must be in the future.";
  }
  return errors;
}

export default function ConfirmReorderModal({ item, onClose, onSuccess }: Props) {
  const { t } = useTranslation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inv       = item as any;
  const itemId    = inv.id     as string;
  const unit      = inv.unit   ?? "unit";
  const unitPrice = inv.lastPrice ?? 0;
  const itemName  = inv.item?.name ?? "Unknown Item";

  const [form, setForm] = useState<FormState>({
    quantity:          "15",
    estimatedDelivery: "",
    supplierId:        inv.supplier?.id ?? "",
  });
  const [errors,      setErrors]      = useState<FormErrors>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [serverError,  setServerError] = useState<string | null>(null);

  const { data: supData, isLoading: loadingSup } = useSuppliers({ limit: 100 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const suppliers: any[] = supData?.data ?? [];

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
      setErrors((p) => ({ ...p, [field]: undefined }));
    };

  const qty      = parseFloat(form.quantity) || 0;
  const subtotal = +(qty * unitPrice).toFixed(2);
  const delivery = 15;
  const total    = +(subtotal + delivery).toFixed(2);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await restockInventoryFn(itemId, {
        quantity:   qty,
        supplier:   form.supplierId || undefined,
        price:      unitPrice       || undefined,
        expiryDate: form.estimatedDelivery || null,
      });
      invalidateQuery("inventory");
      onSuccess?.();
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message ?? "Something went wrong. Please try again.";
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const fc = (err?: string) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
      err
        ? "border-red-400 focus:ring-red-400 bg-red-50"
        : "border-slate-200 focus:ring-blue-500 bg-white"
    }`;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 font-sans max-h-[90vh] overflow-y-auto">

        <h2 className="text-lg sm:text-xl font-bold text-slate-900">{t("confirmReorder")}</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-5">
          {t("reviewOrder")}{" "}
          <span className="text-blue-500 font-semibold">{itemName}</span>
        </p>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="border-t border-slate-100 pt-5 space-y-4">

            {/* Qty + Delivery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("orderQuantity")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number" min="0" step="0.01"
                    value={form.quantity} onChange={set("quantity")}
                    className={fc(errors.quantity) + " pr-10"}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    {unit}
                  </span>
                </div>
                {errors.quantity && (
                  <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("estimatedDelivery")}
                </label>
                <input
                  type="date"
                  value={form.estimatedDelivery}
                  onChange={set("estimatedDelivery")}
                  min={new Date().toISOString().split("T")[0]}
                  className={fc(errors.estimatedDelivery)}
                />
                {errors.estimatedDelivery && (
                  <p className="mt-1 text-xs text-red-500">{errors.estimatedDelivery}</p>
                )}
              </div>
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("supplier")}
              </label>
              <select
                value={form.supplierId} onChange={set("supplierId")}
                disabled={loadingSup}
                className={fc() + " text-slate-600 appearance-none"}
              >
                <option value="">
                  {loadingSup ? t("loadingSuppliers") : t("selectSupplier")}
                </option>
                {suppliers.map((s) => (
                  <option key={s.id ?? s._id} value={s.id ?? s._id}>{s.companyName}</option>
                ))}
              </select>
              {unitPrice > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  {t("unitPrice")}: ${unitPrice} / {unit}
                </p>
              )}
            </div>

            <div className="border-t-2 border-dashed border-slate-200" />

            {/* Cost breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span className="truncate pr-2">
                  {t("subtotal")} ({qty} {unit} × ${unitPrice})
                </span>
                <span className="text-slate-700 font-medium flex-shrink-0">${subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{t("deliveryFeeLabel")}</span>
                <span className="text-slate-700 font-medium">${delivery}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-slate-100">
                <span>{t("totalCost")}</span>
                <span className="text-blue-500">${total}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 justify-end">
            <button
              type="button" onClick={onClose} disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {isSubmitting ? t("placingOrder") : t("confirmOrder")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}