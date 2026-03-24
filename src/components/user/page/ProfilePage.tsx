// src/components/profile/ProfilePage.tsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, Clock, Mail, Phone, Save,
  Monitor, Smartphone, LogOut, Shield,
} from "lucide-react";
import UpdatePasswordModal from "./Updatepasswordmodal";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  firstName: string; lastName: string; email: string;
  lastName2: string; role: string; branchName: string;
  tenure: string; workEmail: string; directLine: string;
}

interface NotifPref { key: string; label: string; description: string; enabled: boolean }
interface Device    { id: string; name: string; type: "desktop"|"mobile"; location: string; lastActive: string; isActive: boolean }

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PROFILE: UserProfile = {
  firstName: "Mohamed", lastName: "Morsy", email: "morsy44@dgrest.com",
  lastName2: "Johnson",  role: "Branch Manager", branchName: "Nasr City",
  tenure: "2.5 Years",   workEmail: "ahmed.ali@rest.com", directLine: "+(20) 255214555",
};

const MOCK_NOTIFS: NotifPref[] = [
  { key: "low",    label: "Low Inventory Alerts", description: "Critical updates when stock levels fall below threshold.", enabled: true  },
  { key: "staff",  label: "Staff Alerts",         description: "Notify when staff checks in.",                             enabled: true  },
  { key: "system", label: "System Alerts",        description: "Critical updates about inventory levels and staff.",       enabled: false },
];

const MOCK_ACTIVITY = [
  { icon: "📊", color: "bg-purple-100", title: "Updated menu pricing",         description: "Increased prices for breakfast items by 5% to adjust for inflation.",                      time: "Today, 10:42 AM"    },
  { icon: "📦", color: "bg-blue-100",   title: "Approved inventory restock",   description: "Order #8821 approved for monthly dairy and vegetable supply.",                            time: "Yesterday, 4:19 PM" },
  { icon: "👥", color: "bg-orange-100", title: "Kitchen Team Shift Update",    description: "Reassigned 2 chefs to the evening shift for the upcoming holiday rush.",                  time: "Nov 12, 2:30 PM"    },
  { icon: "🔐", color: "bg-green-100",  title: "Logged in from a new device",  description: "Successful login detected from MacBook Pro | San Francisco, CA | IP: 192.168.1.45",      time: "Nov 10, 09:15 AM"   },
];

const MOCK_DEVICES: Device[] = [
  { id: "1", name: 'MacBook Pro 16"', type: "desktop", location: "Mansoura, EG",  lastActive: "Just now", isActive: true  },
  { id: "2", name: "iPhone 14 Pro",   type: "mobile",  location: "Cairo, EG",     lastActive: "Just now", isActive: false },
  { id: "3", name: 'MacBook Pro 16"', type: "desktop", location: "Mit Ghamr, EG", lastActive: "Just now", isActive: true  },
];

