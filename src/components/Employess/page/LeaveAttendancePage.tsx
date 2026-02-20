// src/components/Staff/page/LeaveAttendancePage.tsx
import { useState } from "react";

type RequestStatus = "Pending" | "refused" | "Accept";

const recentRequests = [
  { name: "Mohamed Morsy", dates: "Oct 02, 2023 - Oct 03, 2023", days: 2, reason: "Flu", status: "Pending" as RequestStatus },
  { name: "Mohamed Morsy", dates: "Oct 02, 2023 - Oct 03, 2023", days: 2, reason: "Flu", status: "refused" as RequestStatus },
  { name: "Mohamed Morsy", dates: "Aug 08, 2024 - Aug 012, 2023", days: 4, reason: "Flu", status: "Accept" as RequestStatus },
];

const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

const presentDays = [4, 5, 7, 8, 11, 12, 14, 15, 18, 19, 20, 21, 22, 25, 26, 29];
const lateDays = [6, 13];
const onLeaveDays = [19, 20];
const today = 27;

const statusBadge: Record<RequestStatus, string> = {
  Pending: "bg-orange-100 text-orange-600",
  refused: "bg-slate-100 text-slate-500",
  Accept: "bg-green-100 text-green-700",
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// May 2025 starts on Thursday (index 3)
const startOffset = 3;

export default function LeaveAttendancePage() {
  const [showAllRequests, setShowAllRequests] = useState(false);
  const displayedRequests = showAllRequests
    ? [...recentRequests, ...recentRequests] // mock more
    : recentRequests;

  const getDayStyle = (day: number) => {
    if (day === today) return "bg-blue-500 text-white font-bold rounded-full";
    if (lateDays.includes(day)) return "bg-orange-100 text-orange-600 font-semibold rounded-full";
    if (onLeaveDays.includes(day)) return "bg-blue-100 text-blue-500 font-semibold rounded-full";
    if (presentDays.includes(day)) return "bg-green-100 text-green-700 font-semibold rounded-full";
    return "text-slate-400";
  };

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Annual Leave Balance", value: "14/20 Days", icon: "🏖", color: "text-slate-800", bar: "bg-blue-500", barW: "70%" },
          { label: "Sick Leave Balance", value: "6/10 Days", icon: "🤒", color: "text-red-500", bar: "bg-red-400", barW: "60%" },
          { label: "Attendance Rate", value: "98%", icon: "📅", color: "text-slate-800", bar: "bg-green-500", barW: "98%" },
          { label: "Years of Service", value: "3.5 Years", icon: "⭐", color: "text-slate-800", bar: "bg-yellow-400", barW: "35%" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400">{stat.label}</p>
              <span>{stat.icon}</span>
            </div>
            <p className={`text-xl font-bold ${stat.color} mb-2`}>{stat.value}</p>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${stat.bar} rounded-full`} style={{ width: stat.barW }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Calendar + stats */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Attendance Overview</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button className="hover:text-blue-500">‹</button>
              <span>May 2025</span>
              <button className="hover:text-blue-500">›</button>
            </div>
          </div>

          {/* Summary chips */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { icon: "✅", label: "PRESENT", value: 18, color: "text-green-600", bg: "bg-green-50" },
              { icon: "⏰", label: "LATE", value: 2, color: "text-orange-500", bg: "bg-orange-50" },
              { icon: "❌", label: "ABSENT", value: 0, color: "text-red-500", bg: "bg-red-50" },
              { icon: "🏖", label: "ON LEAVE", value: 2, color: "text-blue-500", bg: "bg-blue-50" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                <span className="text-base">{s.icon}</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((d) => (
              <div key={d} className="text-[10px] text-slate-400 font-medium py-1">{d}</div>
            ))}
            {/* Empty offset cells */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {calendarDays.map((day) => (
              <div
                key={day}
                className={`w-8 h-8 mx-auto flex items-center justify-center text-xs cursor-pointer hover:opacity-80 transition-opacity ${getDayStyle(day)}`}
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
            <h3 className="font-bold text-slate-800 text-sm mb-3">Recent Requests</h3>
            <div className="space-y-3">
              {displayedRequests.map((req, i) => (
                <div key={i} className="border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-0.5">
                    <p className="text-xs font-semibold text-slate-700">{req.name}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge[req.status]}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{req.dates}</p>
                  <p className="text-[10px] text-slate-500">{req.days} Days . Reason : {req.reason}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAllRequests(!showAllRequests)}
              className="mt-3 w-full text-center text-xs text-blue-500 font-medium hover:underline"
            >
              {showAllRequests ? "Hide Leave History" : "View All Leave History"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}