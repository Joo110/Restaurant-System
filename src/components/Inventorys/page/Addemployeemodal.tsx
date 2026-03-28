import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { createEmployeeFn } from "../../Employess/hook/Useemployees";
import { invalidateQuery } from "../../../hook/queryClient";

type Props = {
  onClose: () => void;
  branchId?: string;
};

const roles       = ["Head Chef", "Sous Chef", "Waiter", "Cashier", "Manager", "Cleaner"];
const banks       = ["Cairo", "CIB", "NBE", "Banque Misr", "Alex Bank"];
const departments = ["kitchen", "hr", "cashier", "waiters", "management", "cleaning"];

type FormFields = {
  fullName:       string;
  email:          string;
  phone:          string;
  address:        string;
  position:       string;
  department:     string;
  startDate:      string;
  startingSalary: string;
  bankName:       string;
  accountNumber:  string;
};

type FieldKey = keyof FormFields;
type Errors   = Partial<Record<FieldKey, string>>;

function isObjectId(value?: string) {
  return !!value && /^[a-f\d]{24}$/i.test(value);
}

function parseApiErrors(err: unknown): { fieldErrors: Errors; generalError: string | null } {
  const fieldErrors: Errors = {};
  let generalError: string | null = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (err as any)?.response?.data ?? (err as any)?.data ?? err;
    const list = data?.errors;

    if (Array.isArray(list) && list.length > 0) {
      list.forEach((e: { path?: string; msg?: string }) => {
        if (e.path && e.msg) {
          const map: Record<string, FieldKey> = {
            phone:          "phone",
            email:          "email",
            fullName:       "fullName",
            position:       "position",
            department:     "department",
            startDate:      "startDate",
            startingSalary: "startingSalary",
            address:        "address",
            bankAccount:    "bankName",
            accountNumber:  "accountNumber",
          };
          const key = map[e.path];
          if (key) {
            if (!fieldErrors[key]) fieldErrors[key] = e.msg;
          } else {
            if (!generalError) generalError = e.msg ?? null;
          }
        }
      });
    } else if (data?.message) {
      generalError = data.message;
    } else if (err instanceof Error) {
      generalError = err.message;
    }
  } catch {
    generalError = "Something went wrong. Please try again.";
  }

  return { fieldErrors, generalError };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-()]{7,20}$/;

function validate(form: FormFields): Errors {
  const e: Errors = {};
  if (!form.fullName.trim())                           e.fullName       = "Full name is required.";
  else if (form.fullName.trim().length < 3)            e.fullName       = "Name must be at least 3 characters.";
  if (form.email && !EMAIL_RE.test(form.email))        e.email          = "Enter a valid email address.";
  if (form.phone && !PHONE_RE.test(form.phone))        e.phone          = "Enter a valid phone number.";
  if (!form.position)                                  e.position       = "Please select a role.";
  if (!form.department)                                e.department     = "Please select a department.";
  if (!form.startDate)                                 e.startDate      = "Start date is required.";
  if (!form.startingSalary || isNaN(Number(form.startingSalary))) e.startingSalary = "Enter a valid salary amount.";
  else if (Number(form.startingSalary) < 0)            e.startingSalary = "Salary cannot be negative.";
  if (form.accountNumber && form.accountNumber.replace(/\s/g, "").length < 8)
    e.accountNumber = "Account number seems too short.";
  return e;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0">
        <circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.5" />
        <path d="M8 5v3M8 10.5h.01" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="text-xs text-red-500 leading-tight">{msg}</span>
    </div>
  );
}

const inputCls = (hasError: boolean) =>
  `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? "border-red-300 bg-red-50/50 focus:ring-red-200 placeholder-red-300"
      : "border-slate-200 bg-white focus:ring-blue-500"
  }`;

const selectCls = (hasError: boolean) =>
  `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all bg-white ${
    hasError
      ? "border-red-300 bg-red-50/50 focus:ring-red-200 text-red-800"
      : "border-slate-200 focus:ring-blue-500 text-slate-700"
  }`;

