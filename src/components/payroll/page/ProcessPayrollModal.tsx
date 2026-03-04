import { useState } from "react";
import { processPayrollFn } from "../hook/usePayroll";
import { invalidateQuery } from "../../../hook/queryClient";

type Props = {
  onClose: () => void;
  totalAmount?: number; // مقدار الرواتب الإجمالي لعرضه في المودال
  defaultMonth?: number;
  defaultYear?: number;
  defaultBranchId?: string;
};

export default function ProcessPayrollModal({
  onClose,
  totalAmount,
  defaultMonth,
  defaultYear,
  defaultBranchId,
}: Props) {
  const now = new Date();
  const [step, setStep] = useState<1 | 2>(1);
  const [month, setMonth] = useState<number>(defaultMonth ?? (now.getMonth() + 1));
  const [year, setYear] = useState<number>(defaultYear ?? now.getFullYear());
  const [branchId, setBranchId] = useState<string | undefined>(defaultBranchId ?? undefined);
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    setLoading(true);
    try {
      // نمرر month, year, branchId و totalAmount كحقل إضافي في الـ body
      await processPayrollFn({ month, year, branchId, amount: totalAmount });
      // invalidate ليجلب القائمة من جديد
      invalidateQuery("payroll");
      // خطوة ناجحة - نقفل المودال
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to process payroll. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-6 font-sans max-h-[90vh] overflow-y-auto">
        {step === 1 ? (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Process Payroll</h2>
            <div className="border-t border-slate-100 mt-4 pt-5 space-y-4">
              {/* Confirmed Pay Period */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-blue-500 text-lg">📅</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Confirmed Pay Period</p>
                  <p className="text-sm text-slate-600 font-medium">{`${month} / ${year}`}</p>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500">Month</label>
                <input
                  type="number"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <label className="text-xs text-slate-500">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <label className="text-xs text-slate-500">Branch ID (optional)</label>
                <input
                  type="text"
                  value={branchId ?? ""}
                  onChange={(e) => setBranchId(e.target.value || undefined)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-slate-100 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">EMPLOYEES</p>
                  <p className="text-2xl font-bold text-slate-800">—</p>
                  <p className="text-xs text-green-500 font-medium mt-0.5">Ready to process</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">TOTAL AMOUNT</p>
                  <p className="text-2xl font-bold text-slate-800">${totalAmount?.toLocaleString() ?? "—"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Est. Net Pay</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={onClose} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                ▶ Process Payroll
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Process Payroll</h2>
            <div className="border-t border-slate-100 mt-4 pt-5 space-y-4">
              {/* Confirmed Pay Period */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-blue-500 text-lg">📅</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Confirmed Pay Period</p>
                  <p className="text-sm text-slate-600 font-medium">{`${month} / ${year}`}</p>
                </div>
              </div>

              {/* Net Pay */}
              <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-blue-500 text-lg">🏦</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-500">Net Pay</p>
                    <p className="text-xs text-slate-400">Total to pay</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-800">${totalAmount?.toLocaleString() ?? "—"}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setStep(1)} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                Back
              </button>
              <button
                onClick={handleProcess}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-60"
              >
                {loading ? "Processing…" : "▶ Confirm & Process"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}