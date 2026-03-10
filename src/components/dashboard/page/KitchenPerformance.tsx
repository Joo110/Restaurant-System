// src/components/dashboard/page/KitchenPerformance.tsx
import React from "react";
import { Clock } from "lucide-react";

interface KitchenPerformanceProps {
  performance?: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

// helper: تحوّل "N/A" أو رقم لنسبة مئوية للبار
const parsePct = (val: string): number => {
  if (!val || val === "N/A") return 0;
  const n = parseFloat(val);
  return isNaN(n) ? 0 : Math.min((n / 60) * 100, 100); // نفترض max 60 دقيقة
};

const meals = [
  { key: "breakfast" as const, label: "Breakfast", color: "#F97316" },
  { key: "lunch" as const,     label: "Lunch",     color: "#3B82F6" },
  { key: "dinner" as const,    label: "Dinner",    color: "#8B5CF6" },
];

const KitchenPerformance: React.FC<KitchenPerformanceProps> = ({ performance }) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-1">
        Kitchen Performance
      </h2>
      <p className="text-xs text-gray-400 mb-4 sm:mb-5 flex items-center gap-1.5">
        <Clock size={11} />
        Average Preparation Time (minutes)
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meals.map((m) => {
          const val = performance?.[m.key] ?? "N/A";
          const pct = parsePct(val);
          return (
            <div key={m.key} className="flex items-center gap-3 sm:gap-4">
              <span className="w-14 sm:w-16 text-xs sm:text-sm text-gray-600 flex-shrink-0 truncate">
                {m.label}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: m.color }}
                />
              </div>
              <span className="w-14 text-right text-xs sm:text-sm text-gray-400 flex-shrink-0">
                {val === "N/A" ? "N/A" : `${val} min`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KitchenPerformance;