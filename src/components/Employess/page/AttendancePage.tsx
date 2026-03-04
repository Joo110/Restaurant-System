// src/components/Staff/page/AttendancePage.tsx
import { useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAttendances, useAttendanceStats, deleteAttendanceFn } from "../../Attendance/hooks/Useattendance";
import { invalidateQuery } from "../../../hook/queryClient";
import type { ApiBranch } from "../../layout/Topbar";
import type { Attendance } from "../../Attendance/services/Attendanceservice";
import LogAttendanceModal from "./LogAttendanceModal";
import EditAttendanceModal from "./EditAttendanceModal";

/* ── helpers ── */
const fmtTime = (t?: string) => {
  if (!t) return "——";
  if (t.includes("T")) {
    try {
      return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch { return t; }
  }
  return t;
};

const statusStyle: Record<string, string> = {
  present:   "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  absent:    "bg-red-100 text-red-500",
  late:      "bg-orange-100 text-orange-600",
  "half-day":"bg-yellow-100 text-yellow-700",
};

function resolveId(rec: Attendance) {
  return rec._id ?? rec.id ?? "";
}

/** ✅ استخراج employee id الصح من الـ record */
function resolveEmployeeId(rec: Attendance): string {
  return (
    (rec as any).employee?._id ??
    (rec as any).employee?.id ??
    rec.employeeId ??
    ""
  );
}

/* ─────────────────────────────────────────────────────── */
export default function AttendancePage() {
  const navigate = useNavigate();

  /* ── branch ── */
  const outlet = useOutletContext<{ activeBranch?: ApiBranch | null } | undefined>();
  const activeBranch = outlet?.activeBranch ?? null;
  const effectiveBranchId =
    activeBranch?.id ??
    activeBranch?._id ??
    (activeBranch?.branchId != null ? String(activeBranch.branchId) : undefined);

  /* ── local state ── */
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showLog, setShowLog]           = useState(false);
  const [editRecord, setEditRecord]     = useState<Attendance | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const limit = 10;

  /* ── query params ── */
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit,
    ...(search.trim() && { keyword: search.trim() }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(effectiveBranchId && { branchId: effectiveBranchId }),
  }), [currentPage, search, statusFilter, effectiveBranchId]);

  const statsParams = useMemo(() => ({
    ...(effectiveBranchId && { branchId: effectiveBranchId }),
  }), [effectiveBranchId]);

  /* ── data ── */
  const { data, isLoading, isError, refetch } = useAttendances(queryParams);
  const { data: statsData } = useAttendanceStats(statsParams);

  const records: Attendance[]  = data?.data ?? [];
  const totalDocs              = data?.paginationResult?.totalDocs ?? 0;
  const totalPages             = data?.paginationResult?.totalPages ?? 1;
  const stats                  = statsData?.data ?? {};

  /* ── delete ── */
  const handleDelete = async (e: React.MouseEvent, rec: Attendance) => {
    e.stopPropagation();
    const id = resolveId(rec);
    if (!id) return;
    if (!window.confirm("Delete this attendance record?")) return;
    setDeletingId(id);
    try {
      await deleteAttendanceFn(id);
      invalidateQuery("attendance");
    } catch {
      alert("Failed to delete record.");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── open log (requires branch) ── */
  const handleLogClick = () => {
    if (!effectiveBranchId) {
      alert("Please select a branch before logging attendance.");
      return;
    }
    setShowLog(true);
  };

  /* ── navigate to employee profile ── */
  const handleRowClick = (rec: Attendance) => {
    const empId = resolveEmployeeId(rec);
    if (!empId) return;
    navigate(`/dashboard/staff/${empId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 font-sans">

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 flex-wrap">
          {["all", "present", "late", "absent", "half-day"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                statusFilter === s
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogClick}
          className="sm:ml-auto px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap"
        >
          + Log Attendance
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Present",  value: stats.totalPresent ?? 0,       total: totalDocs || 1, color: "bg-blue-500",   text: "text-slate-800"  },
          { label: "Late",     value: stats.totalLate ?? 0,          total: totalDocs || 1, color: "bg-orange-400", text: "text-orange-500" },
          { label: "Absent",   value: stats.totalAbsent ?? 0,        total: totalDocs || 1, color: "bg-red-400",    text: "text-red-500"    },
          { label: "Overtime", value: stats.totalOvertimeHours ?? 0, total: totalDocs || 1, color: "bg-blue-300",   text: "text-slate-800", suffix: "h" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.color}`} />
              <p className="text-xs text-slate-500 truncate">{s.label}</p>
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${s.text} mb-2`}>
              {s.value}{s.suffix ?? ""}
              {!s.suffix && <span className="text-xs sm:text-sm font-normal text-slate-400"> / {s.total}</span>}
            </p>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${s.color} rounded-full`}
                style={{ width: `${Math.min((s.value / s.total) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                <th className="py-3 px-4 text-left">Employee</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Check In</th>
                <th className="py-3 px-4 text-left">Check Out</th>
                <th className="py-3 px-4 text-left">Hours</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Loading...
                    </div>
                  </td>
                </tr>
              )}

              {isError && !isLoading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-red-400 text-sm">
                    Failed to load records.{" "}
                    <button onClick={() => refetch()} className="underline">Retry</button>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && records.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No attendance records found.
                  </td>
                </tr>
              )}

              {!isLoading && !isError && records.map((rec) => {
                const recId   = resolveId(rec);
                const empId   = resolveEmployeeId(rec);   // ✅ الـ employee id الصح
                const empName = (rec as any).employee?.fullName ?? (rec as any).employeeName ?? rec.employeeId ?? "—";
                const status  = (rec.status ?? "").toLowerCase();
                const isDeleting = deletingId === recId;

                return (
                  <tr
                    key={recId || Math.random()}
                    className={`border-b border-slate-50 transition-colors ${
                      empId ? "hover:bg-slate-50/60 cursor-pointer" : ""
                    } ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
                    onClick={() => handleRowClick(rec)}   // ✅ بيروح لبروفايل الموظف الصح
                  >
                    <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {empName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {rec.date ? new Date(rec.date).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{fmtTime(rec.checkIn)}</td>
                    <td className="py-3 px-4 text-slate-600">{fmtTime(rec.checkOut)}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {rec.hoursWorked != null ? `${rec.hoursWorked}h` : "——"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap capitalize ${
                        statusStyle[status] ?? "bg-slate-100 text-slate-500"
                      }`}>
                        {rec.status ?? "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditRecord(rec); }}
                          className="text-slate-400 hover:text-blue-500 transition-colors text-base"
                          title="Edit"
                        >✏</button>
                        <button
                          onClick={(e) => handleDelete(e, rec)}
                          disabled={isDeleting}
                          className="text-slate-400 hover:text-red-500 transition-colors text-base disabled:opacity-40"
                          title="Delete"
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-slate-50">
          <span className="text-xs text-slate-400">
            {totalDocs === 0
              ? "No records"
              : `Showing ${(currentPage - 1) * limit + 1}–${Math.min(currentPage * limit, totalDocs)} of ${totalDocs}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 text-xs disabled:opacity-40"
            >‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                  currentPage === p ? "bg-blue-500 text-white" : "hover:bg-slate-100 text-slate-600"
                }`}
              >{p}</button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 text-xs disabled:opacity-40"
            >›</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showLog && (
        <LogAttendanceModal
          branchId={effectiveBranchId}
          onClose={() => setShowLog(false)}
        />
      )}
      {editRecord && (
        <EditAttendanceModal
          record={editRecord}
          onClose={() => setEditRecord(null)}
        />
      )}
    </div>
  );
}