// src/components/Staff/page/EditAttendanceModal.tsx

type Props = {
  onClose: () => void;
};

export default function EditAttendanceModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 font-sans max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Edit Attendance Record</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-1">Edit Attendance Record For Mohamed Morsy</p>

        <div className="border-t border-slate-100 mt-4 pt-5 space-y-5">
          {/* Recorded times (read-only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Recorded Clock In</label>
              <input
                type="text"
                defaultValue="2"
                readOnly
                className="w-full border border-slate-100 rounded-xl px-3 py-2.5 text-sm text-slate-400 bg-slate-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Recorded Clock out</label>
              <input
                type="text"
                defaultValue="8"
                readOnly
                className="w-full border border-slate-100 rounded-xl px-3 py-2.5 text-sm text-slate-400 bg-slate-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Correction Details */}
          <div>
            <h3 className="text-sm font-bold text-blue-600 mb-3">Correction Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Check-in</label>
                <input
                  type="text"
                  placeholder="--:-- --"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Check-out</label>
                <input
                  type="text"
                  placeholder="--:-- --"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason For Adjustment</label>
              <textarea
                rows={4}
                placeholder="Enter The Reason"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
            Log Adjustment
          </button>
        </div>
      </div>
    </div>
  );
}