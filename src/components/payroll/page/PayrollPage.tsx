// src/components/Staff/page/PayrollPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProcessPayrollModal from "./ProcessPayrollModal";

type PayrollRecord = {
  id: number;
  name: string;
  role: string;
  grossPay: number;
  bonus: number | null;
  deductions: number | null;
  netPay: number;
  status: "Active";
};

const records: PayrollRecord[] = [
  { id: 1, name: "Mohamed Morsy", role: "Head Chef", grossPay: 4300, bonus: 900, deductions: 300, netPay: 4900, status: "Active" },
  { id: 2, name: "Mohamed Morsy", role: "Head Chef", grossPay: 4300, bonus: 900, deductions: 300, netPay: 4900, status: "Active" },
  { id: 3, name: "Mohamed Morsy", role: "Head Chef", grossPay: 4300, bonus: null, deductions: 300, netPay: 4000, status: "Active" },
  { id: 4, name: "Mohamed Morsy", role: "Head Chef", grossPay: 4300, bonus: null, deductions: null, netPay: 4300, status: "Active" },
  { id: 5, name: "Mohamed Morsy", role: "Head Chef", grossPay: 4300, bonus: 900, deductions: null, netPay: 5200, status: "Active" },
  { id: 6, name: "Mohamed Morsy", role: "Head Chef", grossPay: 4300, bonus: 900, deductions: null, netPay: 5200, status: "Active" },
];

export default function PayrollPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showProcess, setShowProcess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50 p-5 font-sans">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total Payroll Cost", icon: "💰", value: "$122,512" },
          { label: "Deductions", icon: "📋", value: "$2,180" },
          { label: "Bonus / Overtime", icon: "⭐", value: "$17,150" },
          { label: "Next Pay Date", icon: "📅", value: "Nov 30, 2026" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span>{stat.icon}</span>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
            <p className="text-lg font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Button */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search Employee, Role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowProcess(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          ▶ Process Payroll
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
              <th className="py-3 px-5 text-left">Employee</th>
              <th className="py-3 px-5 text-left">Role</th>
              <th className="py-3 px-5 text-left">Gross Pay</th>
              <th className="py-3 px-5 text-left">Bonus</th>
              <th className="py-3 px-5 text-left">Deductions</th>
              <th className="py-3 px-5 text-left">Net pay</th>
              <th className="py-3 px-5 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {records
              .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
              .map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/dashboard/payroll/${r.id}`)}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-5 text-slate-700 font-medium">{r.name}</td>
                  <td className="py-3 px-5 text-slate-500">{r.role}</td>
                  <td className="py-3 px-5 text-slate-700">{r.grossPay.toLocaleString()}.00</td>
                  <td className="py-3 px-5">
                    {r.bonus !== null ? (
                      <span className="text-green-600 font-medium">{r.bonus.toLocaleString()}.00</span>
                    ) : (
                      <span className="text-slate-300">——————</span>
                    )}
                  </td>
                  <td className="py-3 px-5">
                    {r.deductions !== null ? (
                      <span className="text-red-500 font-medium">{r.deductions.toLocaleString()}.00</span>
                    ) : (
                      <span className="text-slate-300">——————</span>
                    )}
                  </td>
                  <td className="py-3 px-5 text-slate-700 font-medium">{r.netPay.toLocaleString()}.00</td>
                  <td className="py-3 px-5">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-50">
          <span className="text-xs text-slate-400">Showing 1-6 from 100 data</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 text-xs">‹</button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                  currentPage === p ? "bg-blue-500 text-white" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                {p}
              </button>
            ))}
            <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 text-xs">›</button>
          </div>
        </div>
      </div>

      {showProcess && <ProcessPayrollModal onClose={() => setShowProcess(false)} />}
    </div>
  );
}