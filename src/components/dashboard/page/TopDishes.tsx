// src/components/dashboard/page/TopDishes.tsx
import React from "react";

interface Dish {
  name: string;
  orders?: number;
  revenue?: number;
  category?: string;
  [k: string]: any;
}

interface TopDishesProps {
  dishes: Dish[];
}

const categoryEmoji: Record<string, string> = {
  mains:      "🍖",
  starters:   "🥗",
  desserts:   "🍰",
  drinks:     "🥤",
  salads:     "🥙",
};

const TopDishes: React.FC<TopDishesProps> = ({ dishes }) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        Top selling dishes
      </h2>

      {/* Header Row */}
      <div className="grid grid-cols-[1fr_60px_70px] text-xs px-2 mb-2">
        <span className="text-blue-600 font-semibold">Dish Name</span>
        <span className="text-center text-gray-400">Orders</span>
        <span className="text-right text-emerald-600 font-semibold">Revenue</span>
      </div>

      {dishes.length === 0 ? (
        <p className="text-xs text-gray-300 text-center py-8">No dishes yet</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {dishes.map((dish, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_60px_70px] items-center px-2 py-2 sm:py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                <span className="text-lg sm:text-xl flex-shrink-0">
                  {categoryEmoji[dish.category?.toLowerCase() ?? ""] ?? "🍽️"}
                </span>
                <span className="text-xs sm:text-sm text-gray-700 font-medium truncate">
                  {dish.name}
                </span>
              </div>
              <span className="text-center text-xs sm:text-sm text-gray-500">
                {dish.orders ?? 0}
              </span>
              <span className="text-right text-xs sm:text-sm text-emerald-600 font-semibold">
                ${dish.revenue ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopDishes;