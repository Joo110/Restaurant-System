import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ActivityItem {
  icon: string;
  color: string;
  title: string;
  description: string;
  time: string;
}

interface DeviceItem {
  icon: string;
  name: string;
  type: string;
  location: string;
  lastActive: string;
  isActive?: boolean;
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-blue-600" : "bg-gray-200"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

export default function StaffProfile() {
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState("Mohamed");
  const [lastName, setLastName] = useState("Morsy");
  const [lastNameExtra, setLastNameExtra] = useState("Johnson");
  const [lowInventory, setLowInventory] = useState(true);
  const [staffAlerts, setStaffAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  const activities: ActivityItem[] = [
    {
      icon: "📋",
      color: "bg-purple-100",
      title: t("updatedMenuPricing"),
      description: t("increasedBreakfastPricesBy5Percent"),
      time: t("todayAt1042AM"),
    },
    {
      icon: "📦",
      color: "bg-blue-100",
      title: t("approvedInventoryRestock"),
      description: t("order8821ApprovedForMonthlyDairyAndVegetableSupply"),
      time: t("yesterdayAt415PM"),
    },
    {
      icon: "⚠️",
      color: "bg-yellow-100",
      title: t("kitchenTeamShiftUpdate"),
      description: t("reassigned2ChefsToEveningShift"),
      time: t("nov12At230PM"),
    },
    {
      icon: "🔐",
      color: "bg-green-100",
      title: t("loggedInFromNewDevice"),
      description: t("successfulLoginDetectedFromMacBookPro"),
      time: t("nov10At1015AM"),
    },
  ];

  const devices: DeviceItem[] = [
    { icon: "💻", name: "MacBook Pro 16\"", type: t("activeNow"), location: t("mansouraEg"), lastActive: t("justNow"), isActive: true },
    { icon: "📱", name: "iPhone 14 Pro", type: t("mobileApp"), location: t("cairoEg"), lastActive: t("justNow") },
    { icon: "💻", name: "MacBook Pro 16\"", type: t("activeNow"), location: t("mitGhamrEg"), lastActive: t("justNow"), isActive: true },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Breadcrumb */}
      <div className="px-8 pt-4 text-xs text-gray-400">
        <span>{t("home")}</span> / <span>{t("staff")}</span> / <span className="text-gray-700 font-medium">{t("profile")}</span>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-6 flex gap-6">
        {/* Left Sidebar */}
        <div className="w-44 flex-shrink-0">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="h-20 bg-gradient-to-br from-gray-700 to-gray-900" />
            <div className="flex flex-col items-center pb-5 px-4 -mt-8">
              <div className="w-16 h-16 rounded-full bg-gray-300 border-4 border-white shadow-md flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <p className="font-bold text-gray-900 text-sm mt-2 text-center">Ahmed Ali</p>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1">{t("branchManager")}</span>

              <div className="mt-4 space-y-2 w-full text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <span>🏢</span>
                  <div>
                    <p className="text-gray-400 text-[10px]">{t("branchName")}</p>
                    <p className="font-medium text-gray-700">{t("nasrCity")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <span>📅</span>
                  <div>
                    <p className="text-gray-400 text-[10px]">{t("branchTenure")}</p>
                    <p className="font-medium text-gray-700">{t("twoAndHalfYears")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <span>✉️</span>
                  <div>
                    <p className="text-gray-400 text-[10px]">{t("workEmail")}</p>
                    <p className="font-medium text-gray-700 text-[10px]">ahmed.ali@rest.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <span>📞</span>
                  <div>
                    <p className="text-gray-400 text-[10px]">{t("directLine")}</p>
                    <p className="font-medium text-gray-700">+(20) 255214555</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-5">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="font-bold text-gray-900">{t("personalInformation")}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{t("updatesPersonalDetailsAndContactInformation")}</p>
              </div>
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl transition-all ${saved ? "bg-green-500" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                <span>{saved ? "✓" : "💾"}</span>
                {saved ? t("saved") : t("saveChanges")}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("firstName")}</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("lastName")}</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  {t("emailAddress")} <span className="text-gray-300">{t("readOnly")}</span>
                </label>
                <input
                  value="morsy44@dgrest.com"
                  readOnly
                  className="w-full border border-gray-100 rounded-xl px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("lastName")}</label>
                <input
                  value={lastNameExtra}
                  onChange={(e) => setLastNameExtra(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">{t("notifications")}</h2>
            <div className="space-y-3">
              {[
                { label: t("lowInventoryAlerts"), desc: t("criticalUpdatesWhenStockLevelsFallBelowThreshold"), state: lowInventory, toggle: () => setLowInventory(!lowInventory) },
                { label: t("staffAlerts"), desc: t("notifyWhenStaffCheckIn"), state: staffAlerts, toggle: () => setStaffAlerts(!staffAlerts) },
                { label: t("systemAlerts"), desc: t("criticalAboutInventoryLevelsAndStaff"), state: systemAlerts, toggle: () => setSystemAlerts(!systemAlerts) },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle enabled={item.state} onChange={item.toggle} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-1">{t("recentActivity")}</h2>
            <p className="text-xs text-gray-400 mb-4">{t("trackBranchSpecificActionsAndSystemChanges")}</p>
            <div className="space-y-3">
              {activities.map((act, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`w-8 h-8 rounded-lg ${act.color} flex items-center justify-center flex-shrink-0 text-sm`}>
                    {act.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-medium text-gray-800">{act.title}</p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{act.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4">{t("security")}</h2>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 mb-5">
              <div>
                <p className="text-sm font-medium text-gray-800">{t("changePassword")}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t("lastChanged3MonthsAgo")}</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                {t("update")}
              </button>
            </div>

            {/* Logged-in Devices */}
            <h3 className="font-semibold text-gray-800 text-sm mb-3">{t("loggedInDevices")}</h3>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr className="text-gray-400 uppercase tracking-wide text-[10px]">
                    <th className="text-left px-4 py-2.5 font-semibold">{t("device")}</th>
                    <th className="text-left px-4 py-2.5 font-semibold">{t("location")}</th>
                    <th className="text-left px-4 py-2.5 font-semibold">{t("lastActive")}</th>
                    <th className="text-left px-4 py-2.5 font-semibold">{t("action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {devices.map((device, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{device.icon}</span>
                          <div>
                            <p className="font-medium text-gray-800">{device.name}</p>
                            <div className="flex items-center gap-1">
                              {device.isActive && <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                              <span className="text-gray-400 text-[10px]">{device.type}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{device.location}</td>
                      <td className="px-4 py-3 text-gray-500">{device.lastActive}</td>
                      <td className="px-4 py-3">
                        <button className="text-red-500 font-medium hover:text-red-600 transition-colors">
                          {t("logout")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}