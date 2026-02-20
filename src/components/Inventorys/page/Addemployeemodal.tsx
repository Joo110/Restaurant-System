// src/components/Staff/page/AddEmployeeModal.tsx

type Props = {
  onClose: () => void;
};

const roles = ["Head Chef", "Sous Chef", "Waiter", "Cashier", "Manager", "Cleaner"];
const shifts = ["8 - 4", "12 - 8", "4 - 12", "Night Shift"];
const banks = ["Cairo", "CIB", "NBE", "Banque Misr", "Alex Bank"];

export default function AddEmployeeModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 font-sans max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900">Add New Employee</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-5">Onboard a new member to the staff directory.</p>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          {/* Photo + Type */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-400 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors shrink-0">
              <span className="text-xl">📷</span>
              <span className="text-[9px] text-blue-500 font-medium mt-0.5">Upload photo</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700">Employee Profile</p>
              <p className="text-xs text-slate-400 mb-2">Recommended: Square image, max 2MB.</p>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Full Time</button>
                <button className="px-3 py-1 rounded-lg bg-blue-500 text-white text-xs font-semibold">Part Time</button>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Mohamed Morsy"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input type="email" placeholder="Enter Email Address" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <input type="tel" placeholder="Enter Phone Number" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Address + ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Residntial Address</label>
              <input type="text" placeholder="Enter Your Address" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ID Number</label>
              <input type="text" placeholder="Enter ID Number" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Role + Shift */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select Role</option>
                {roles.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Shift</label>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Enter Shift Time</option>
                {shifts.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Starting Salary (Annual)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
              <input
                type="number"
                defaultValue="15000"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bank + Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank</label>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Enter Bank Name</option>
                {banks.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Number</label>
              <input type="text" placeholder="Enter Account Number" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
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
            Save Employ
          </button>
        </div>
      </div>
    </div>
  );
}