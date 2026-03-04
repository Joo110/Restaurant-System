import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProcessPayrollModal from "./ProcessPayrollModal";
import { usePayrolls } from "../hook/usePayroll";

function fmtCurrency(n?: number) {
  if (n == null) return "—";
  return `$${Number(n).toLocaleString()}`;
}
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PayrollPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showProcess, setShowProcess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // fetch payrolls (API returns { stats, data, paginationResult, ... })
  const { data, isLoading } = usePayrolls({
    limit,
    page: currentPage,
    sort: "-month,year",
    // you may request fields/populate if backend supports
  });

  // stats from API
  const stats = data?.stats;

  // list records from API
  const recordsRaw = data?.data ?? [];

  const records = useMemo(() => recordsRaw.map((p: any) => {
    const id = p.id ?? p._id ?? p.payrollId ?? "";
    const name = p.employeeName ?? p.employee?.fullName ?? `#${String(p.employeeId ?? "")}`;
    const role = p.employee?.role ?? p.role ?? "—";
    const gross = p.grossSalary ?? p.baseSalary ?? 0;
    const bonus = p.bonus ?? 0;
    const deductions = p.deductions ?? 0;
    const net = p.netSalary ?? 0;
    const status = (p.paymentStatus ?? "pending").toString();
    return { id, name, role, gross, bonus, deductions, net, status, raw: p };
  }), [recordsRaw]);

  const totalPayrollCost = stats?.financial?.totalNet ?? records.reduce((s, r) => s + Number(r.net || 0), 0);

  const filtered = records.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 font-sans">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {[
          { label: "Total Payroll Cost", icon: "💰", value: fmtCurrency(totalPayrollCost) },
          { label: "Deductions", icon: "📋", value: fmtCurrency(stats?.financial?.totalTax ?? stats?.financial?.totalTax ?? 0) },
          { label: "Bonus / Overtime", icon: "⭐", value: fmtCurrency(stats?.financial?.totalBonus ?? 0) },
          { label: "Payroll Count", icon: "📄", value: stats?.total ?? records.length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span>{stat.icon}</span>
              <p className="text-xs text-slate-400 leading-tight">{stat.label}</p>
            </div>
            <p className="text-lg font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <div className="relative flex-1 sm:max-w-xs">
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
          className="sm:ml-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          ▶ Process Payroll
        </button>
      </div>

      {/* Table - scrollable on small screens */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                <th className="py-3 px-4 sm:px-5 text-left">Employee</th>
                <th className="py-3 px-4 sm:px-5 text-left">Role</th>
                <th className="py-3 px-4 sm:px-5 text-left">Gross Pay</th>
                <th className="py-3 px-4 sm:px-5 text-left">Bonus</th>
                <th className="py-3 px-4 sm:px-5 text-left">Deductions</th>
                <th className="py-3 px-4 sm:px-5 text-left">Net pay</th>
                <th className="py-3 px-4 sm:px-5 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/dashboard/payroll/${r.id}`)}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 sm:px-5 text-slate-700 font-medium">{r.name}</td>
                  <td className="py-3 px-4 sm:px-5 text-slate-500">{r.role}</td>
                  <td className="py-3 px-4 sm:px-5 text-slate-700">{fmtCurrency(r.gross)}</td>
                  <td className="py-3 px-4 sm:px-5">
                    {r.bonus ? (
                      <span className="text-green-600 font-medium">{fmtCurrency(r.bonus)}</span>
                    ) : (
                      <span className="text-slate-300">——</span>
                    )}
                  </td>
                  <td className="py-3 px-4 sm:px-5">
                    {r.deductions ? (
                      <span className="text-red-500 font-medium">{fmtCurrency(r.deductions)}</span>
                    ) : (
                      <span className="text-slate-300">——</span>
                    )}
                  </td>
                  <td className="py-3 px-4 sm:px-5 text-slate-700 font-medium">{fmtCurrency(r.net)}</td>
                  <td className="py-3 px-4 sm:px-5">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading…</td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No payroll records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-slate-50">
          <span className="text-xs text-slate-400">
           {data?.paginationResult?.totalDocs
  ? `Showing ${((data.paginationResult.currentPage ?? currentPage) - 1) * (data.paginationResult.limit ?? limit) + 1}–${Math.min((data.paginationResult.currentPage ?? currentPage) * (data.paginationResult.limit ?? limit), data.paginationResult.totalDocs)} of ${data.paginationResult.totalDocs}`
  : `Showing ${records.length} records`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 text-xs"
            >‹</button>
            {Array.from({ length: Math.min(data?.paginationResult?.totalPages ?? 1, 5) }, (_, i) => i + 1).map((p) => (
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
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 text-xs"
            >›</button>
          </div>
        </div>
      </div>

      {showProcess && <ProcessPayrollModal onClose={() => setShowProcess(false)} totalAmount={totalPayrollCost} />}
    </div>
  );
}