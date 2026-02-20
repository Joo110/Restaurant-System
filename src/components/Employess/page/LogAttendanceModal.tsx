// src/components/Staff/page/LogAttendanceModal.tsx

type Props = {
  onClose: () => void;
};

const employees = ["Ahmed Ali", "Mohamed Morsy", "Sara Mahmoud", "Karim Hassan"];

export default function LogAttendanceModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 font-sans">
        <h2 className="text-xl font-bold text-slate-900">Log Attendance Adjustment</h2>
        <div className="border-t border-slate-100 mt-4 pt-5 space-y-4">
          {/* Employee + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Employee Name<span className="text-red-500">*</span>
              </label>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none">
                <option value="">e.g. Ahmed Ali</option>
                {employees.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="dd/mm/yyy"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Check-in + Check-out */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Check-in-time</label>
              <input
                type="text"
                placeholder="--:-- --"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Check-out-time</label>
              <input
                type="text"
                placeholder="--:-- --"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Manual Adjustment Reason</label>
            <textarea
              rows={4}
              placeholder="Why this adjustment is needed....."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
            Log Adjustment
          </button>
        </div>
      </div>
    </div>
  );
}