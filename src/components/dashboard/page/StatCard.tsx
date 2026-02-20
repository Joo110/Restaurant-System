import React from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  change: string;
  bar?: string;
  barColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  change,
  bar,
  barColor,
}) => {
  const isPositive = parseFloat(change) >= 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
        <span className="text-base">{icon}</span>
        <span className="font-medium">{title}</span>
      </div>

      <div className="flex items-end justify-between mb-1">
        <p className="text-2xl font-bold text-gray-800 tracking-tight">{value}</p>
        <span
          className={`text-xs flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-full ${
            isPositive
              ? "text-emerald-600 bg-emerald-50"
              : "text-red-500 bg-red-50"
          }`}
        >
          <ArrowUpRight
            size={11}
            className={isPositive ? "" : "rotate-90"}
          />
          {change}
        </span>
      </div>

      {bar && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 my-3">
          <div
            className="h-1.5 rounded-full transition-all duration-700"
            style={{ width: bar, backgroundColor: barColor }}
          />
        </div>
      )}

      <p className="text-[10px] text-gray-300 mb-3 mt-2">
        Relative to yesterday
      </p>

      <button className="text-xs text-blue-600 flex items-center gap-1 hover:gap-2 transition-all font-semibold group">
        View Details{" "}
        <ArrowRight
          size={12}
          className="group-hover:translate-x-0.5 transition-transform"
        />
      </button>
    </div>
  );
};

export default StatCard;