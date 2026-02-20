// src/components/Staff/page/AddExtraShiftModal.tsx

type Props = {
  onClose: () => void;
  employeeName?: string;
};

export default function AddExtraShiftModal({ onClose, employeeName = "Mohamed Morsy" }: Props) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 font-sans">
        <h2 className="text-xl font-bold text-slate-900">Add Extra Shift</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-5">Add Extra Shift For {employeeName}</p>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Start + End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start</label>
              <input
                type="text"
                placeholder="--:-- --"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">End</label>
              <input
                type="text"
                placeholder="--:-- --"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Manager's Note */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Manager's Note</label>
            <textarea
              rows={4}
              placeholder="Reason for  extra shift"
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
            Add Extra Shift
          </button>
        </div>
      </div>
    </div>
  );
}