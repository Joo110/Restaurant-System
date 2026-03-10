// src/components/dashboard/page/OrderStatusChart.tsx
import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface OrderStatusChartProps {
  breakdown: { status?: string; count?: number; name?: string; value?: number; color?: string; [k: string]: any }[];
}

const STATUS_COLORS: Record<string, string> = {
  completed:  "#10B981",
  pending:    "#F97316",
  cancelled:  "#EF4444",
  scheduled:  "#3B82F6",
};

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ breakdown }) => {
  const chartData = breakdown.map((item) => ({
    name:  item.name  ?? item.status ?? "Unknown",
    value: item.value ?? item.count  ?? 0,
    color: item.color ?? STATUS_COLORS[(item.status ?? item.name ?? "").toLowerCase()] ?? "#6B7280",
  }));

  const isEmpty = chartData.length === 0 || chartData.every((d) => d.value === 0);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        Order Status Breakdown
      </h2>

      {isEmpty ? (
        <p className="text-xs text-gray-300 text-center py-8">No orders yet</p>
      ) : (
        <>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={68}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around mt-3 flex-wrap gap-2">
            {chartData.map((item, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center gap-1.5 justify-center mb-1">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-gray-400 capitalize">{item.name}</span>
                </div>
                <p className="text-sm font-bold" style={{ color: item.color }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderStatusChart;