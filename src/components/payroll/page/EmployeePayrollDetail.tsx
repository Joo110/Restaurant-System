// src/components/Staff/page/EmployeePayrollDetail.tsx
import { useNavigate } from "react-router-dom";
import ProcessPayrollModal from "./ProcessPayrollModal";
import { useState } from "react";

const schedule = [
  { day: "Sat", time: "12:00 - 6:00" },
  { day: "Sun", time: "13:00 - 6:00" },
  { day: "Mon", time: "12:00 - 6:00" },
  { day: "Mon", time: "12:00 - 6:00" },
  { day: "Tue", time: "12:00 - 8:00" },
];

export default function EmployeePayrollDetail() {
  const navigate = useNavigate();
  const [showProcess, setShowProcess] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto p-6">
        {/* Breadcrumb */}
        <p className="text-xs text-slate-400 mb-4">
          <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate("/dashboard")}>Home</span>
          {" / "}
          <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate("/dashboard/payroll")}>Payroll</span>
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
              onClick={() => setShowProcess(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              ▶ Process Payroll
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1">
              Payroll Details
            </button>
          </div>
        </div>

        {/* Two-col layout */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-800 text-sm mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-slate-400 mt-0.5 text-sm">✉</span>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Email Address</p>
                  <p className="text-xs text-slate-700 font-medium">Mohamed@66gmail.com</p>
                  <p className="text-[10px] text-slate-400">Work</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-slate-400 mt-0.5 text-sm">📍</span>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Residential Address</p>
                  <p className="text-xs text-slate-700 font-medium">122 Maadi Street</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-slate-400 mt-0.5 text-sm">📞</span>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Phone Number</p>
                  <p className="text-xs text-slate-700 font-medium">+20 1024566</p>
                  <p className="text-[10px] text-slate-400">Mobile</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-800 text-sm mb-4">Employment Details</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Branch</p>
                <p className="text-xs text-slate-700 font-medium">Mansoura</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Role</p>
                <p className="text-xs text-slate-700 font-medium">Head chef</p>
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

        {/* Earnings Details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400">Pay Period</p>
              <p className="text-sm font-semibold text-slate-700">November 01 – November 30, 2026</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Payment Date</p>
              <p className="text-sm font-semibold text-slate-700">Nov 30, 2025</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Gross Earnings */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <p className="text-xs font-bold text-slate-700">Gross Earnings</p>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-slate-500 font-medium">Regular Pay</p>
                  <p className="text-[10px] text-slate-400">80.20 Hours * $25.55/H</p>
                  <p className="text-slate-700 font-semibold mt-0.5">$2,000.00</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Overtime</p>
                  <p className="text-[10px] text-slate-400">9.2 Hours * $37.50/H</p>
                  <p className="text-slate-700 font-semibold mt-0.5">$187.50</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Bonus</p>
                  <p className="text-[10px] text-slate-400">Quarterly Incentive</p>
                  <p className="text-slate-700 font-semibold mt-0.5">$312.50</p>
                </div>
              </div>
              <div className="border-t border-slate-100 mt-3 pt-2 flex justify-between">
                <p className="text-xs text-slate-500">Total Gross Pay</p>
                <p className="text-xs font-bold text-green-600">$2,000.00</p>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <p className="text-xs font-bold text-slate-700">Deductions</p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <p className="text-slate-500">Mediacare</p>
                  <p className="text-red-500 font-semibold">-$230.00</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-slate-500">Drinks</p>
                  <p className="text-red-500 font-semibold">-$85.00</p>
                </div>
              </div>
              <div className="border-t border-slate-100 mt-3 pt-2 flex justify-between">
                <p className="text-xs text-slate-500">Total Deductions</p>
                <p className="text-xs font-bold text-red-500">-$305.00</p>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏦</span>
              <div>
                <p className="text-xs font-semibold text-slate-700">Net Pay</p>
                <p className="text-[10px] text-slate-400">Chase Bank ******592</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">$2,195.00</p>
          </div>
        </div>
      </div>

      {showProcess && <ProcessPayrollModal onClose={() => setShowProcess(false)} />}
    </div>
  );
}