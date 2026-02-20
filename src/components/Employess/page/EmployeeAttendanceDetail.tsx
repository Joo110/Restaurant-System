// src/components/Staff/page/EmployeeAttendanceDetail.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EditAttendanceModal from "./EditAttendanceModal";
import AddExtraShiftModal from "../../payroll/page/AddExtraShiftModal";

type RequestStatus = "Pending" | "refused" | "Accept";

const requests = [
  { name: "Mohamed Morsy", dates: "Oct 02, 2023 - Oct 03, 2023", days: 2, reason: "Flu", status: "Pending" as RequestStatus },
  { name: "Mohamed Morsy", dates: "Oct 02, 2023 - Oct 03, 2023", days: 2, reason: "Flu", status: "refused" as RequestStatus },
  { name: "Mohamed Morsy", dates: "Aug 08, 2024 - Aug 012, 2023", days: 4, reason: "Flu", status: "Accept" as RequestStatus },
];

const attendanceRows = [
  { date: "15 / 2 / 2026", checkIn: "12:00AM", checkOut: "——", hours: "4h20m", status: "Present" },
  { date: "14 / 2 / 2026", checkIn: "——", checkOut: "——", hours: "——", status: "Absent" },
  { date: "15 / 2 / 2026", checkIn: "12:00AM", checkOut: "——", hours: "4h20m", status: "Absent" },
  { date: "12 / 2 / 2026", checkIn: "12:00AM", checkOut: "——", hours: "4h20m", status: "Present" },
  { date: "11 / 2 / 2026", checkIn: "12:00AM", checkOut: "——", hours: "4h20m", status: "Present" },
  { date: "15 / 2 / 2026", checkIn: "12:00AM", checkOut: "——", hours: "4h20m", status: "Present" },
];

const statusStyle: Record<string, string> = {
  Present: "bg-green-100 text-green-700",
  Absent: "bg-red-100 text-red-500",
  Late: "bg-orange-100 text-orange-600",
};

const requestBadge: Record<RequestStatus, string> = {
  Pending: "bg-orange-100 text-orange-600",
  refused: "bg-slate-100 text-slate-500",
  Accept: "bg-green-100 text-green-700",
};

const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);
const presentDays = [4, 5, 7, 8, 11, 12, 14, 15, 18, 19, 20, 21, 22, 25, 26, 29];
const lateDays = [6, 13];
const onLeaveDays = [19, 20];
const today = 27;
const startOffset = 3;
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getDayStyle = (day: number) => {
  if (day === today) return "bg-blue-500 text-white font-bold rounded-full";
  if (lateDays.includes(day)) return "bg-orange-100 text-orange-600 font-semibold rounded-full";
  if (onLeaveDays.includes(day)) return "bg-blue-100 text-blue-500 font-semibold rounded-full";
  if (presentDays.includes(day)) return "bg-green-100 text-green-700 font-semibold rounded-full";
  return "text-slate-300";
};

export default function EmployeeAttendanceDetail() {
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [showExtraShift, setShowExtraShift] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const displayedRequests = showAllRequests ? [...requests, ...requests] : requests;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto p-6">
        {/* Breadcrumb */}
        <p className="text-xs text-slate-400 mb-4">
          <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate("/dashboard")}>Home</span>
          {" / "}
          <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate("/dashboard/attendance")}>Attendance</span>
          {" / "}
          <span className="text-blue-500 font-medium">Mohamed Morsy</span>
        </p>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-rose-200 flex items-center justify-center text-xl shrink-0">👤</div>
              <div>
                <h1 className="text-base font-bold text-slate-900">Mohamed Morsy</h1>
                <p className="text-sm text-slate-500 mb-2">Head Chef</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active Status</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">Full Time</span>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">Joined 15 / 01 / 2024</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowExtraShift(true)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors">
              + Add Extra Shift
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1">
              Leave & Attendance
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Left col */}
          <div className="col-span-2 flex flex-col gap-4">
            {/* Calendar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Attendance Overview</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <button className="hover:text-blue-500">‹</button>
                  <span>May 2025</span>
                  <button className="hover:text-blue-500">›</button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { icon: "✅", label: "PRESENT", value: 18, color: "text-green-600", bg: "bg-green-50" },
                  { icon: "⏰", label: "LATE", value: 2, color: "text-orange-500", bg: "bg-orange-50" },
                  { icon: "❌", label: "ABSENT", value: 0, color: "text-red-500", bg: "bg-red-50" },
                  { icon: "🏖", label: "ON LEAVE", value: 2, color: "text-blue-500", bg: "bg-blue-50" },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-2.5 text-center`}>
                    <span className="text-sm">{s.icon}</span>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((d) => (
                  <div key={d} className="text-[10px] text-slate-400 font-medium py-1">{d}</div>
                ))}
                {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}
                {calendarDays.map((day) => (
                  <div key={day} className={`w-7 h-7 mx-auto flex items-center justify-center text-[11px] cursor-pointer ${getDayStyle(day)}`}>
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-xs">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                    <th className="py-2.5 px-4 text-left">Date</th>
                    <th className="py-2.5 px-4 text-left">Check In</th>
                    <th className="py-2.5 px-4 text-left">Check Out</th>
                    <th className="py-2.5 px-4 text-left">Total Hours</th>
                    <th className="py-2.5 px-4 text-left">Status</th>
                    <th className="py-2.5 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="py-2.5 px-4 text-slate-600">{row.date}</td>
                      <td className="py-2.5 px-4 text-slate-600">{row.checkIn}</td>
                      <td className="py-2.5 px-4 text-slate-600">{row.checkOut}</td>
                      <td className="py-2.5 px-4 text-slate-600">{row.hours}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyle[row.status] || "bg-slate-100 text-slate-500"}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <button
                          onClick={() => setShowEdit(true)}
                          className={`text-slate-400 hover:text-blue-500 transition-colors ${row.status === "Absent" ? "text-slate-800" : ""}`}
                        >
                          {row.status === "Absent" ? "⚫" : "✏"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 border-t border-slate-50">
                <p className="text-[10px] text-slate-400">Showing 1-6 from 100 data</p>
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="flex flex-col gap-4">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Quick Actions</h3>
              <button className="w-full py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                ✉ Contact Employee
              </button>
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Recent Requests</h3>
              <div className="space-y-3">
                {displayedRequests.map((req, i) => (
                  <div key={i} className="border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-0.5">
                      <p className="text-xs font-semibold text-slate-700">{req.name}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${requestBadge[req.status]}`}>
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

            {/* Manager Notes */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Manager Notes</h3>
              <button className="text-xs text-blue-500 font-medium mb-3 hover:underline">Add Note</button>
              <p className="text-[10px] text-slate-300 mb-3">——</p>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <button className="text-xs text-blue-500 font-medium hover:underline">Add Note</button>
                  <span className="text-[10px] text-slate-400">06 / May</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Employee has been late twice this month, advised to improve punctuality
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEdit && <EditAttendanceModal onClose={() => setShowEdit(false)} />}
      {showExtraShift && <AddExtraShiftModal onClose={() => setShowExtraShift(false)} />}
    </div>
  );
}