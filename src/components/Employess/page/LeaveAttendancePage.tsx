// src/components/Staff/page/LeaveAttendancePage.tsx
import { useMemo, useState } from "react";
import { useAttendances, useAttendanceStats } from "../../Attendance/hooks/Useattendance";
import type { Attendance } from "../../Attendance/services/Attendanceservice";

type RequestStatus = "Pending" | "refused" | "Accept";
/* eslint-disable @typescript-eslint/no-explicit-any */


/* ------------------ UI constants (kept same look) ------------------ */
const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);
const today = new Date().getDate();
const startOffset = 3;
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const statusBadge: Record<RequestStatus, string> = {
  Pending: "bg-orange-100 text-orange-600",
  refused: "bg-slate-100 text-slate-500",
  Accept: "bg-green-100 text-green-700",
};

type Props = {
  employeeId?: string | null;
};

export default function LeaveAttendancePage({ employeeId }: Props) {
  const [showAllRequests, setShowAllRequests] = useState(false);

  // fetch attendances for this employee (most recent first)
  const { data, isLoading, isError, refetch } = useAttendances({
    employeeId: employeeId ?? undefined,
    limit: 100,
    page: 1,
    sort: "-date",
  });

  // fetch attendance stats for the employee (to fill the stat chips dynamically)
  const {
    data: statsData,
  } = useAttendanceStats({ employeeId: employeeId ?? undefined });

  const records: Attendance[] = data?.data ?? [];

  // derive calendar markers from records (day numbers)
  const { presentDays, lateDays, onLeaveDays } = useMemo(() => {
    const p: number[] = [];
    const l: number[] = [];
    const o: number[] = [];

    for (const r of records) {
      if (!r.date) continue;
      const d = new Date(r.date);
      if (Number.isNaN(d.getTime())) continue;
      const day = d.getDate();
      const status = (r.status ?? "").toLowerCase();

      if (status === "present") p.push(day);
      else if (status === "late") l.push(day);
      else if (status === "absent" || status === "on-leave" || status === "leave") o.push(day);
      else if (status === "half-day") p.push(day); // treat half-day as present for calendar mark
    }

    // unique & sorted
    const uniq = (arr: number[]) => Array.from(new Set(arr)).sort((a, b) => a - b);
    return { presentDays: uniq(p), lateDays: uniq(l), onLeaveDays: uniq(o) };
  }, [records]);

  // prepare recent requests / recent attendance entries for the sidebar list
  const recentRequests = useMemo(() => {
    if (records.length === 0) return [];
    // take most recent N (sorted by server via sort param but ensure local sort)
    const sorted = [...records].sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });
    return sorted.map((r) => {
      const name =
        (r as any).employee?.fullName ??
        (r as any).employeeName ??
        (r.employeeId ? `#${r.employeeId}` : "Employee");
      const dateStr = r.date ? new Date(r.date).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" }) : "—";
      const days = 1;
      const reason = r.notes ?? (r as any).reason ?? "—";
      const status = (r.status ?? "Pending").toString();
      return { name, dates: dateStr, days, reason, status: (status.charAt(0).toUpperCase() + status.slice(1)) as RequestStatus, raw: r };
    });
  }, [records]);

  // choose displayed requests (respect showAllRequests)
  const displayedRequests = showAllRequests ? recentRequests : recentRequests.slice(0, 4);

  // helper to produce day style (kept same classes as original)
  const getDayStyle = (day: number) => {
    if (day === today) return "bg-blue-500 text-white font-bold rounded-full";
    if (lateDays.includes(day)) return "bg-orange-100 text-orange-600 font-semibold rounded-full";
    if (onLeaveDays.includes(day)) return "bg-blue-100 text-blue-500 font-semibold rounded-full";
    if (presentDays.includes(day)) return "bg-green-100 text-green-700 font-semibold rounded-full";
    return "text-slate-400";
  };

  // header chips content (fall back to previous static values if stats not ready)
  const chips = [
    {
      label: "Annual Leave Balance",
      value: (statsData?.data?.totalAbsent != null) ? `${Math.max(0, 20 - (statsData.data.totalAbsent ?? 0))}/20 Days` : "14/20 Days",
      icon: "🏖",
      color: "text-slate-800",
      bar: "bg-blue-500",
      barW: (statsData?.data ? `${Math.min(100, Math.round(((statsData.data.totalPresent ?? 0) / 20) * 100))}%` : "70%"),
    },
    {
      label: "Sick Leave Balance",
      value: "6/10 Days",
      icon: "🤒",
      color: "text-red-500",
      bar: "bg-red-400",
      barW: "60%",
    },
    {
      label: "Attendance Rate",
      value: statsData?.data?.totalPresent != null && records.length > 0
        ? `${Math.round(((statsData.data.totalPresent ?? 0) / Math.max(1, records.length)) * 100)}%`
        : "—",
      icon: "📅",
      color: "text-slate-800",
      bar: "bg-green-500",
      barW: statsData?.data ? `${Math.min(100, Math.round(((statsData.data.totalPresent ?? 0) / Math.max(1, records.length)) * 100))}%` : "98%",
    },
    {
      label: "Years of Service",
      value: "—",
      icon: "⭐",
      color: "text-slate-800",
      bar: "bg-yellow-400",
      barW: "35%",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats — 2 col mobile → 4 col md+ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {chips.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 leading-tight">{stat.label}</p>
              <span className="flex-shrink-0 ml-1">{stat.icon}</span>
            </div>
            <p className={`text-lg sm:text-xl font-bold ${stat.color} mb-2`}>{stat.value}</p>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${stat.bar} rounded-full`} style={{ width: stat.barW }} />
            </div>
          </div>
        ))}
      </div>

      {/* Calendar + sidebar — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Attendance Overview</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button className="hover:text-blue-500">‹</button>
              <span>{new Date().toLocaleString(undefined, { month: "long", year: "numeric" })}</span>
              <button className="hover:text-blue-500">›</button>
            </div>
          </div>

          {/* Summary chips — 2 col mobile → 4 col sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { icon: "✅", label: "PRESENT", value: statsData?.data?.totalPresent ?? (records.filter(r => (r.status ?? "").toLowerCase() === "present").length), color: "text-green-600", bg: "bg-green-50" },
              { icon: "⏰", label: "LATE", value: statsData?.data?.totalLate ?? (records.filter(r => (r.status ?? "").toLowerCase() === "late").length), color: "text-orange-500", bg: "bg-orange-50" },
              { icon: "❌", label: "ABSENT", value: statsData?.data?.totalAbsent ?? (records.filter(r => (r.status ?? "").toLowerCase() === "absent").length), color: "text-red-500", bg: "bg-red-50" },
              { icon: "🏖", label: "ON LEAVE", value: "—", color: "text-blue-500", bg: "bg-blue-50" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-2.5 sm:p-3 text-center`}>
                <span className="text-base">{s.icon}</span>
                <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wide mt-1">{s.label}</p>
                <p className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((d) => (
              <div key={d} className="text-[10px] text-slate-400 font-medium py-1">{d}</div>
            ))}
            {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} />)}
            {calendarDays.map((day) => (
              <div
                key={day}
                className={`w-7 h-7 sm:w-8 sm:h-8 mx-auto flex items-center justify-center text-xs cursor-pointer hover:opacity-80 transition-opacity ${getDayStyle(day)}`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Recent Requests */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Quick Actions</h3>
            <button className="w-full py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
              ✉ Contact Employee
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex-1">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Recent Attendance</h3>

            {/* loading / empty states */}
            {isLoading && (
              <div className="py-6 text-center text-slate-400 text-sm">Loading attendance…</div>
            )}

            {!isLoading && isError && (
              <div className="py-6 text-center text-red-400 text-sm">
                Failed to load attendance. <button onClick={() => refetch()} className="underline">Retry</button>
              </div>
            )}

            {!isLoading && !isError && displayedRequests.length === 0 && (
              <div className="py-6 text-center text-slate-400 text-sm">No attendance records found for this employee.</div>
            )}

            {!isLoading && !isError && displayedRequests.length > 0 && (
              <div className="space-y-3">
                {displayedRequests.map((req, i) => (
                  <div key={i} className="border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-0.5 gap-1">
                      <p className="text-xs font-semibold text-slate-700">{req.name}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusBadge[req.status] ?? "bg-slate-100 text-slate-500"}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{req.dates}</p>
                    <p className="text-[10px] text-slate-500">{req.days} Day · Notes: {req.reason}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowAllRequests(!showAllRequests)}
              className="mt-3 w-full text-center text-xs text-blue-500 font-medium hover:underline"
            >
              {showAllRequests ? "Hide Attendance History" : "View All Attendance History"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}