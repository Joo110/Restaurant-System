// src/components/dashboard/page/Dashboard.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import StatCard from "../page/StatCard";
import SalesTrend from "../page/SalesTrend";
import TopDishes from "../page/TopDishes";
import OrderStatusChart from "../page/OrderStatusChart";
import BusyHours from "../page/BusyHours";
import KitchenPerformance from "../page/KitchenPerformance";
import { useDashboard } from "../hook/useAccounts";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useDashboard();
  const d = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-400 text-sm animate-pulse">{t("dashboard.loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5 w-full">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon="💰"
          title={t("dashboard.statCards.totalSales")}
          value={`$${d?.totalSales.value ?? 0}`}
          change={d?.totalSales.change ?? "0%"}
        />
        <StatCard
          icon="📋"
          title={t("dashboard.statCards.totalOrders")}
          value={String(d?.totalOrders.value ?? 0)}
          change={d?.totalOrders.change ?? "0%"}
        />
        <StatCard
          icon="🍽️"
          title={t("dashboard.statCards.activeTables")}
          value={d?.activeTables.value ?? "0 / 0"}
          change={d?.activeTables.change ?? "0%"}
          bar={
            d?.activeTables.value
              ? `${Math.round(
                  (parseInt(d.activeTables.value.split("/")[0]) /
                    parseInt(d.activeTables.value.split("/")[1])) *
                    100
                )}%`
              : "0%"
          }
          barColor="#3B82F6"
        />
        <StatCard
          icon="👤"
          title={t("dashboard.statCards.staffOnShift")}
          value={`${d?.staffOnShift.value ?? 0}/${d?.staffOnShift.total ?? 0}`}
          change={`${d?.staffOnShift.percentage ?? 0}%`}
          bar={`${d?.staffOnShift.percentage ?? 0}%`}
          barColor="#10B981"
        />
      </div>

      {/* Sales Trend */}
      <SalesTrend totalSales={d?.totalSales.value} />

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <TopDishes dishes={d?.topSellingDishes ?? []} />
        <div className="flex flex-col gap-4">
          <OrderStatusChart breakdown={d?.orderStatusBreakdown ?? []} />
          <BusyHours busyHours={d?.busyHours ?? []} />
        </div>
      </div>

      {/* Kitchen Performance */}
      <KitchenPerformance performance={d?.kitchenPerformance} />
    </div>
  );
};

export default Dashboard;