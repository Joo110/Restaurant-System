// src/components/dashboard/page/Dashboard.tsx
import React from "react";
import StatCard from "../page/StatCard";
import SalesTrend from "../page/SalesTrend";
import TopDishes from "../page/TopDishes";
import OrderStatusChart from "../page/OrderStatusChart";
import BusyHours from "../page/BusyHours";
import KitchenPerformance from "../page/KitchenPerformance";

const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 w-full">
      {/* Stat Cards — 1 col mobile → 2 col tablet → 4 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon="💰" title="Total Sales"    value="$122,512" change="+4%" />
        <StatCard icon="📋" title="Total Orders"   value="521"      change="+2%" />
        <StatCard
          icon="🍽️"
          title="Active Tables"
          value="18 / 25"
          change="+1%"
          bar="72%"
          barColor="#3B82F6"
        />
        <StatCard
          icon="👤"
          title="Staff On Shift"
          value="8/10"
          change="0%"
          bar="80%"
          barColor="#10B981"
        />
      </div>

      {/* Sales Trend — full width */}
      <SalesTrend />

      {/* Middle Row — stacks on mobile, side-by-side on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <TopDishes />
        <div className="flex flex-col gap-4">
          <OrderStatusChart />
          <BusyHours />
        </div>
      </div>

      {/* Kitchen Performance — full width */}
      <KitchenPerformance />
    </div>
  );
};

export default Dashboard;