// src/components/Staff/page/EditEmployeeModal.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEmployee, updateEmployeeFn } from "../../Employess/hook/Useemployees";
import { invalidateQuery } from "../../../hook/queryClient";

const roles       = ["Head Chef", "Sous Chef", "Waiter", "Cashier", "Manager", "Cleaner"];
const banks       = ["Cairo", "CIB", "NBE", "Banque Misr", "Alex Bank"];
const departments = ["kitchen", "hr", "cashier", "waiters", "management", "cleaning"];

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type FormFields = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  department: string;
  startDate: string;
  currentSalary: string;
  bonus: string;
  bankName: string;
  accountNumber: string;
};

type FieldKey = keyof FormFields;
type Errors   = Partial<Record<FieldKey, string>>;

/* ─────────────────────────────────────────
   API error parser
───────────────────────────────────────── */
function parseApiErrors(err: unknown): { fieldErrors: Errors; generalError: string | null } {
  const fieldErrors: Errors = {};
  let generalError: string | null = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (err as any)?.response?.data ?? (err as any)?.data ?? err;
    const list = data?.errors;

    if (Array.isArray(list) && list.length > 0) {
      const pathMap: Record<string, FieldKey> = {
        fullName:       "fullName",
        email:          "email",
        phone:          "phone",
        address:        "address",
        position:       "position",
        department:     "department",
        startDate:      "startDate",
        currentSalary:  "currentSalary",
        startingSalary: "currentSalary",
        bonus:          "bonus",
        bankAccount:    "bankName",
        accountNumber:  "accountNumber",
      };

      list.forEach((e: { path?: string; msg?: string }) => {
        if (e.path && e.msg) {
          const key = pathMap[e.path];
          if (key && !fieldErrors[key]) {
            fieldErrors[key] = e.msg;
          } else if (!key && !generalError) {
            generalError = e.msg ?? null;
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

/* ─────────────────────────────────────────
   Client-side validation
───────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-()]{7,20}$/;

function validate(form: FormFields): Errors {
  const e: Errors = {};
  if (!form.fullName.trim())
    e.fullName = "Full name is required.";
  else if (form.fullName.trim().length < 3)
    e.fullName = "Name must be at least 3 characters.";
  if (form.email && !EMAIL_RE.test(form.email))
    e.email = "Enter a valid email address.";
  if (form.phone && !PHONE_RE.test(form.phone))
    e.phone = "Enter a valid phone number.";
  if (!form.position)
    e.position = "Please select a role.";
  if (!form.department)
    e.department = "Please select a department.";
  if (!form.currentSalary || isNaN(Number(form.currentSalary)))
    e.currentSalary = "Enter a valid salary amount.";
  else if (Number(form.currentSalary) < 0)
    e.currentSalary = "Salary cannot be negative.";
  if (form.bonus && (isNaN(Number(form.bonus)) || Number(form.bonus) < 0))
    e.bonus = "Enter a valid bonus amount.";
  if (form.accountNumber && form.accountNumber.replace(/\s/g, "").length < 8)
    e.accountNumber = "Account number seems too short.";
  return e;
}

/* ─────────────────────────────────────────
   UI helpers
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export default function EditEmployeeModal() {
  const navigate          = useNavigate();
  const { id }            = useParams<{ id: string }>();
  const { data: emp, isLoading, isError } = useEmployee(id ?? "");

  const fileInputRef                        = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl]         = useState<string | null>(null);
  const [profileImage, setProfileImage]     = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [generalError, setGeneralError]     = useState<string | null>(null);
  const [success, setSuccess]               = useState(false);
  const [errors, setErrors]                 = useState<Errors>({});
  const [touched, setTouched]               = useState<Partial<Record<FieldKey, boolean>>>({});
  const [ready, setReady]                   = useState(false);  // true after first prefill

  const [form, setForm] = useState<FormFields>({
    fullName: "", email: "", phone: "", address: "",
    position: "", department: "", startDate: "",
    currentSalary: "", bonus: "", bankName: "", accountNumber: "",
  });

  /* ── Pre-fill all fields from API ── */
  useEffect(() => {
    if (!emp || ready) return;

    // DEBUG: remove after confirming data loads correctly
    console.log("EditEmployeeModal - emp data:", emp);

    // format date to YYYY-MM-DD for <input type="date">
    const fmtDate = (d?: string) => {
      if (!d) return "";
      try { return new Date(d).toISOString().split("T")[0]; }
      catch { return ""; }
    };

/* eslint-disable @typescript-eslint/no-explicit-any */


    // handle address: string | { street: string } | undefined
    const resolveAddress = () => {
      if (!emp.address) return "";
      if (typeof emp.address === "string") return emp.address;
      if (typeof emp.address === "object") return (emp.address as any).street ?? "";
      return "";
    };

    setForm({
      fullName:      emp.fullName ?? "",
      email:         emp.email ?? "",
      phone:         emp.phone ?? "",
      address:       resolveAddress(),
      position:      emp.position ?? "",
      department:    emp.department ?? "",
      startDate:     fmtDate(emp.startDate),
      currentSalary: emp.currentSalary
                       ? String(emp.currentSalary)
                       : emp.startingSalary
                       ? String(emp.startingSalary)
                       : "",
      bonus:         emp.bonus ? String(emp.bonus) : "",
      bankName:      emp.bankAccount?.name ?? "",
      accountNumber: emp.bankAccount?.accountNumber ?? "",
    });

    if (emp.profileImage) setPreviewUrl(emp.profileImage);
    setReady(true);
  }, [emp, ready]);

  /* ── Handlers ── */
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
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await updateEmployeeFn(id!, {
        position:      form.position || undefined,
        currentSalary: form.currentSalary ? Number(form.currentSalary) : undefined,
        bonus:         form.bonus ? Number(form.bonus) : undefined,
        profileImage:  profileImage ?? undefined,
      });
      invalidateQuery("employees");
      setSuccess(true);
      setTimeout(() => navigate("/dashboard/staff"), 1400);
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
      setIsSubmitting(false);
    }
  };

  /* ── Loading / Error states ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading employee...
        </div>
      </div>
    );
  }

  if (isError || !emp) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <p className="text-slate-400 text-sm">Employee not found.</p>
      </div>
    );
  }

  const visibleErrCount = Object.values(errors).filter(Boolean).length;
  const anyTouched      = Object.keys(touched).length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex items-start sm:items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 max-h-[95vh] overflow-y-auto">

        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Edit Employee Profile</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-5">
          Modify details for <span className="font-medium text-slate-600">{emp.fullName}</span>
        </p>

        {/* ── Validation summary ── */}
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
                {visibleErrCount} {visibleErrCount === 1 ? "field requires" : "fields require"} your attention
              </p>
              <p className="text-xs text-red-400 mt-0.5">Fix the highlighted fields below before saving.</p>
            </div>
          </div>
        )}

        {/* ── General / API error ── */}
        {generalError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">Something went wrong</p>
              <p className="text-xs text-red-500 mt-0.5">{generalError}</p>
            </div>
            <button onClick={() => setGeneralError(null)}
              className="text-red-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-100 shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Success ── */}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-700">Profile updated successfully!</p>
              <p className="text-xs text-green-500 mt-0.5">Redirecting back to staff list…</p>
            </div>
          </div>
        )}

        <div className="border-t border-slate-100 pt-5 space-y-4">

          {/* Photo */}
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl overflow-hidden cursor-pointer ring-2 ring-offset-2 ring-blue-200 hover:ring-blue-400 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl
                  ? <img src={previewUrl} alt="profile" className="w-full h-full object-cover" />
                  : <span>👤</span>
                }
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 transition-colors shadow">
                ✏
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">{emp.fullName}</p>
              <p className="text-xs text-slate-400">Click to change photo · Max 2MB</p>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input name="fullName" type="text" placeholder="e.g. Mohamed Morsy"
              value={form.fullName} onChange={handleChange} onBlur={() => handleBlur("fullName")}
              className={inputCls(!!errors.fullName)} />
            <FieldError msg={errors.fullName} />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input name="email" type="email" placeholder="name@company.com"
                value={form.email} onChange={handleChange} onBlur={() => handleBlur("email")}
                className={inputCls(!!errors.email)} />
              <FieldError msg={errors.email} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <input name="phone" type="tel" placeholder="+20 1XX XXX XXXX"
                value={form.phone} onChange={handleChange} onBlur={() => handleBlur("phone")}
                className={inputCls(!!errors.phone)} />
              <FieldError msg={errors.phone} />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Residential Address</label>
            <input name="address" type="text" placeholder="Street, City"
              value={form.address} onChange={handleChange} onBlur={() => handleBlur("address")}
              className={inputCls(!!errors.address)} />
            <FieldError msg={errors.address} />
          </div>

          {/* Role + Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Role / Position <span className="text-red-400">*</span>
              </label>
              <select name="position" value={form.position}
                onChange={handleChange} onBlur={() => handleBlur("position")}
                className={selectCls(!!errors.position)}>
                <option value="">Select Role</option>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <FieldError msg={errors.position} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Department <span className="text-red-400">*</span>
              </label>
              <select name="department" value={form.department}
                onChange={handleChange} onBlur={() => handleBlur("department")}
                className={selectCls(!!errors.department)}>
                <option value="">Select Department</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <FieldError msg={errors.department} />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
            <input name="startDate" type="date"
              value={form.startDate} onChange={handleChange} onBlur={() => handleBlur("startDate")}
              className={inputCls(!!errors.startDate)} />
            <FieldError msg={errors.startDate} />
          </div>

          {/* Salary + Bonus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Current Salary <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium ${errors.currentSalary ? "text-red-400" : "text-slate-400"}`}>$</span>
                <input name="currentSalary" type="number" placeholder="0"
                  value={form.currentSalary} onChange={handleChange} onBlur={() => handleBlur("currentSalary")}
                  className={`${inputCls(!!errors.currentSalary)} pl-8`} />
              </div>
              <FieldError msg={errors.currentSalary} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bonus</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium ${errors.bonus ? "text-red-400" : "text-slate-400"}`}>$</span>
                <input name="bonus" type="number" placeholder="0"
                  value={form.bonus} onChange={handleChange} onBlur={() => handleBlur("bonus")}
                  className={`${inputCls(!!errors.bonus)} pl-8`} />
              </div>
              <FieldError msg={errors.bonus} />
            </div>
          </div>

          {/* Bank + Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank</label>
              <select name="bankName" value={form.bankName}
                onChange={handleChange} onBlur={() => handleBlur("bankName")}
                className={selectCls(!!errors.bankName)}>
                <option value="">Select Bank</option>
                {banks.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <FieldError msg={errors.bankName} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Number</label>
              <input name="accountNumber" type="text" placeholder="Enter account number"
                value={form.accountNumber} onChange={handleChange} onBlur={() => handleBlur("accountNumber")}
                className={inputCls(!!errors.accountNumber)} />
              <FieldError msg={errors.accountNumber} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <button type="button" onClick={() => navigate("/dashboard/staff")} disabled={isSubmitting}
            className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting || success}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-70 flex items-center gap-2">
            {isSubmitting && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {isSubmitting ? "Saving..." : success ? "Saved ✓" : "Update Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}