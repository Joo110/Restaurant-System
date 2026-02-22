// src/components/dashboard/page/OrderStatusChart.tsx
import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { orderStatusData } from "../../../../data/dashboardData";

const OrderStatusChart: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        Order Status Breakdown
      </h2>

      {/* Pie — responsive wrapper */}
      <div className="flex justify-center">
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={orderStatusData}
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={68}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {orderStatusData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-around mt-3 flex-wrap gap-2">
        {orderStatusData.map((item, i) => (
          <div key={i} className="text-center">
            <div className="flex items-center gap-1.5 justify-center mb-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-gray-400">{item.name}</span>
            </div>
            <p className="text-sm font-bold" style={{ color: item.color }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusChart;