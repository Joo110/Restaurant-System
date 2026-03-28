import React, { useState } from "react";
import { AlertTriangle, Users, Grid3x3, CheckCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

type NotifCategory = "Urgent" | "Staff" | "System";
type NotifFilter = "All" | "Unread" | "System" | "Urgent" | "Staff";

interface Notification {
  id: number;
  category: NotifCategory;
  tagKey: string;
  tagColor: string;
  titleKey: string;
  bodyKey: string;
  timeAgo: string;
  actionLabelKey: string;
  read: boolean;
}

const INITIAL: Notification[] = [
  { id: 1, category: "Urgent", tagKey: "inventory", tagColor: "bg-red-100 text-red-600", titleKey: "lowStockSalmonSteak", bodyKey: "inventoryDroppedBelow5ReorderImmediately", timeAgo: "10m ago", actionLabelKey: "orderNow", read: false },
  { id: 2, category: "Urgent", tagKey: "inventory", tagColor: "bg-red-100 text-red-600", titleKey: "lowStockSalmonSteak", bodyKey: "inventoryDroppedBelow5ReorderImmediately", timeAgo: "10m ago", actionLabelKey: "orderNow", read: false },
  { id: 3, category: "Urgent", tagKey: "inventory", tagColor: "bg-red-100 text-red-600", titleKey: "lowStockSalmonSteak", bodyKey: "inventoryDroppedBelow5ReorderImmediately", timeAgo: "10m ago", actionLabelKey: "orderNow", read: false },
  { id: 4, category: "Urgent", tagKey: "inventory", tagColor: "bg-red-100 text-red-600", titleKey: "lowStockSalmonSteak", bodyKey: "inventoryDroppedBelow5ReorderImmediately", timeAgo: "10m ago", actionLabelKey: "orderNow", read: false },
  { id: 5, category: "Urgent", tagKey: "inventory", tagColor: "bg-red-100 text-red-600", titleKey: "lowStockSalmonSteak", bodyKey: "inventoryDroppedBelow5ReorderImmediately", timeAgo: "10m ago", actionLabelKey: "orderNow", read: true },
  { id: 6, category: "Staff", tagKey: "staff", tagColor: "bg-slate-100 text-slate-600", titleKey: "mohamedMorsyHeadChef", bodyKey: "checkIn1215", timeAgo: "10m ago", actionLabelKey: "viewDetails", read: false },
  { id: 7, category: "Staff", tagKey: "staff", tagColor: "bg-slate-100 text-slate-600", titleKey: "mohamedMorsyHeadChef", bodyKey: "checkIn1215", timeAgo: "10m ago", actionLabelKey: "viewDetails", read: true },
  { id: 8, category: "System", tagKey: "payroll", tagColor: "bg-blue-100 text-blue-600", titleKey: "payrollApprovalNeeded", bodyKey: "monthlyPayrollReadyForReview", timeAgo: "10m ago", actionLabelKey: "review", read: false },
  { id: 9, category: "System", tagKey: "payroll", tagColor: "bg-blue-100 text-blue-600", titleKey: "payrollApprovalNeeded", bodyKey: "monthlyPayrollReadyForReview", timeAgo: "10m ago", actionLabelKey: "review", read: false },
  { id: 10, category: "System", tagKey: "payroll", tagColor: "bg-blue-100 text-blue-600", titleKey: "payrollApprovalNeeded", bodyKey: "monthlyPayrollReadyForReview", timeAgo: "10m ago", actionLabelKey: "review", read: true },
];

const FILTERS: NotifFilter[] = ["All", "Unread", "System", "Urgent", "Staff"];

const COLUMNS: { key: NotifCategory; icon: React.ElementType; labelKey: string; iconColor: string }[] = [
  { key: "Urgent", icon: AlertTriangle, labelKey: "urgentAttention", iconColor: "text-red-500" },
  { key: "Staff", icon: Users, labelKey: "staffRequest", iconColor: "text-blue-600" },
  { key: "System", icon: Grid3x3, labelKey: "system", iconColor: "text-blue-600" },
];

const NotifCard: React.FC<{ n: Notification; onRead: (id: number) => void }> = ({ n, onRead }) => {
  const { t } = useTranslation();

  return (
    <div className={`bg-white rounded-2xl border p-3 sm:p-4 transition-all ${n.read ? "border-slate-100 opacity-60" : "border-slate-200 shadow-sm"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${n.tagColor}`}>{t(n.tagKey)}</span>
        <span className="text-[10px] sm:text-[11px] text-slate-400">{n.timeAgo}</span>
      </div>
      <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">{t(n.titleKey)}</p>
      <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">{t(n.bodyKey)}</p>
      <div className="border-t border-slate-100 mt-3 pt-2">
        <button
          onClick={() => onRead(n.id)}
          className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {t(n.actionLabelKey)}
        </button>
      </div>
    </div>
  );
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL);
  const [filter, setFilter] = useState<NotifFilter>("All");

  const unreadCount = notifs.filter((n) => !n.read).length;
  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifs((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const filtered = notifs.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    return n.category === filter;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <nav className="text-xs text-slate-400 flex items-center gap-1">
        <span className="hover:text-slate-600 cursor-pointer">{t("home")}</span>
        <span>/</span>
        <span className="hover:text-slate-600 cursor-pointer">{t("reports")}</span>
        <span>/</span>
        <span className="text-blue-600 font-medium">{t("notifications")}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t("notifications")}</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {t("stayUpdatedWithUrgentAlertsStaffRequestsAndSystemMessages")}
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <CheckCheck size={14} /> {t("markAllAsRead")}
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
              filter === f ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t(f.toLowerCase())}
            {f === "Unread" && unreadCount > 0 && (
              <span
                className={`text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                  filter === f ? "bg-white text-blue-600" : "bg-red-500 text-white"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
        {COLUMNS.map(({ key, icon: Icon, labelKey, iconColor }) => {
          const col = filtered.filter((n) => n.category === key);
          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon size={16} className={iconColor} />
                <h2 className="font-bold text-slate-800 text-xs sm:text-sm">{t(labelKey)}</h2>
                {col.filter((n) => !n.read).length > 0 && (
                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                    {col.filter((n) => !n.read).length}
                  </span>
                )}
              </div>

              {col.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 bg-white rounded-2xl border border-slate-100">
                  {t("noNotifications")}
                </p>
              ) : (
                col.map((n) => <NotifCard key={n.id} n={n} onRead={markRead} />)
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}