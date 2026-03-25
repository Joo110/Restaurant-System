import { useState, useMemo } from "react";
import { createAttendanceFn } from "../../Attendance/hooks/Useattendance";
import { invalidateQuery } from "../../../hook/queryClient";
import { useEmployees as useEmployeesList } from "../../Employess/hook/Useemployees";

type Props = {
  onClose: () => void;
  branchId?: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */

type FormFields = {
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  notes: string;
};

type Errors = Partial<Record<keyof FormFields, string>>;

function validate(form: FormFields): Errors {
  const e: Errors = {};
  if (!form.employeeId) e.employeeId = "Please select an employee.";
  if (!form.date) e.date = "Date is required.";
  if (!form.status) e.status = "Please select a status.";
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
    hasError ? "border-red-300 bg-red-50/50 focus:ring-red-200" : "border-slate-200 bg-white focus:ring-blue-500"
  }`;

const selectCls = (hasError: boolean) =>
  `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all bg-white ${
    hasError
      ? "border-red-300 bg-red-50/50 focus:ring-red-200 text-red-800"
      : "border-slate-200 focus:ring-blue-500 text-slate-700"
  }`;

/** Combine date "YYYY-MM-DD" + time "HH:MM" → ISO "YYYY-MM-DDTHH:MM:00Z" */
function toISODateTime(date: string, time: string): string {
  return `${date}T${time}:00Z`;
}

/* ─────────────────────────────────────────────────────── */
export default function LogAttendanceModal({ onClose, branchId }: Props) {
  const [form, setForm] = useState<FormFields>({
    employeeId: "",
    date: "",
    checkIn: "",
    checkOut: "",
    status: "present",
    notes: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  /* fetch employees for the dropdown — scoped to branchId if available */
  const empParams = useMemo(
    () => ({
      limit: 100,
      ...(branchId ? { branchId } : {}),
    }),
    [branchId]
  );

  // ✅ هذا hook المحلي، مش react-query hook
  const { data: empData, isLoading: employeesLoading } = useEmployeesList(empParams);

  const employees: any[] = empData?.data ?? [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    if (touched[name as keyof FormFields]) {
      const newErrs = validate(updated);
      setErrors((prev) => ({ ...prev, [name]: newErrs[name as keyof FormFields] }));
    }
  };

  const handleBlur = (name: keyof FormFields) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const newErrs = validate(form);
    setErrors((prev) => ({ ...prev, [name]: newErrs[name] }));
  };

  const handleSubmit = async () => {
    const allTouched = Object.keys(form).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<keyof FormFields, boolean>
    );
    setTouched(allTouched);

    const clientErrs = validate(form);
    setErrors(clientErrs);
    if (Object.keys(clientErrs).length > 0) return;

    setGeneralError(null);
    setIsLoading(true);

    try {
      await createAttendanceFn({
        employeeId: form.employeeId,
        date: form.date,
        checkIn: form.checkIn ? toISODateTime(form.date, form.checkIn) : undefined,
        checkOut: form.checkOut ? toISODateTime(form.date, form.checkOut) : undefined,
        status: form.status,
        notes: form.notes || undefined,
        branchId: branchId,
      });

      invalidateQuery("attendance");
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Something went wrong.";
      setGeneralError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 font-sans max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Log Attendance</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-1">Record a new attendance entry.</p>

        {generalError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 my-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">Error</p>
              <p className="text-xs text-red-500 mt-0.5">{generalError}</p>
            </div>
            <button onClick={() => setGeneralError(null)} className="text-red-300 hover:text-red-500">
              ✕
            </button>
          </div>
        )}

        <div className="border-t border-slate-100 mt-4 pt-5 space-y-4">
          {/* Employee + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Employee <span className="text-red-400">*</span>
              </label>
              <select
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                onBlur={() => handleBlur("employeeId")}
                className={selectCls(!!errors.employeeId)}
                disabled={employeesLoading}
              >
                <option value="">
                  {employeesLoading ? "Loading employees..." : "Select Employee"}
                </option>
                {employees.map((emp: any) => {
                  const id = emp._id ?? emp.id ?? "";
                  return (
                    <option key={id} value={id}>
                      {emp.fullName ?? emp.name ?? id}
                    </option>
                  );
                })}
              </select>
              <FieldError msg={errors.employeeId} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                onBlur={() => handleBlur("date")}
                className={inputCls(!!errors.date)}
              />
              <FieldError msg={errors.date} />
            </div>
          </div>

          {/* Check-in + Check-out */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Check-in Time</label>
              <input
                name="checkIn"
                type="time"
                value={form.checkIn}
                onChange={handleChange}
                className={inputCls(false)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Check-out Time</label>
              <input
                name="checkOut"
                type="time"
                value={form.checkOut}
                onChange={handleChange}
                className={inputCls(false)}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Status <span className="text-red-400">*</span>
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              onBlur={() => handleBlur("status")}
              className={selectCls(!!errors.status)}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
            <FieldError msg={errors.status} />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              placeholder="Optional notes..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {isLoading ? "Saving..." : "Log Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}