// ─── Small reusable components ────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-blue-600" : "bg-gray-200"}`}>
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-5" : ""}`} />
    </button>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-1">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [profile,       setProfile]       = useState<UserProfile>(MOCK_PROFILE);
  const [notifs,        setNotifs]        = useState<NotifPref[]>(MOCK_NOTIFS);
  const [devices,       setDevices]       = useState<Device[]>(MOCK_DEVICES);
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [avatarUrl,     setAvatarUrl]     = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleNotif   = (key: string) => setNotifs(p => p.map(n => n.key === key ? { ...n, enabled: !n.enabled } : n));
  const logoutDevice  = (id: string)  => setDevices(p => p.filter(d => d.id !== id));

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {showPassModal && (
        <UpdatePasswordModal
          onClose={() => setShowPassModal(false)}
          onSubmit={async (cur, np) => { await new Promise(r => setTimeout(r, 800)); console.log("pwd updated", { cur, np }); }}
        />
      )}

      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-2">
        <nav className="text-xs text-gray-400 flex items-center gap-1 flex-wrap">
          <button onClick={() => navigate("/")} className="hover:text-blue-600 transition">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/staff")} className="hover:text-blue-600 transition">Staff</button>
          <span>/</span>
          <span className="text-blue-600 font-medium">Profile</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex flex-col lg:flex-row gap-5">

        {/* ══ LEFT SIDEBAR ══ */}
        <div className="w-full lg:w-60 xl:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Cover banner */}
            <div className="h-20 sm:h-24 bg-gradient-to-br from-slate-800 to-slate-600 relative">
              <div
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-9 sm:-bottom-10 left-1/2 -translate-x-1/2 w-18 h-18 sm:w-20 sm:h-20"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border-4 border-white shadow-md overflow-hidden cursor-pointer group">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-slate-200 flex items-center justify-center text-2xl sm:text-3xl text-slate-500">👤</div>
                  }
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-semibold">Change</span>
                  </div>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Profile info */}
            <div className="pt-10 sm:pt-12 pb-5 px-4 sm:px-5 text-center">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Ahmed Ali</h3>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {profile.role}
              </span>

              <div className="mt-4 space-y-3 text-left">
                {[
                  { icon: <Building2 size={13} />, label: "Branch Name",   value: profile.branchName },
                  { icon: <Clock      size={13} />, label: "Branch Tenure", value: profile.tenure     },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-2">
                    <span className="text-gray-400 flex-shrink-0">{row.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase font-medium">{row.label}</p>
                      <p className="text-xs font-semibold text-gray-700 truncate">{row.value}</p>
                    </div>
                  </div>
                ))}

                <div className="border-t border-gray-100 pt-3 space-y-3">
                  {[
                    { icon: <Mail  size={13} />, label: "Work Email",  value: profile.workEmail  },
                    { icon: <Phone size={13} />, label: "Direct Line", value: profile.directLine },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-2">
                      <span className="text-gray-400 flex-shrink-0">{row.icon}</span>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase font-medium">{row.label}</p>
                        <p className="text-xs font-semibold text-gray-700 truncate">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT CONTENT ══ */}
        <div className="flex-1 min-w-0 space-y-4 sm:space-y-5">

          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <SectionHeader title="Personal Information" sub="Update your personal details and contact information." />
              <button
                onClick={handleSave} disabled={saving}
                className="self-start flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-60 whitespace-nowrap"
              >
                {saving
                  ? <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  : saved ? <span>✓</span> : <Save size={13} />
                }
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
            <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { k: "firstName" as const, label: "First Name",    ro: false },
                { k: "lastName"  as const, label: "Last Name",     ro: false },
                { k: "email"     as const, label: "Email Address", ro: true, badge: "Read Only" },
                { k: "lastName2" as const, label: "Last Name",     ro: false },
              ].map(({ k, label, ro, badge }) => (
                <div key={k}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {label}
                    {badge && <span className="ml-1.5 text-gray-400 font-normal">{badge}</span>}
                  </label>
                  <input
                    type={k === "email" ? "email" : "text"}
                    value={profile[k]}
                    readOnly={ro}
                    onChange={ro ? undefined : e => setProfile(p => ({ ...p, [k]: e.target.value }))}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none transition ${
                      ro
                        ? "border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed"
                        : "border-gray-200 text-gray-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
            <SectionHeader title="Notifications" />
            <div className="mt-2 divide-y divide-gray-100">
              {notifs.map(n => (
                <div key={n.key} className="flex items-center justify-between py-3 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{n.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.description}</p>
                  </div>
                  <Toggle enabled={n.enabled} onChange={() => toggleNotif(n.key)} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
            <SectionHeader title="Recent Activity" sub="Track your branch-specific actions and system changes." />
            <div className="mt-3 space-y-3 sm:space-y-4">
              {MOCK_ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${item.color} flex items-center justify-center text-base sm:text-lg flex-shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-2">
                      <p className="text-sm font-semibold text-gray-800 leading-tight">{item.title}</p>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{item.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={15} className="text-gray-600 flex-shrink-0" />
              <h2 className="text-base font-bold text-gray-900">Security</h2>
            </div>

            {/* Change Password */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">Change Password</p>
                <p className="text-xs text-gray-400 mt-0.5">Last changed 3 months ago</p>
              </div>
              <button
                onClick={() => setShowPassModal(true)}
                className="self-start sm:self-auto px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
              >
                Update
              </button>
            </div>

            {/* Logged-in Devices */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3">Logged-in Devices</h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full text-xs min-w-[400px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["DEVICE", "LOCATION", "LAST ACTIVE", "ACTION"].map(h => (
                        <th key={h} className="text-left text-gray-400 font-semibold pb-2.5 pr-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map(device => (
                      <tr key={device.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              {device.type === "desktop"
                                ? <Monitor size={13} className="text-blue-600" />
                                : <Smartphone size={13} className="text-blue-600" />
                              }
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 whitespace-nowrap">{device.name}</p>
                              {device.type === "mobile" && <p className="text-gray-400 text-[10px]">Mobile App</p>}
                              {device.isActive && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                  Active now
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-gray-600 whitespace-nowrap">{device.location}</td>
                        <td className="py-3 pr-3 text-gray-600 whitespace-nowrap">{device.lastActive}</td>
                        <td className="py-3">
                          <button
                            onClick={() => logoutDevice(device.id)}
                            className="flex items-center gap-1 text-red-400 hover:text-red-600 font-semibold transition whitespace-nowrap"
                          >
                            <LogOut size={11} />
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
    </div>
  );
}