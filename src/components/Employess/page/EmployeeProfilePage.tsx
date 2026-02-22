// src/components/Staff/page/EmployeeProfilePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LeaveAttendancePage from "../page/LeaveAttendancePage";

type Tab = "Overview" | "Leave & Attendance";

const schedule = [
  { day: "Sun", time: "12:00 - 6:00" },
  { day: "Sun", time: "12:00 - 6:00" },
  { day: "Mon", time: "12:00 - 6:00" },
  { day: "Wen", time: "12:00 - 8:00" },
  { day: "Tue", time: "10:00 - 8:00" },
];

export default function EmployeeProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-5xl mx-auto p-3 sm:p-6">

        {/* Breadcrumb */}
        <p className="text-xs text-slate-400 mb-4">
          <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate("/dashboard")}>Home</span>
          {" / "}
          <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate("/dashboard/staff")}>Staff</span>
          {" / "}
          <span className="text-blue-500 font-medium">Mohamed Morsy</span>
        </p>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-200 flex items-center justify-center text-2xl shrink-0">
                👤
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900">Mohamed Morsy</h1>
                <p className="text-sm text-slate-500 mb-1.5">Head Chef</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active Status</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">Full Time</span>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">Joined 15/01/2024</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/staff/1/edit")}
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

        {/* Tab Content */}
        {activeTab === "Overview" ? (
          <div className="flex flex-col gap-4">

            {/* Contact + Employment — stack on mobile, side by side on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Information */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
                <h2 className="font-bold text-slate-800 text-sm mb-4">Contact Information</h2>
                <div className="space-y-4">
                  {[
                    { icon: "✉", label: "Email Address",        value: "Mohamed@66gmail.com", sub: "Work"   },
                    { icon: "📍", label: "Residential Address",  value: "122 Maadi Street",    sub: null     },
                    { icon: "📞", label: "Phone Number",         value: "+20 1024566",         sub: "Mobile" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="text-slate-400 mt-0.5 flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{item.label}</p>
                        <p className="text-sm text-slate-700 font-medium">{item.value}</p>
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
                    <p className="text-sm text-slate-700 font-medium">Mansoura</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Role</p>
                    <p className="text-sm text-slate-700 font-medium">Head chef</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">ID Number</p>
                    <p className="text-xs text-slate-700 font-medium">20202154441</p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Current shift Schedule</p>
                <div className="flex flex-wrap gap-1.5">
                  {schedule.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg border border-blue-100">
                      {s.day}: {s.time}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Compensations — 2 col on mobile → 4 col on md+ */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
              <h2 className="font-bold text-slate-800 text-sm mb-4">Compensations & Pay Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Base Salary</p>
                  <p className="text-lg sm:text-xl font-bold text-slate-800">$6,450.00</p>
                  <p className="text-[10px] text-slate-400">/ Month</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Pay Grade</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">Head chef</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Pay Frequency</p>
                  <p className="text-sm font-semibold text-slate-700 mt-1">Monthly</p>
                  <p className="text-[10px] text-slate-400">Next Payday: Jun 30, 2026</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Bank Account</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-slate-500">🏦</span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700">**** **** **** 8842</p>
                  </div>
                  <p className="text-[10px] text-slate-400">Chase Bank . Checking</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-4 flex items-center gap-1 flex-wrap">
                🔒 Sensitive financial data is masked. Use 'Edit pay & Pay Details' to review full information within 2FA.
              </p>
            </div>
          </div>
        ) : (
          <LeaveAttendancePage />
        )}
      </div>
    </div>
  );
}