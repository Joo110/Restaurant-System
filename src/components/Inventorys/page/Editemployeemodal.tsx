// src/components/Staff/page/EditEmployeeModal.tsx
import { useNavigate } from "react-router-dom";

const roles  = ["Head Chef", "Sous Chef", "Waiter", "Cashier", "Manager", "Cleaner"];
const shifts = ["8 - 4", "12 - 8", "4 - 12", "Night Shift"];
const banks  = ["Cairo", "CIB", "NBE", "Banque Misr", "Alex Bank"];

const employee = {
  name:          "Mohamed Morsy",
  email:         "mohamed@gmail.com",
  phone:         "01014554447",
  address:       "122 Maadi Street",
  idNumber:      "302054555451215",
  role:          "Head Chef",
  shift:         "12 - 8",
  salary:        15000,
  bank:          "Cairo",
  accountNumber: "044445123445185",
  type:          "Full Time" as "Full Time" | "Part Time",
};

export default function EditEmployeeModal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-start sm:items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 max-h-[95vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Edit Employee profile</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-5">Modify details for {employee.name}</p>

        <div className="border-t border-slate-100 pt-5 space-y-4">

          {/* Photo + Type */}
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl">👤</div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">✏</button>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">Employee Profile</p>
              <p className="text-xs text-slate-400 mb-2">Recommended: Square image, max 2MB.</p>
              <div className="flex gap-2 justify-center">
                <button className="px-3 py-1 rounded-lg bg-blue-500 text-white text-xs font-semibold">Full Time</button>
                <button className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">Part Time</button>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              defaultValue={employee.name}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input type="email" defaultValue={employee.email} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <input type="tel" defaultValue={employee.phone} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Address + ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Residential Address</label>
              <input type="text" defaultValue={employee.address} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ID Number</label>
              <input type="text" defaultValue={employee.idNumber} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Role + Shift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select defaultValue={employee.role} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {roles.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Shift</label>
              <select defaultValue={employee.shift} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
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
                defaultValue={employee.salary}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bank + Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank</label>
              <select defaultValue={employee.bank} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {banks.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Number</label>
              <input type="text" defaultValue={employee.accountNumber} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={() => navigate("/dashboard/staff")}
            className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}