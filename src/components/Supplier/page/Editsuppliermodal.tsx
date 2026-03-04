// src/components/Inventory/page/EditSupplierModal.tsx
import { useState, useEffect, type FormEvent } from "react";
import { getSupplierByIdFn } from "../hook/useSuppliers";
import { invalidateQuery } from "../../../hook/queryClient";
import type { Supplier } from "../services/supplierService";
import api from "../../../lib/axios";

type Props = {
  supplier: Supplier;
  onClose: () => void;
  onSuccess?: () => void;
};

type FormState = {
  companyName: string;
  mainContact: string;
  email: string;
  supportPhone: string;
  website: string;
  officeAddress: string;
  categories: string;
  bankName: string;
  accountNumber: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const BANKS = ["Cairo", "CIB", "NBE", "Banque Misr", "Alex Bank"];

function supplierToForm(s: Supplier): FormState {
  return {
    companyName: s.companyName ?? "",
    mainContact: s.mainContact ?? "",
    email: s.email ?? "",
    supportPhone: s.supportPhone ?? "",
    website: s.website ?? "",
    officeAddress: s.officeAddress ?? "",
    categories:
      Array.isArray(s.categories)
        ? (s.categories as string[]).join(" / ")
        : (s.categories as string) ?? "",
    bankName: s.bank?.name ?? "",
    accountNumber: s.bank?.accountNumber ?? "",
  };
}

function validateForm(values: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!values.companyName.trim())
    errors.companyName = "Supplier company is required.";

  if (!values.mainContact.trim())
    errors.mainContact = "Main contact is required.";

  if (!values.email.trim()) {
    errors.email = "Business email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (values.supportPhone && !/^\+?[\d\s\-()]{7,20}$/.test(values.supportPhone.trim())) {
    errors.supportPhone = "Enter a valid phone number.";
  }

  if (values.website && !/^https?:\/\/.+/.test(values.website.trim())) {
    errors.website = "Website must start with http:// or https://";
  }

  return errors;
}

export default function EditSupplierModal({ supplier, onClose, onSuccess }: Props) {
  const supplierId = (supplier.id ?? supplier._id) as string;

  const [form, setForm] = useState<FormState>(supplierToForm(supplier));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoadingFresh, setIsLoadingFresh] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Fetch fresh supplier data when modal opens
  useEffect(() => {
    let cancelled = false;
    setIsLoadingFresh(true);
    getSupplierByIdFn(supplierId)
      .then((res) => {
        if (!cancelled) {
          // API returns { message, data: {...} } — unwrap if needed
          const fresh = (res as { data?: Supplier }).data ?? res;
          setForm(supplierToForm(fresh as Supplier));
        }
      })
      .catch(() => {
        // Fall back to the data we already have — form already pre-filled
      })
      .finally(() => {
        if (!cancelled) setIsLoadingFresh(false);
      });
    return () => { cancelled = true; };
  }, [supplierId]);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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

    const payload = {
      companyName: form.companyName.trim(),
      mainContact: form.mainContact.trim() || undefined,
      email: form.email.trim() || undefined,
      supportPhone: form.supportPhone.trim() || undefined,
      website: form.website.trim() || undefined,
      officeAddress: form.officeAddress.trim() || undefined,
      categories: form.categories.trim() || undefined,
      bank:
        form.bankName || form.accountNumber
          ? {
              name: form.bankName || undefined,
              accountNumber: form.accountNumber || undefined,
            }
          : undefined,
    };

    setIsSubmitting(true);
    try {
      await api.patch(`/suppliers/${supplierId}`, payload);
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
        <h2 className="text-xl font-bold text-slate-900">Edit Supplier Details</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-5">
          Update existing partner information and configuration
        </p>

        {isLoadingFresh && (
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
            <svg className="animate-spin w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Fetching latest data...
          </div>
        )}

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
                Supplier Company<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={set("companyName")}
                className={fieldClass(errors.companyName)}
              />
              {errors.companyName && (
                <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>
              )}
            </div>

            {/* Main Contact + Business Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Main Contact<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.mainContact}
                  onChange={set("mainContact")}
                  className={fieldClass(errors.mainContact)}
                />
                {errors.mainContact && (
                  <p className="mt-1 text-xs text-red-500">{errors.mainContact}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Business Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  className={fieldClass(errors.email)}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Support Phone + Website */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Support Phone
                </label>
                <input
                  type="tel"
                  value={form.supportPhone}
                  onChange={set("supportPhone")}
                  className={fieldClass(errors.supportPhone)}
                />
                {errors.supportPhone && (
                  <p className="mt-1 text-xs text-red-500">{errors.supportPhone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={set("website")}
                  className={fieldClass(errors.website)}
                />
                {errors.website && (
                  <p className="mt-1 text-xs text-red-500">{errors.website}</p>
                )}
              </div>
            </div>

            {/* Office Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Office Address
              </label>
              <textarea
                rows={3}
                value={form.officeAddress}
                onChange={set("officeAddress")}
                className={fieldClass(errors.officeAddress) + " resize-none"}
              />
            </div>

            <div className="border-t-2 border-dashed border-slate-200" />

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Categories</label>
              <textarea
                rows={3}
                value={form.categories}
                onChange={set("categories")}
                className={fieldClass(errors.categories) + " resize-none"}
              />
              <p className="mt-1 text-xs text-slate-400">Separate multiple categories with " / "</p>
            </div>

            <div className="border-t-2 border-dashed border-slate-200" />

            {/* Bank + Account Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank</label>
                <select
                  value={form.bankName}
                  onChange={set("bankName")}
                  className={fieldClass(errors.bankName) + " text-slate-700"}
                >
                  <option value="">Select a bank</option>
                  {BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  value={form.accountNumber}
                  onChange={set("accountNumber")}
                  className={fieldClass(errors.accountNumber)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingFresh}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-60 flex items-center gap-2 justify-center"
            >
              {isSubmitting && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}