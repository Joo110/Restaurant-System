// src/components/Staff/page/ProcessPayrollModal.tsx
import { useState } from "react";

type Props = {
  onClose: () => void;
};

export default function ProcessPayrollModal({ onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1);

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
                  <p className="text-sm text-slate-600 font-medium">November 01 – November 30, 2026</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-slate-100 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">EMPLOYEES</p>
                  <p className="text-2xl font-bold text-slate-800">15</p>
                  <p className="text-xs text-green-500 font-medium mt-0.5">Ready to process</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-1">TOTAL AMOUNT</p>
                  <p className="text-2xl font-bold text-slate-800">$190,450</p>
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
                  <p className="text-sm text-slate-600 font-medium">November 01 - November 30, 2026</p>
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
                    <p className="text-xs text-slate-400">Chase Bank ******4582</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-800">$2,195.00</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setStep(1)} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                ▶ Process Payroll
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}