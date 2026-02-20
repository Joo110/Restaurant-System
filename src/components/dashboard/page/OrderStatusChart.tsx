import React from "react";
import { Cell, Pie, PieChart } from "recharts";
import { orderStatusData } from "../../../../data/dashboardData";

const OrderStatusChart: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        Order Status Breakdown
      </h2>

      <div className="flex justify-center">
        <PieChart width={150} height={150}>
          <Pie
            data={orderStatusData}
            cx={70}
            cy={70}
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
      </div>

      <div className="flex justify-around mt-3">
        {orderStatusData.map((item, i) => (
          <div key={i} className="text-center">
            <div className="flex items-center gap-1.5 justify-center mb-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-gray-400">{item.name}</span>
            </div>
            <p
              className="text-sm font-bold"
              style={{ color: item.color }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusChart;