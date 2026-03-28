// src/components/Inventory/page/AddSupplierModal.tsx
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { createSupplierFn } from "../hook/useSuppliers";
import { invalidateQuery } from "../../../hook/queryClient";
import type { CreateSupplierDTO } from "../services/supplierService";

type Props = {
  onClose:    () => void;
  onSuccess?: () => void;
};

type FormErrors = Partial<Record<keyof CreateSupplierDTO | "bankName" | "accountNumber", string>>;

const BANKS = ["Cairo", "CIB", "NBE", "Banque Misr", "Alex Bank"];

function validateForm(values: {
  companyName:   string;
  mainContact:   string;
  email:         string;
  supportPhone:  string;
  website:       string;
  officeAddress: string;
  categories:    string;
  bankName:      string;
  accountNumber: string;
}): FormErrors {
  const errors: FormErrors = {};
  if (!values.companyName.trim())  errors.companyName  = "Supplier company is required.";
  if (!values.mainContact.trim())  errors.mainContact  = "Main contact is required.";
  if (!values.email.trim())        errors.email        = "Business email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";
  if (values.supportPhone && !/^\+?[\d\s\-()]{7,20}$/.test(values.supportPhone.trim()))
    errors.supportPhone = "Enter a valid phone number.";
  if (values.website && !/^https?:\/\/.+/.test(values.website.trim()))
    errors.website = "Website must start with http:// or https://";
  return errors;
}

export default function AddSupplierModal({ onClose, onSuccess }: Props) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    companyName:   "",
    mainContact:   "",
    email:         "",
    supportPhone:  "",
    website:       "",
    officeAddress: "",
    categories:    "",
    bankName:      "",
    accountNumber: "",
  });

  const [errors,       setErrors]       = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError,  setServerError]  = useState<string | null>(null);

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: CreateSupplierDTO = {
      companyName:   form.companyName.trim(),
      mainContact:   form.mainContact.trim()   || undefined,
      email:         form.email.trim()         || undefined,
      supportPhone:  form.supportPhone.trim()  || undefined,
      website:       form.website.trim()       || undefined,
      officeAddress: form.officeAddress.trim() || undefined,
      categories:    form.categories.trim()    || undefined,
      bank:
        form.bankName || form.accountNumber
          ? { name: form.bankName || undefined, accountNumber: form.accountNumber || undefined }
          : undefined,
    };

    setIsSubmitting(true);
    try {
      await createSupplierFn(payload);
      invalidateQuery("suppliers");
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Something went wrong. Please try again.";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (error?: string) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
      error
        ? "border-red-400 focus:ring-red-400 bg-red-50"
        : "border-slate-200 focus:ring-blue-500 bg-white"
    }`;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 font-sans max-h-[90vh] overflow-y-auto">

        <h2 className="text-xl font-bold text-slate-900">{t("addSupplierTitle")}</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-5">{t("addSupplierSubtitle")}</p>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="border-t border-slate-100 pt-5 space-y-4">

            {/* Supplier Company */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("supplierCompany")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={form.companyName} onChange={set("companyName")}
                placeholder="e.g. Dina flour"
                className={fieldClass(errors.companyName)}
              />
              {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>}
            </div>

            {/* Main Contact + Business Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("mainContact")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" value={form.mainContact} onChange={set("mainContact")}
                  placeholder="e.g. Ahmed Ali"
                  className={fieldClass(errors.mainContact)}
                />
                {errors.mainContact && <p className="mt-1 text-xs text-red-500">{errors.mainContact}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("businessEmail")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email" value={form.email} onChange={set("email")}
                  placeholder="contact@supplier.com"
                  className={fieldClass(errors.email)}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>

            {/* Support Phone + Website */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("supportPhone")}
                </label>
                <input
                  type="tel" value={form.supportPhone} onChange={set("supportPhone")}
                  placeholder="+20 0000000000"
                  className={fieldClass(errors.supportPhone)}
                />
                {errors.supportPhone && <p className="mt-1 text-xs text-red-500">{errors.supportPhone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("website")}
                </label>
                <input
                  type="text" value={form.website} onChange={set("website")}
                  placeholder="https://"
                  className={fieldClass(errors.website)}
                />
                {errors.website && <p className="mt-1 text-xs text-red-500">{errors.website}</p>}
              </div>
            </div>

            {/* Office Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("officeAddress")}
              </label>
              <textarea
                rows={3} value={form.officeAddress} onChange={set("officeAddress")}
                placeholder="e.g. Dakahlia, Metghamr, Dahab street, Building 4,"
                className={fieldClass(errors.officeAddress) + " resize-none"}
              />
            </div>

            <div className="border-t-2 border-dashed border-slate-200" />

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("categories")}
              </label>
              <textarea
                rows={3} value={form.categories} onChange={set("categories")}
                placeholder="e.g. Flour / Salt / Ketchup / Milk"
                className={fieldClass(errors.categories) + " resize-none"}
              />
              <p className="mt-1 text-xs text-slate-400">{t("separateCategories")}</p>
            </div>

            <div className="border-t-2 border-dashed border-slate-200" />

            {/* Bank + Account Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("bank")}</label>
                <select
                  value={form.bankName} onChange={set("bankName")}
                  className={fieldClass(errors.bankName) + " text-slate-700"}
                >
                  <option value="">{t("selectBank")}</option>
                  {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t("accountNumber")}
                </label>
                <input
                  type="text" value={form.accountNumber} onChange={set("accountNumber")}
                  placeholder={t("enterAccountNumber")}
                  className={fieldClass(errors.accountNumber)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 justify-end">
            <button
              type="button" onClick={onClose} disabled={isSubmitting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-60 flex items-center gap-2 justify-center"
            >
              {isSubmitting && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {isSubmitting ? t("adding") : t("addNewSupplier")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}