// src/components/Staff/page/EditAttendanceModal.tsx
import { useState, useEffect } from "react";
import { updateAttendanceFn } from "../../Attendance/hooks/Useattendance";
import { invalidateQuery } from "../../../hook/queryClient";
import type { Attendance } from "../../Attendance/services/Attendanceservice";

type Props = {
  record: Attendance;
  onClose: () => void;
};

type FormFields = {
  checkIn: string;
  checkOut: string;
  status: string;
  notes: string;
};

/** Combine date "YYYY-MM-DD" + time "HH:MM" → ISO "YYYY-MM-DDTHH:MM:00Z" */
function toISODateTime(date: string, time: string): string {
  return `${date}T${time}:00Z`;
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

const inputCls = (hasError = false) =>
  `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
    hasError ? "border-red-300 bg-red-50/50 focus:ring-red-200" : "border-slate-200 bg-white focus:ring-blue-500"
  }`;

/* ─────────────────────────────────────────────────────── */
export default function EditAttendanceModal({ record, onClose }: Props) {
  const id = record._id ?? record.id ?? "";
  const empName = (record as any).employee?.fullName ?? (record as any).employeeName ?? "Employee";

  const [form, setForm]               = useState<FormFields>({ checkIn: "", checkOut: "", status: "", notes: "" });
  const [isLoading, setIsLoading]     = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);
  const [statusError, setStatusError] = useState("");

  /* Pre-fill from record */
  useEffect(() => {
    setForm({
      checkIn:  record.checkIn  ?? "",
      checkOut: record.checkOut ?? "",
      status:   record.status   ?? "present",
      notes:    record.notes    ?? "",
    });
  }, [record]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "status" && !value) setStatusError("Status is required.");
    else if (name === "status") setStatusError("");
  };

  const handleSubmit = async () => {
    if (!form.status) { setStatusError("Status is required."); return; }
    if (!id) { setGeneralError("Missing record ID."); return; }

    setGeneralError(null);
    setIsLoading(true);
    try {
      // derive the date string from the record for ISO combining
      const recDate = record.date ? record.date.split("T")[0] : new Date().toISOString().split("T")[0];

      await updateAttendanceFn(id, {
        checkIn:  form.checkIn  ? toISODateTime(recDate, form.checkIn)  : undefined,
        checkOut: form.checkOut ? toISODateTime(recDate, form.checkOut) : undefined,
        status:   form.status,
        notes:    form.notes    || undefined,
      });
      invalidateQuery("attendance");
      setSuccess(true);
      setTimeout(() => onClose(), 1200);
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
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Edit Attendance Record</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-1">
          Editing record for <span className="font-medium text-slate-600">{empName}</span>
          {record.date && <span className="ml-1">— {new Date(record.date).toLocaleDateString()}</span>}
        </p>

        {/* General error */}
        {generalError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 my-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">Error</p>
              <p className="text-xs text-red-500 mt-0.5">{generalError}</p>
            </div>
            <button onClick={() => setGeneralError(null)} className="text-red-300 hover:text-red-500">✕</button>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 my-3">
            <span className="text-green-600 font-semibold text-sm">✓ Record updated successfully!</span>
          </div>
        )}

        <div className="border-t border-slate-100 mt-4 pt-5 space-y-5">

          {/* Recorded times (read-only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Recorded Clock In</label>
              <input type="text" value={record.checkIn ?? "—"} readOnly
                className="w-full border border-slate-100 rounded-xl px-3 py-2.5 text-sm text-slate-400 bg-slate-100 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Recorded Clock Out</label>
              <input type="text" value={record.checkOut ?? "—"} readOnly
                className="w-full border border-slate-100 rounded-xl px-3 py-2.5 text-sm text-slate-400 bg-slate-100 cursor-not-allowed" />
            </div>
          </div>

          {/* Correction Details */}
          <div>
            <h3 className="text-sm font-bold text-blue-600 mb-3">Correction Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Check-in</label>
                <input name="checkIn" type="time" value={form.checkIn}
                  onChange={handleChange} className={inputCls()} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Check-out</label>
                <input name="checkOut" type="time" value={form.checkOut}
                  onChange={handleChange} className={inputCls()} />
              </div>
            </div>

            {/* Status */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status <span className="text-red-400">*</span>
              </label>
              <select name="status" value={form.status} onChange={handleChange}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all bg-white ${
                  statusError ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-blue-500 text-slate-700"
                }`}>
                <option value="">Select Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
              </select>
              <FieldError msg={statusError} />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason For Adjustment</label>
              <textarea name="notes" rows={4} value={form.notes}
                onChange={handleChange}
                placeholder="Enter the reason for this correction..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} disabled={isLoading}
            className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isLoading || success}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-70 flex items-center gap-2">
            {isLoading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {isLoading ? "Saving..." : success ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}