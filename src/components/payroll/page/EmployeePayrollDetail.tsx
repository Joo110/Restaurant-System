// src/components/Payroll/page/EmployeePayrollDetail.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProcessPayrollModal from "./ProcessPayrollModal";
import { usePayroll } from "../hook/usePayroll";

const MONTH_KEYS = [
  "",
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function EmployeePayrollDetail() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showProcess, setShowProcess] = useState(false);

  const { data: raw, isLoading, refetch } = usePayroll(id);

  const payroll = (raw as any)?.data ?? raw;

  const isArabic = i18n.language?.toLowerCase().startsWith("ar");
  const dateLocale = isArabic ? "ar-EG" : "en-GB";

  const monthLabel =
    payroll?.month && MONTH_KEYS[payroll.month]
      ? t(`payroll.detail.months.${MONTH_KEYS[payroll.month]}`)
      : "—";

  // ── loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">{t("payroll.detail.loadingPayroll")}</p>
        </div>
      </div>
    );
  }

  // ── not found ─────────────────────────────────────────────────────────────
  if (!payroll) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-3">{t("payroll.detail.recordNotFound")}</p>
          <button
            onClick={() => navigate("/dashboard/payroll")}
            className="text-blue-500 text-sm underline"
          >
            {t("payroll.detail.backToPayroll")}
          </button>
        </div>
      </div>
    );
  }

  // ── derived values ────────────────────────────────────────────────────────
  const employeeName = payroll.employeeName ?? payroll.employee?.fullName ?? "—";
  const role = payroll.employee?.role ?? payroll.role ?? "—";
  const branch = payroll.branch ?? "—";
  const employeeId = payroll.employeeId ?? "—";

  const payPeriod = payroll.month && payroll.year
    ? `${monthLabel} ${payroll.year}`
    : "—";

  const paymentDate = payroll.paymentDate
    ? new Date(payroll.paymentDate).toLocaleDateString(dateLocale, { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  const baseSalary = Number(payroll.baseSalary ?? 0);
  const overtimePay = Number(payroll.overtimePay ?? 0);
  const bonus = Number(payroll.bonus ?? 0);
  const deductions = Number(payroll.deductions ?? 0);
  const tax = Number(payroll.tax ?? 0);
  const grossSalary = Number(payroll.grossSalary ?? baseSalary + overtimePay + bonus);
  const netPay = Number(payroll.netSalary ?? grossSalary - deductions - tax);

  const totalDaysWorked = payroll.totalDaysWorked ?? "—";
  const totalHoursWorked = payroll.totalHoursWorked ?? "—";
  const absentDays = payroll.absentDays ?? 0;
  const lateDays = payroll.lateDays ?? 0;
  const vacationDays = payroll.vacationDays ?? 0;

  const budget = payroll.budget ?? null;

  const statusStyle =
    payroll.paymentStatus === "paid"
      ? "bg-green-100 text-green-700"
      : payroll.paymentStatus === "pending"
      ? "bg-orange-100 text-orange-600"
      : "bg-slate-100 text-slate-500";

  const paymentStatusLabel = (status?: string) => {
    if (!status) return "—";
    const map: Record<string, string> = {
      paid: t("payroll.detail.statuses.paid"),
      pending: t("payroll.detail.statuses.pending"),
      processing: t("payroll.detail.statuses.processing"),
      unpaid: t("payroll.detail.statuses.unpaid"),
    };
    return map[status] ?? status;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">

        {/* Breadcrumb */}
        <p className="text-xs text-slate-400 mb-4">
          <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate("/dashboard")}>
            {t("common.home")}
          </span>
          {" / "}
          <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate("/dashboard/payroll")}>
            {t("common.payroll")}
          </span>
          {" / "}
          <span className="text-blue-500 font-medium">{employeeName}</span>
        </p>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 mb-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-rose-200 flex items-center justify-center text-xl shrink-0">👤</div>
              <div>
                <h1 className="text-base font-bold text-slate-900">{employeeName}</h1>
                <p className="text-sm text-slate-500 mb-2">{role}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${statusStyle}`}>
                    {paymentStatusLabel(payroll.paymentStatus)}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                    {branch}
                  </span>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
                    {payPeriod}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {t("common.refresh")}
              </button>
              <button
                onClick={() => setShowProcess(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap"
              >
                ▶ {t("payroll.detail.processPayroll")}
              </button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1">
              {t("payroll.detail.payrollDetails")}
            </button>
          </div>
        </div>

        {/* Two-col layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

          {/* Attendance Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
            <h2 className="font-bold text-slate-800 text-sm mb-4">{t("payroll.detail.attendanceSummary")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t("payroll.detail.daysWorked"), value: totalDaysWorked, color: "text-green-600" },
                { label: t("payroll.detail.hoursWorked"), value: totalHoursWorked, color: "text-blue-600" },
                { label: t("payroll.detail.absentDays"), value: absentDays, color: "text-red-500" },
                { label: t("payroll.detail.lateDays"), value: lateDays, color: "text-orange-500" },
                { label: t("payroll.detail.vacationDays"), value: vacationDays, color: "text-purple-500" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
            <h2 className="font-bold text-slate-800 text-sm mb-4">{t("payroll.detail.employmentDetails")}</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t("payroll.detail.branch")}</p>
                <p className="text-xs text-slate-700 font-medium">{branch}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t("payroll.detail.role")}</p>
                <p className="text-xs text-slate-700 font-medium">{role}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t("payroll.detail.employeeId")}</p>
                <p className="text-xs text-slate-700 font-medium break-all">{employeeId}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t("payroll.detail.createdBy")}</p>
                <p className="text-xs text-slate-700 font-medium">{payroll.createdBy ?? "—"}</p>
              </div>
            </div>

            {/* Budget */}
            {budget && (
              <>
                <p className="text-xs font-semibold text-slate-600 mb-2">{t("payroll.detail.budget")}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: t("payroll.detail.planned"), value: budget.planned, color: "text-slate-700" },
                    { label: t("payroll.detail.actual"), value: budget.actual, color: "text-blue-600" },
                    { label: t("payroll.detail.variance"), value: budget.variance, color: budget.variance < 0 ? "text-red-500" : "text-green-600" },
                  ].map((b) => (
                    <div key={b.label}>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{b.label}</p>
                      <p className={`text-xs font-bold ${b.color}`}>
                        {b.value != null ? `$${Number(b.value).toLocaleString()}` : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Earnings Details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <p className="text-xs text-slate-400">{t("payroll.detail.payPeriod")}</p>
              <p className="text-sm font-semibold text-slate-700">{payPeriod}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{t("payroll.detail.paymentDate")}</p>
              <p className="text-sm font-semibold text-slate-700">{paymentDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Gross Earnings */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <p className="text-xs font-bold text-slate-700">{t("payroll.detail.grossEarnings")}</p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 font-medium">{t("payroll.detail.baseSalary")}</p>
                  <p className="text-slate-700 font-semibold">${baseSalary.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 font-medium">{t("payroll.detail.overtimePay")}</p>
                  <p className="text-slate-700 font-semibold">${overtimePay.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-slate-500 font-medium">{t("payroll.detail.bonus")}</p>
                  <p className="text-slate-700 font-semibold">${bonus.toLocaleString()}</p>
                </div>
              </div>
              <div className="border-t border-slate-100 mt-3 pt-2 flex justify-between">
                <p className="text-xs text-slate-500">{t("payroll.detail.totalGrossPay")}</p>
                <p className="text-xs font-bold text-green-600">${grossSalary.toLocaleString()}</p>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <p className="text-xs font-bold text-slate-700">{t("payroll.detail.deductions")}</p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500">{t("payroll.detail.tax")}</p>
                  <p className="text-red-500 font-semibold">-${tax.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-slate-500">{t("payroll.detail.otherDeductions")}</p>
                  <p className="text-red-500 font-semibold">-${deductions.toLocaleString()}</p>
                </div>
              </div>
              <div className="border-t border-slate-100 mt-3 pt-2 flex justify-between">
                <p className="text-xs text-slate-500">{t("payroll.detail.totalDeductions")}</p>
                <p className="text-xs font-bold text-red-500">-${(tax + deductions).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏦</span>
              <div>
                <p className="text-xs font-semibold text-slate-700">{t("payroll.detail.netPay")}</p>
                <p className="text-[10px] text-slate-400">{branch}</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">${netPay.toLocaleString()}</p>
          </div>
        </div>

      </div>

      {showProcess && (
        <ProcessPayrollModal
          onClose={() => setShowProcess(false)}
          totalAmount={netPay}
          defaultMonth={payroll.month}
          defaultYear={payroll.year}
          defaultBranchId={typeof payroll.branch === "string" ? payroll.branch : undefined}
        />
      )}
    </div>
  );
}