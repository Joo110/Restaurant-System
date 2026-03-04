// src/components/Staff/page/StaffPage.tsx
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { ApiBranch } from "../../layout/Topbar";
import AddEmployeeModal from "../../Inventorys/page/Addemployeemodal";
import { useEmployees, deleteEmployeeFn } from "../../Employess/hook/Useemployees";
import { invalidateQuery } from "../../../hook/queryClient";

const roleFilters = ["All Employees", "chef", "waiters", "cashier", "hr", "kitchen"];

export default function StaffPage() {
  const navigate = useNavigate();

  // ── Branch resolution ──
  const outlet = useOutletContext<{ activeBranch?: ApiBranch | null } | undefined>();
  const activeBranch = outlet?.activeBranch ?? null;
  const effectiveBranchId =
    activeBranch?.id ??
    activeBranch?._id ??
    (activeBranch?.branchId != null ? String(activeBranch.branchId) : undefined);
  const [activeRole, setActiveRole] = useState("All Employees");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState<{ id: string; name: string } | null>(null);

  const limit = 10;

  const queryParams = {
    page: currentPage,
    limit,
    ...(search && { keyword: search }),
    ...(activeRole !== "All Employees" && { department: activeRole }),
    ...(effectiveBranchId && { branchId: effectiveBranchId }),
  };

  const { data, isLoading, isError, refetch } = useEmployees(queryParams);

  const employees = data?.data ?? [];
  const totalDocs = data?.paginationResult?.totalDocs ?? 0;
  const totalPages = data?.paginationResult?.totalPages ?? 1;

  const from = totalDocs === 0 ? 0 : (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, totalDocs);

  /* ── Delete ── */
  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setTargetEmployee({ id, name });
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!targetEmployee) return;
    setDeletingId(targetEmployee.id);
    setShowConfirm(false);
    try {
      await deleteEmployeeFn(targetEmployee.id);
      invalidateQuery("employees");
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
      setTargetEmployee(null);
    }
  };

  /* ── Pagination ── */
  const handlePageChange = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
  };

  const pageNumbers = (() => {
    const pages: number[] = [];
    const delta = 1;
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i);
    }
    return pages;
  })();

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 font-sans">

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Left — Table ── */}
        <div className="flex-1 min-w-0">

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by name, ID or Job title..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {roleFilters.map((r) => (
                <button
                  key={r}
                  onClick={() => { setActiveRole(r); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
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
              onClick={() => {
                if (!effectiveBranchId) {
                  alert("Please select a branch before adding an employee.");
                  return;
                }
                setShowAdd(true);
              }}
              className="sm:ml-auto px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap"
            >
              + Add Employee
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[440px]">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Job Title</th>
                    <th className="py-3 px-4 text-left">Department</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Loading employees...
                        </div>
                      </td>
                    </tr>
                  )}

                  {isError && !isLoading && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-red-400 text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <span>Failed to load employees.</span>
                          <button
                            onClick={() => refetch()}
                            className="text-blue-500 hover:underline text-xs"
                          >
                            Try again
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!isLoading && !isError && employees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                        No employees found.
                      </td>
                    </tr>
                  )}

                  {!isLoading && !isError && employees.map((emp) => {
                    const id = emp._id ?? emp.id ?? "";
                    const isDeleting = deletingId === id;
                    return (
                      <tr
                        key={id}
                        className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${isDeleting ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
                        onClick={() => navigate(`/dashboard/staff/${id}/edit`)}
                      >
                        <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                          {emp.fullName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {emp.position ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-600 capitalize whitespace-nowrap">
                          {emp.department ?? "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${emp.status === "active" ? "text-green-500" : "text-slate-400"}`}>
                            {emp.status ?? "Active"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={(e) => handleDeleteClick(e, id, emp.fullName)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete employee"
                          >
                            {isDeleting ? (
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                            ) : (
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                              </svg>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 text-sm text-slate-500">
            <span>
              {totalDocs === 0
                ? "No results"
                : <>Showing <strong>{from}–{to}</strong> from <strong>{totalDocs}</strong> employees</>}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              {pageNumbers.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                    currentPage === p ? "bg-blue-500 text-white" : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* ── Right — Staff Overview ── */}
        <div className="w-full lg:w-56 shrink-0">
          <div className="bg-slate-900 text-white rounded-2xl p-5">
            <h2 className="font-bold text-base mb-4">Staff Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Total Staff</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{totalDocs}</span>
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Full-time & Part-time</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">On Shift Now</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    {employees.filter((e) => e.status === "active").length}
                  </span>
                  <span className="text-2xl">⏱</span>
                </div>
                {totalDocs > 0 && (
                  <>
                    <div className="h-1.5 bg-slate-700 rounded-full mt-2 mb-1">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{
                          width: `${Math.round(
                            (employees.filter((e) => e.status === "active").length / employees.length) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      {Math.round(
                        (employees.filter((e) => e.status === "active").length / employees.length) * 100
                      )}% of page active
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <AddEmployeeModal
          branchId={effectiveBranchId}
          onClose={() => {
            setShowAdd(false);
            refetch();
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      {showConfirm && targetEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-base">Delete Employee</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Are you sure you want to delete <strong>{targetEmployee.name}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}