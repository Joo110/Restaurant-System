// src/components/Staff/page/AttendancePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogAttendanceModal from "../page/LogAttendanceModal";
import EditAttendanceModal from "../page/EditAttendanceModal";

type AttendanceStatus = "Present" | "Completed" | "Absent" | "Late";

type AttendanceRecord = {
  id: number;
  name: string;
  role: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  status: AttendanceStatus;
};

const records: AttendanceRecord[] = [
  { id: 1, name: "Mohamed Morsy", role: "Head Chef", checkIn: "12:00AM", checkOut: "——", totalHours: "4h 20m", status: "Present" },
  { id: 2, name: "Mohamed Morsy", role: "Head Chef", checkIn: "12:00AM", checkOut: "08:00AM", totalHours: "8h 0m", status: "Completed" },
  { id: 3, name: "Mohamed Morsy", role: "Head Chef", checkIn: "——", checkOut: "——", totalHours: "——", status: "Absent" },
  { id: 4, name: "Mohamed Morsy", role: "Head Chef", checkIn: "12:00AM", checkOut: "——", totalHours: "7h 0m", status: "Present" },
  { id: 5, name: "Mohamed Morsy", role: "Head Chef", checkIn: "12:00AM", checkOut: "——", totalHours: "1h 05m", status: "Present" },
  { id: 6, name: "Mohamed Morsy", role: "Head Chef", checkIn: "12:00AM", checkOut: "——", totalHours: "4h 20m", status: "Present" },
];

const statusStyle: Record<AttendanceStatus, string> = {
  Present:   "bg-green-100 text-green-700",
  Completed: "bg-blue-100 text-blue-700",
  Absent:    "bg-red-100 text-red-500",
  Late:      "bg-orange-100 text-orange-600",
};

export default function AttendancePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showLog, setShowLog] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const stats = [
    { label: "Present",  value: 12, total: 15, color: "bg-blue-500",   text: "text-slate-800"  },
    { label: "Late",     value: 3,  total: 12, color: "bg-orange-400", text: "text-orange-500" },
    { label: "Absent",   value: 2,  total: 12, color: "bg-red-400",    text: "text-red-500"    },
    { label: "On Leave", value: 1,  total: 12, color: "bg-blue-300",   text: "text-slate-800"  },
  ];

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
            placeholder="Search Employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowLog(true)}
          className="sm:ml-auto px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap"
        >
          Log Adjustment
        </button>
      </div>

      {/* Stats — 2 col mobile → 4 col md+ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.color}`} />
              <p className="text-xs text-slate-500 truncate">{s.label}</p>
            </div>
            <p className={`text-xl sm:text-2xl font-bold ${s.text} mb-2`}>
              {s.value} <span className="text-xs sm:text-sm font-normal text-slate-400">/ {s.total}</span>
            </p>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${s.color} rounded-full`} style={{ width: `${(s.value / s.total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Table — scrollable on mobile */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                <th className="py-3 px-4 text-left">Employee</th>
                <th className="py-3 px-4 text-left">Role</th>
                <th className="py-3 px-4 text-left">Check In</th>
                <th className="py-3 px-4 text-left">Check Out</th>
                <th className="py-3 px-4 text-left">Total Hours</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {records
                .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
                .map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/staff/${r.id}/attendance`)}
                  >
                    <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">{r.name}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{r.role}</td>
                    <td className="py-3 px-4 text-slate-600">{r.checkIn}</td>
                    <td className="py-3 px-4 text-slate-600">{r.checkOut}</td>
                    <td className="py-3 px-4 text-slate-600">{r.totalHours}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyle[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
                        className="text-slate-400 hover:text-blue-500 transition-colors"
                      >
                        ✏
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-slate-50">
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

      {showLog  && <LogAttendanceModal  onClose={() => setShowLog(false)}  />}
      {showEdit && <EditAttendanceModal onClose={() => setShowEdit(false)} />}
    </div>
  );
}