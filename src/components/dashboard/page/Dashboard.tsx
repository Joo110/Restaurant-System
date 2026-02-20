import React from "react";
import StatCard from "../page/StatCard";
import SalesTrend from "../page/SalesTrend";
import TopDishes from "../page/TopDishes";
import OrderStatusChart from "../page/OrderStatusChart";
import BusyHours from "../page/BusyHours";
import KitchenPerformance from "../page/KitchenPerformance";

const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto">
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="💰" title="Total Sales" value="$122,512" change="+4%" />
        <StatCard icon="📋" title="Total Orders" value="521" change="+2%" />
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

      {/* Sales Trend */}
      <SalesTrend />

      {/* Middle Row: Top Dishes + Right Column */}
      <div className="grid grid-cols-[1fr_280px] gap-4">
        <TopDishes />

        <div className="flex flex-col gap-4">
          <OrderStatusChart />
          <BusyHours />
        </div>
      </div>

      {/* Kitchen Performance */}
      <KitchenPerformance />
    </div>
  );
};

export default Dashboard;