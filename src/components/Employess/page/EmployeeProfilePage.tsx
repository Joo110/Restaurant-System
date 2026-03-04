// src/components/Staff/page/EmployeeProfilePage.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LeaveAttendancePage from "../page/LeaveAttendancePage";
import { useEmployee } from "../../Employess/hook/Useemployees";
import { useAttendanceStats } from "../../Attendance/hooks/Useattendance";

type Tab = "Overview" | "Leave & Attendance";

type ScheduleItem = {
  day: string;
  time?: string | null;
};

type Employee = {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
  position?: string | null;
  status?: "active" | "inactive" | string | null;
  employmentType?: string | null;
  joinDate?: string | null;
  address?: unknown;
  email?: string | null;
  phone?: string | null;
  branch?: { name?: string } | string | null;
  schedule?: ScheduleItem[] | null;
  id?: number | string | null;
  employeeId?: number | string | null;
  salary?: number | string | null;
  payGrade?: string | null;
  payFrequency?: string | null;
  nextPayday?: string | null;
  bankAccount?: string | number | null;
  bankName?: string | null;
};

export default function EmployeeProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  // ── fetch employee data ──────────────────────────────────────────────────
  const {
    data: employee,
    isLoading: empLoading,
    isError: empError,
  } = useEmployee(id ?? "");

  // ── fetch attendance stats for this employee ─────────────────────────────
  const {
    data: attendanceStats,
    isLoading: statsLoading,
  } = useAttendanceStats({ employeeId: id });

  /* eslint-disable @typescript-eslint/no-explicit-any */

  // ── loading state ────────────────────────────────────────────────────────
  if (empLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ── error / not found ────────────────────────────────────────────────────
  if (empError || !employee) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-3">Employee not found.</p>
          <button
            onClick={() => navigate("/dashboard/staff")}
            className="text-blue-500 text-sm underline"
          >
            Back to Staff
          </button>
        </div>
      </div>
    );
  }

  // Cast to a typed Employee after ensuring it exists
  const emp = employee as unknown as Employee;

  // ── helpers ──────────────────────────────────────────────────────────────
  const fullName = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim()
    || emp.fullName
    || "—";

  const joinDate = emp.joinDate
    ? new Date(emp.joinDate).toLocaleDateString("en-GB")
    : "—";

  /** بيحول أي قيمة لـ string آمن — لو object بياخد منها الـ keys المهمة */
  const safeStr = (val: unknown): string => {
    if (val == null) return "—";
    if (typeof val === "string") return val || "—";
    if (typeof val === "number") return String(val);
    if (typeof val === "object") {
      const obj = val as Record<string, unknown>;
      // address object: { street, city, country, ... }
      return [obj.street, obj.city, obj.state, obj.country]
        .filter(Boolean)
        .join(", ") || JSON.stringify(val);
    }
    return String(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-5xl mx-auto p-3 sm:p-6">

        {/* Breadcrumb */}
        <p className="text-xs text-slate-400 mb-4">
          <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate("/dashboard")}>
            Home
          </span>
          {" / "}
          <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate("/dashboard/staff")}>
            Staff
          </span>
          {" / "}
          <span className="text-blue-500 font-medium">{fullName}</span>
        </p>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">

              {/* Avatar */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-200 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                {emp.avatarUrl ? (
                  <img src={String(emp.avatarUrl)} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  "👤"
                )}
              </div>

              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900">{fullName}</h1>
                <p className="text-sm text-slate-500 mb-1.5">
                  {emp.role ?? (emp as any).position ?? "—"}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    emp.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {emp.status === "active" ? "Active Status" : "Inactive"}
                  </span>
                  {emp.employmentType && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                      {emp.employmentType}
                    </span>
                  )}
                  {emp.joinDate && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
                      Joined {joinDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/dashboard/staff/${id}/edit`)}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              ✏ Edit profile
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 sm:gap-5 mt-5 border-t border-slate-100 pt-4 overflow-x-auto">
            {(["Overview", "Leave & Attendance"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab
                    ? "text-blue-600 border-blue-600"
                    : "text-slate-400 border-transparent hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ─────────────────────────────────────────────────── */}
        {activeTab === "Overview" ? (
          <div className="flex flex-col gap-4">

            {/* Contact + Employment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Contact Information */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
                <h2 className="font-bold text-slate-800 text-sm mb-4">Contact Information</h2>
                <div className="space-y-4">
                  {[
                    { icon: "✉",  label: "Email Address",       value: safeStr(emp.email),   sub: "Work"   },
                    { icon: "📍", label: "Residential Address", value: safeStr(emp.address),  sub: null     },
                    { icon: "📞", label: "Phone Number",        value: safeStr(emp.phone),    sub: "Mobile" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="text-slate-400 mt-0.5 flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{item.label}</p>
                        <p className="text-sm text-slate-700 font-medium">{item.value ?? "—"}</p>
                        {item.sub && <p className="text-[10px] text-slate-400">{item.sub}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employment Details */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
                <h2 className="font-bold text-slate-800 text-sm mb-4">Employment Details</h2>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Branch</p>
                    <p className="text-sm text-slate-700 font-medium">
                      {safeStr((emp as any).branch?.name ?? emp.branch)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Role</p>
                    <p className="text-sm text-slate-700 font-medium">
                      {safeStr(emp.role ?? (emp as any).position)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">ID Number</p>
                    <p className="text-xs text-slate-700 font-medium">
                      {safeStr(emp.employeeId ?? emp.id)}
                    </p>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-600 mb-2">Current Shift Schedule</p>
                <div className="flex flex-wrap gap-1.5">
                  {emp.schedule && emp.schedule.length > 0 ? (
                    emp.schedule.map((s: ScheduleItem, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg border border-blue-100"
                      >
                        {s.day}: {s.time}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No schedule assigned</span>
                  )}
                </div>
              </div>
            </div>

            {/* Compensations */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
              <h2 className="font-bold text-slate-800 text-sm mb-4">Compensations & Pay Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Base Salary</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-800">
                    {emp.salary
                      ? `$${Number(emp.salary).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </p>
                  <p className="text-[10px] text-slate-400">/ Month</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Pay Grade</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {emp.payGrade ?? emp.role ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Pay Frequency</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {emp.payFrequency ?? "Monthly"}
                  </p>
                  {emp.nextPayday && (
                    <p className="text-[10px] text-slate-400">
                      Next Payday:{" "}
                      {new Date(emp.nextPayday).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Bank Account</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-slate-500">🏦</span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700">
                      {emp.bankAccount
                        ? `**** **** **** ${String(emp.bankAccount).slice(-4)}`
                        : "—"}
                    </p>
                  </div>
                  {emp.bankName && (
                    <p className="text-[10px] text-slate-400">{emp.bankName}</p>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-4 flex items-center gap-1 flex-wrap">
                🔒 Sensitive financial data is masked. Use 'Edit pay & Pay Details' to review full information within 2FA.
              </p>
            </div>

            {/* Attendance Quick Stats */}
            {!statsLoading && attendanceStats && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
                <h2 className="font-bold text-slate-800 text-sm mb-4">Attendance Summary</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Present Days",   value: attendanceStats.data?.totalPresent  ?? (attendanceStats as any).totalPresent  ?? "—", color: "text-green-600"  },
                    { label: "Absent Days",    value: attendanceStats.data?.totalAbsent   ?? (attendanceStats as any).totalAbsent   ?? "—", color: "text-red-500"    },
                    { label: "Late Check-ins", value: attendanceStats.data?.totalLate     ?? (attendanceStats as any).totalLate     ?? "—", color: "text-orange-500" },
                    { label: "Overtime (h)",   value: attendanceStats.data?.totalOvertimeHours ?? (attendanceStats as any).totalOvertimeHours ?? "—", color: "text-blue-500" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{stat.label}</p>
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        ) : (
          <LeaveAttendancePage employeeId={id} />
        )}
      </div>
    </div>
  );
}