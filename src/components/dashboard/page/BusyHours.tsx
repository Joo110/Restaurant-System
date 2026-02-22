// src/components/dashboard/page/BusyHours.tsx
import React from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { busyHoursData } from "../../../../data/dashboardData";

const BusyHours: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Busy Hours</h2>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart
          data={busyHoursData}
          barCategoryGap="25%"
          margin={{ left: -20, right: 0 }}
        >
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              borderRadius: 8,
              border: "1px solid #E5E7EB",
            }}
          />
          <Bar dataKey="a" fill="#F97316" radius={[4, 4, 0, 0]} />
          <Bar dataKey="b" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BusyHours;