export default function AddEmployeeModal({ onClose, branchId }: Props) {
  const { t } = useTranslation();

  const fileInputRef                            = useRef<HTMLInputElement>(null);
  const [previewUrl,      setPreviewUrl]        = useState<string | null>(null);
  const [profileImage,    setProfileImage]      = useState<File | null>(null);
  const [employmentType,  setEmploymentType]    = useState<"Full Time" | "Part Time">("Full Time");
  const [isLoading,       setIsLoading]         = useState(false);
  const [generalError,    setGeneralError]      = useState<string | null>(null);
  const [errors,          setErrors]            = useState<Errors>({});
  const [touched,         setTouched]           = useState<Partial<Record<FieldKey, boolean>>>({});

  const [form, setForm] = useState<FormFields>({
    fullName:       "",
    email:          "",
    phone:          "",
    address:        "",
    position:       "",
    department:     "",
    startDate:      "",
    startingSalary: "15000",
    bankName:       "",
    accountNumber:  "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (touched[name as FieldKey]) {
      const newErrs = validate(updated);
      setErrors((prev) => ({ ...prev, [name]: newErrs[name as FieldKey] }));
    }
  };

  const handleBlur = (name: FieldKey) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const newErrs = validate(form);
    setErrors((prev) => ({ ...prev, [name]: newErrs[name] }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setGeneralError("Image must be under 2MB."); return; }
    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const allTouched = Object.keys(form).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<FieldKey, boolean>
    );
    setTouched(allTouched);
    const clientErrs = validate(form);
    setErrors(clientErrs);
    if (Object.keys(clientErrs).length > 0) return;

    setGeneralError(null);
    setIsLoading(true);

    try {
      const payload = {
        fullName:       form.fullName,
        email:          form.email    || undefined,
        phone:          form.phone    || undefined,
        address:        form.address  ? { street: form.address } : undefined,
        position:       form.position   || undefined,
        department:     form.department || undefined,
        startDate:      form.startDate  || undefined,
        startingSalary: Number(form.startingSalary),
        bankAccount:
          form.bankName || form.accountNumber
            ? { name: form.bankName, accountNumber: form.accountNumber }
            : undefined,
        profileImage: profileImage ?? undefined,
        ...(isObjectId(branchId) ? { branchId } : {}),
      };

      await createEmployeeFn(payload as any); // eslint-disable-line
      invalidateQuery("employees");
      onClose();
    } catch (err: unknown) {
      const { fieldErrors, generalError: gErr } = parseApiErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        const newTouched = Object.keys(fieldErrors).reduce(
          (acc, k) => ({ ...acc, [k]: true }),
          {} as Record<FieldKey, boolean>
        );
        setTouched((prev) => ({ ...prev, ...newTouched }));
      }
      setGeneralError(gErr);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleErrCount = Object.values(errors).filter(Boolean).length;
  const anyTouched      = Object.keys(touched).length > 0;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 font-sans max-h-[90vh] overflow-y-auto">

        <h2 className="text-lg sm:text-xl font-bold text-slate-900">{t("addNewEmployee")}</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-5">{t("onboardMember")}</p>

        {/* Validation summary */}
        {visibleErrCount > 0 && anyTouched && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3L14.5 13.5H1.5L8 3Z" stroke="#ef4444" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M8 7v2.5M8 11.5h.01" stroke="#ef4444" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">
                {visibleErrCount}{" "}
                {visibleErrCount === 1 ? t("fieldRequiresAttention") : t("fieldsRequireAttention")}
              </p>
              <p className="text-xs text-red-400 mt-0.5">{t("fixHighlightedFields")}</p>
            </div>
          </div>
        )}

        {/* General error */}
        {generalError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">{t("somethingWentWrong")}</p>
              <p className="text-xs text-red-500 mt-0.5">{generalError}</p>
            </div>
            <button
              onClick={() => setGeneralError(null)}
              className="text-red-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-100 shrink-0"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        <div className="border-t border-slate-100 pt-5 space-y-4">

          {/* Photo + Employment Type */}
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-blue-300 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors shrink-0 overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="text-xl">📷</span>
                  <span className="text-[9px] text-blue-500 font-medium mt-0.5">Upload</span>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700">{t("profilePhoto")}</p>
              <p className="text-xs text-slate-400 mb-2">{t("squareImageMax")}</p>
              <div className="flex gap-2">
                {(["Full Time", "Part Time"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEmploymentType(type)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      employmentType === type
                        ? "bg-blue-500 text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {type === "Full Time" ? t("fullTime") : t("partTime")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("fullName")} <span className="text-red-400">*</span>
            </label>
            <input
              name="fullName" type="text" placeholder="e.g. Mohamed Morsy"
              value={form.fullName} onChange={handleChange} onBlur={() => handleBlur("fullName")}
              className={inputCls(!!errors.fullName)}
            />
            <FieldError msg={errors.fullName} />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("emailAddress")}</label>
              <input
                name="email" type="email" placeholder="name@company.com"
                value={form.email} onChange={handleChange} onBlur={() => handleBlur("email")}
                className={inputCls(!!errors.email)}
              />
              <FieldError msg={errors.email} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("phoneNumber")}</label>
              <input
                name="phone" type="tel" placeholder="+20 1XX XXX XXXX"
                value={form.phone} onChange={handleChange} onBlur={() => handleBlur("phone")}
                className={inputCls(!!errors.phone)}
              />
              <FieldError msg={errors.phone} />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("residentialAddress")}</label>
            <input
              name="address" type="text" placeholder="Street, City"
              value={form.address} onChange={handleChange} onBlur={() => handleBlur("address")}
              className={inputCls(!!errors.address)}
            />
            <FieldError msg={errors.address} />
          </div>

          {/* Role + Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("rolePosition")} <span className="text-red-400">*</span>
              </label>
              <select
                name="position" value={form.position}
                onChange={handleChange} onBlur={() => handleBlur("position")}
                className={selectCls(!!errors.position)}
              >
                <option value="">{t("selectRole")}</option>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <FieldError msg={errors.position} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("department")} <span className="text-red-400">*</span>
              </label>
              <select
                name="department" value={form.department}
                onChange={handleChange} onBlur={() => handleBlur("department")}
                className={selectCls(!!errors.department)}
              >
                <option value="">{t("selectDepartment")}</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <FieldError msg={errors.department} />
            </div>
          </div>

          {/* Start Date + Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("startDate")} <span className="text-red-400">*</span>
              </label>
              <input
                name="startDate" type="date"
                value={form.startDate} onChange={handleChange} onBlur={() => handleBlur("startDate")}
                className={inputCls(!!errors.startDate)}
              />
              <FieldError msg={errors.startDate} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("startingSalary")} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium ${errors.startingSalary ? "text-red-400" : "text-slate-400"}`}>
                  $
                </span>
                <input
                  name="startingSalary" type="number" placeholder="0"
                  value={form.startingSalary} onChange={handleChange} onBlur={() => handleBlur("startingSalary")}
                  className={`${inputCls(!!errors.startingSalary)} pl-8`}
                />
              </div>
              <FieldError msg={errors.startingSalary} />
            </div>
          </div>

          {/* Bank + Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("bank")}</label>
              <select
                name="bankName" value={form.bankName}
                onChange={handleChange} onBlur={() => handleBlur("bankName")}
                className={selectCls(!!errors.bankName)}
              >
                <option value="">{t("selectBank")}</option>
                {banks.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <FieldError msg={errors.bankName} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{t("accountNumber")}</label>
              <input
                name="accountNumber" type="text" placeholder="Enter account number"
                value={form.accountNumber} onChange={handleChange} onBlur={() => handleBlur("accountNumber")}
                className={inputCls(!!errors.accountNumber)}
              />
              <FieldError msg={errors.accountNumber} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <button
            type="button" onClick={onClose} disabled={isLoading}
            className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button" onClick={handleSubmit} disabled={isLoading}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {isLoading ? t("saving") : t("saveEmployee")}
          </button>
        </div>
      </div>
    </div>
  );
}