// src/components/dashboard/page/SalesTrend.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Filter, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SalesTrendProps {
  totalSales?: number;
}

const SalesTrend: React.FC<SalesTrendProps> = ({ totalSales }) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState(t("dashboard.salesTrend.weekly"));

  const placeholderData = [
    { day: t("dashboard.salesTrend.days.mon"), sales: 0 },
    { day: t("dashboard.salesTrend.days.tue"), sales: 0 },
    { day: t("dashboard.salesTrend.days.wed"), sales: 0 },
    { day: t("dashboard.salesTrend.days.thu"), sales: 0 },
    { day: t("dashboard.salesTrend.days.fri"), sales: 0 },
    { day: t("dashboard.salesTrend.days.sat"), sales: totalSales ?? 0 },
    { day: t("dashboard.salesTrend.days.sun"), sales: 0 },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">{t("dashboard.salesTrend.title")}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm shadow-emerald-200">
              <TrendingUp size={12} className="text-white" />
            </span>
            <span className="text-lg sm:text-xl font-bold text-gray-800">
              ${totalSales?.toLocaleString() ?? "0"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 outline-none focus:border-blue-400 bg-white cursor-pointer"
          >
            <option>{t("dashboard.salesTrend.weekly")}</option>
            <option>{t("dashboard.salesTrend.monthly")}</option>
            <option>{t("dashboard.salesTrend.yearly")}</option>
          </select>
          <button className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors bg-white">
            <Filter size={11} />
            {t("dashboard.salesTrend.filter")}
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart
          data={placeholderData}
          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "12px" }}
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#2563EB", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesTrend;