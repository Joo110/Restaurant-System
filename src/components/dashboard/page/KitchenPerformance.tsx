// src/components/dashboard/page/KitchenPerformance.tsx
import React from "react";
import { Clock } from "lucide-react";
import { kitchenPerformance } from "../../../../data/dashboardData";

const KitchenPerformance: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-1">
        Kitchen Performance
      </h2>
      <p className="text-xs text-gray-400 mb-4 sm:mb-5 flex items-center gap-1.5">
        <Clock size={11} />
        Average Preparation Time (minutes)
      </p>

      {/* 1 col mobile → 2 col md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kitchenPerformance.map((item, i) => (
          <div key={i} className="flex items-center gap-3 sm:gap-4">
            <span className="w-14 sm:w-16 text-xs sm:text-sm text-gray-600 flex-shrink-0 truncate">
              {item.meal}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${item.pct}%`, backgroundColor: item.color }}
              />
            </div>
            <span className="w-14 text-right text-xs sm:text-sm text-gray-400 flex-shrink-0">
              {item.time} min
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenPerformance;