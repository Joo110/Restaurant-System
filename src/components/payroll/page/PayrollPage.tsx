import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProcessPayrollModal from "./ProcessPayrollModal";
import { usePayrolls } from "../hook/usePayroll";

function fmtCurrency(n?: number) {
  if (n == null) return "—";
  return `$${Number(n).toLocaleString()}`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PayrollPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showProcess, setShowProcess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = usePayrolls({
    limit,
    page: currentPage,
    sort: "-month,year",
    ...(search ? { keyword: search } : {}),
  });

  const stats = data?.stats;
  const recordsRaw = data?.data ?? [];

  const records = useMemo(
    () =>
      recordsRaw.map((p: any) => {
        const id = p.id ?? p._id ?? p.payrollId ?? "";
        const name = p.employeeName ?? p.employee?.fullName ?? `#${String(p.employeeId ?? "")}`;
        const role = p.employee?.role ?? p.role ?? "—";
        const gross = p.grossSalary ?? p.baseSalary ?? 0;
        const bonus = p.bonus ?? 0;
        const deductions = p.deductions ?? 0;
        const net = p.netSalary ?? 0;
        const status = (p.paymentStatus ?? "pending").toString();
        return { id, name, role, gross, bonus, deductions, net, status, raw: p };
      }),
    [recordsRaw]
  );

  const totalPayrollCost = stats?.financial?.totalNet ?? records.reduce((s, r) => s + Number(r.net || 0), 0);

  // ── Server-side pagination ──────────────────────────────────────────────────
  const pagination = data?.paginationResult ?? (data as any)?.pagination ?? (data as any)?.meta ?? {};

  const totalDocs: number = pagination?.totalDocs ?? pagination?.total ?? (data as any)?.results ?? 0;
  const totalPages: number = pagination?.totalPages ?? pagination?.pages ?? (totalDocs > 0 ? Math.ceil(totalDocs / limit) : 1);

  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const from = totalDocs ? (safeCurrentPage - 1) * limit + 1 : 0;
  const to   = totalDocs ? Math.min(safeCurrentPage * limit, totalDocs) : 0;
  // ─────────────────────────────────────────────────────────────────────────────

  const handlePageChange = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
  };

  const visiblePageNumbers = (() => {
    const pages: number[] = [];
    const start = Math.max(1, safeCurrentPage - 2);
    const end   = Math.min(totalPages, safeCurrentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  })();

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 font-sans">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {[
          { label: t("payroll.list.stats.totalPayrollCost"), icon: "💰", value: fmtCurrency(totalPayrollCost) },
          { label: t("payroll.list.stats.deductions"), icon: "📋", value: fmtCurrency(stats?.financial?.totalTax ?? 0) },
          { label: t("payroll.list.stats.bonusOvertime"), icon: "⭐", value: fmtCurrency(stats?.financial?.totalBonus ?? 0) },
          { label: t("payroll.list.stats.payrollCount"), icon: "📄", value: stats?.total ?? totalDocs },
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <div className="relative flex-1 sm:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder={t("payroll.list.searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => setShowProcess(true)}
          className="sm:ml-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          ▶ {t("payroll.list.processPayroll")}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                <th className="py-3 px-4 sm:px-5 text-left">{t("payroll.list.table.employee")}</th>
                <th className="py-3 px-4 sm:px-5 text-left">{t("payroll.list.table.role")}</th>
                <th className="py-3 px-4 sm:px-5 text-left">{t("payroll.list.table.grossPay")}</th>
                <th className="py-3 px-4 sm:px-5 text-left">{t("payroll.list.table.bonus")}</th>
                <th className="py-3 px-4 sm:px-5 text-left">{t("payroll.list.table.deductions")}</th>
                <th className="py-3 px-4 sm:px-5 text-left">{t("payroll.list.table.netPay")}</th>
                <th className="py-3 px-4 sm:px-5 text-left">{t("payroll.list.table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
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
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {t("common.loading")}
                  </td>
                </tr>
              )}

              {!isLoading && records.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {t("payroll.list.noPayrollRecordsFound")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-slate-50">
          <span className="text-xs text-slate-400">
            {totalDocs
              ? t("payroll.list.pagination.showingRange", { from, to, total: totalDocs })
              : t("payroll.list.pagination.showingRecords", { count: records.length })}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1 || isLoading}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>

            {visiblePageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                disabled={isLoading}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                  safeCurrentPage === p ? "bg-blue-500 text-white" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages || isLoading}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        </div>
        {/* ─────────────────────────────────────────────────────────────────── */}
      </div>

      {showProcess && <ProcessPayrollModal onClose={() => setShowProcess(false)} totalAmount={totalPayrollCost} />}
    </div>
  );
}