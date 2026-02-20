import React from "react";
import { topDishes } from "../../../../data/dashboardData";

const TopDishes: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        Top selling dishes
      </h2>

      {/* Header Row */}
      <div className="grid grid-cols-[1fr_60px_70px] text-xs px-2 mb-2">
        <span className="text-blue-600 font-semibold">Dish Name</span>
        <span className="text-center text-gray-400">Orders</span>
        <span className="text-right text-emerald-600 font-semibold">Revenue</span>
      </div>

      {/* Dish Rows */}
      <div className="flex flex-col gap-0.5">
        {topDishes.map((dish, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_60px_70px] items-center px-2 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-xl flex-shrink-0">{dish.img}</span>
              <span className="text-sm text-gray-700 font-medium truncate">
                {dish.name}
              </span>
            </div>
            <span className="text-center text-sm text-gray-500">
              {dish.orders}
            </span>
            <span className="text-right text-sm text-emerald-600 font-semibold">
              {dish.revenue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopDishes;