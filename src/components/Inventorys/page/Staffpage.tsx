// src/components/Staff/page/StaffPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddEmployeeModal from "./Addemployeemodal";

export type Employee = {
  id: number;
  name: string;
  jobTitle: string;
  shift: string;
  status: "Active" | "Off";
};

const mockEmployees: Employee[] = [
  { id: 1, name: "Mohamed Morsy", jobTitle: "Head Chef", shift: "12 : 08", status: "Active" },
  { id: 2, name: "Mohamed Morsy", jobTitle: "Head Chef", shift: "12 : 08", status: "Active" },
  { id: 3, name: "Mohamed Morsy", jobTitle: "Head Chef", shift: "12 : 08", status: "Active" },
  { id: 4, name: "Mohamed Morsy", jobTitle: "Head Chef", shift: "12 : 08", status: "Active" },
  { id: 5, name: "Mohamed Morsy", jobTitle: "Head Chef", shift: "12 : 08", status: "Active" },
  { id: 6, name: "Mohamed Morsy", jobTitle: "Head Chef", shift: "12 : 08", status: "Active" },
];

const roleFilters = ["All Employees", "chef", "waiters", "Cashers"];

export default function StaffPage() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState("All Employees");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="flex gap-5 min-h-screen bg-slate-50 p-5 font-sans">
      {/* Left - Table */}
      <div className="flex-1">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name, ID or Job title......"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {roleFilters.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  activeRole === r
                    ? "bg-blue-500 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            + Add Employee
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100">
              <tr className="text-slate-500 font-semibold">
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Job Title</th>
                <th className="py-3 px-4 text-left">Shift</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/dashboard/staff/${emp.id}/edit`)}
                >
                  <td className="py-3 px-4 text-slate-700">{emp.name}</td>
                  <td className="py-3 px-4 text-slate-600">{emp.jobTitle}</td>
                  <td className="py-3 px-4 text-slate-600">{emp.shift}</td>
                  <td className="py-3 px-4">
                    <span className="text-green-500 font-medium">{emp.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
          <span>Showing <strong>1-6</strong> from <strong>100</strong> data</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">‹</button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  currentPage === p ? "bg-blue-500 text-white" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                {p}
              </button>
            ))}
            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">›</button>
          </div>
        </div>
      </div>

      {/* Right - Staff Overview */}
      <div className="w-56 shrink-0">
        <div className="bg-slate-900 text-white rounded-2xl p-5">
          <h2 className="font-bold text-base mb-4">Staff Overview</h2>

          <div className="bg-slate-800 rounded-xl p-4 mb-3">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Staff</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">42</span>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Full-time & Part-time</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">On Shift Now</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">18</span>
              <span className="text-2xl">⏱</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full mt-2 mb-1">
              <div className="h-full w-5/12 bg-blue-500 rounded-full" />
            </div>
            <p className="text-xs text-slate-400">42% of total staff active</p>
          </div>
        </div>
      </div>

      {showAdd && <AddEmployeeModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}