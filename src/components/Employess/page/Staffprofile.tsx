import { useState } from "react";

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
      title: "Updated menu pricing",
      description: "Increased prices for breakfast items by 5% to adjust for inflation.",
      time: "Today, 10:42 AM",
    },
    {
      icon: "📦",
      color: "bg-blue-100",
      title: "Approved inventory restock",
      description: "Order #8821 approved for monthly dairy and vegetable supply.",
      time: "Yesterday, 4:15 PM",
    },
    {
      icon: "⚠️",
      color: "bg-yellow-100",
      title: "Kitchen Team Shift Update",
      description: "Reassigned 2 chefs to the evening shift for the upcoming holiday rush.",
      time: "Nov 12, 2:30 PM",
    },
    {
      icon: "🔐",
      color: "bg-green-100",
      title: "Logged in from a new device",
      description: "Successful login detected from MacBook Pro (San Francisco, CA). IP: 192.168.1.45",
      time: "Nov 10, 10:15 AM",
    },
  ];

  const devices: DeviceItem[] = [
    { icon: "💻", name: "MacBook Pro 16\"", type: "Active now", location: "Mansoura, EG", lastActive: "Just now", isActive: true },
    { icon: "📱", name: "iPhone 14 Pro", type: "Mobile App", location: "Cairo, EG", lastActive: "Just now" },
    { icon: "💻", name: "MacBook Pro 16\"", type: "Active now", location: "Mit Ghamr, EG", lastActive: "Just now", isActive: true },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Breadcrumb */}
      <div className="px-8 pt-4 text-xs text-gray-400">
        <span>Home</span> / <span>Staff</span> / <span className="text-gray-700 font-medium">Profile</span>
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
              <span className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1">Branch Manager</span>

              <div className="mt-4 space-y-2 w-full text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <span>🏢</span>
                  <div>
                    <p className="text-gray-400 text-[10px]">Branch Name</p>
                    <p className="font-medium text-gray-700">Nasr City</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <span>📅</span>
                  <div>
                    <p className="text-gray-400 text-[10px]">Branch Tenure</p>
                    <p className="font-medium text-gray-700">2.5 Years</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <span>✉️</span>
                  <div>
                    <p className="text-gray-400 text-[10px]">Work Email</p>
                    <p className="font-medium text-gray-700 text-[10px]">ahmed.ali@rest.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <span>📞</span>
                  <div>
                    <p className="text-gray-400 text-[10px]">Direct Line</p>
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
                <h2 className="font-bold text-gray-900">Personal Information</h2>
                <p className="text-xs text-gray-400 mt-0.5">Updates your personal details and contact information.</p>
              </div>
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl transition-all ${saved ? "bg-green-500" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                <span>{saved ? "✓" : "💾"}</span>
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Email Address <span className="text-gray-300">Read Only</span>
                </label>
                <input
                  value="morsy44@dgrest.com"
                  readOnly
                  className="w-full border border-gray-100 rounded-xl px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name</label>
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
            <h2 className="font-bold text-gray-900 mb-4">Notifications</h2>
            <div className="space-y-3">
              {[
                { label: "Low Inventory Alerts", desc: "Critical updates when stock levels fall below threshold", state: lowInventory, toggle: () => setLowInventory(!lowInventory) },
                { label: "Staff Alerts", desc: "Notify when staff check-in", state: staffAlerts, toggle: () => setStaffAlerts(!staffAlerts) },
                { label: "System Alerts", desc: "Critical about inventory levels and staff", state: systemAlerts, toggle: () => setSystemAlerts(!systemAlerts) },
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
            <h2 className="font-bold text-gray-900 mb-1">Recent Activity</h2>
            <p className="text-xs text-gray-400 mb-4">Track your branch - specific actions and system changes.</p>
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
            <h2 className="font-bold text-gray-900 mb-4">Security</h2>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 mb-5">
              <div>
                <p className="text-sm font-medium text-gray-800">Change Password</p>
                <p className="text-xs text-gray-400 mt-0.5">Last changed 3 months ago</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Update
              </button>
            </div>

            {/* Logged-in Devices */}
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Logged-In Devices</h3>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr className="text-gray-400 uppercase tracking-wide text-[10px]">
                    <th className="text-left px-4 py-2.5 font-semibold">Device</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Location</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Last Active</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Action</th>
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
                          Logout
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