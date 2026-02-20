// src/components/Inventory/page/StockDetailPage.tsx
import { useNavigate } from "react-router-dom";

const recentDeliveries = [
  { date: "Oct 24, 2023", invoice: "INV-8922", supplier: "OceanFresh Supplies", qty: "+10.0", status: "Received" },
  { date: "Oct 24, 2023", invoice: "INV-8922", supplier: "OceanFresh Supplies", qty: "+10.0", status: "Received" },
  { date: "Oct 24, 2023", invoice: "INV-8922", supplier: "OceanFresh Supplies", qty: "+10.0", status: "Received" },
];

const usageData = [32, 27, 35, 33, 31, 42, 41];
const days = ["Sat", "Sun", "Mon", "Wed", "Tue", "Thu", "Friday"];
const maxVal = Math.max(...usageData);

export default function StockDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-blue-600 font-bold text-base">Stock Overview</span>
          <div className="flex items-center gap-1 text-sm text-slate-500 bg-slate-100 rounded-lg px-3 py-1">
            🏪 Mansoura Branch <span className="ml-1">▾</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-blue-500 text-white rounded-lg px-3 py-1.5 text-sm font-medium">
            📅 Feb 15, 2026
          </div>
          <button className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 text-sm hover:bg-slate-50">G</button>
          <button className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Breadcrumb */}
        <p className="text-xs text-slate-400 mb-2">
          <span className="cursor-pointer hover:text-blue-500" onClick={() => navigate("/dashboard/inventory")}>Inventory</span>
          {" / "}
          <span className="text-slate-600">Tomatoes Details</span>
        </p>

        {/* Title row */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tomatoes (Egyptian)</h1>
            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
              Low Stock Warning
            </span>
          </div>
          <button className="px-5 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
            Order Now
          </button>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Left col */}
          <div className="flex flex-col gap-5">
            {/* Current Stock */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500">📦</span>
                <span className="font-semibold text-slate-700 text-sm">Current Stock Level</span>
              </div>

              {/* Donut */}
              <div className="flex justify-center mb-4">
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="48" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                    <circle
                      cx="60" cy="60" r="48" fill="none"
                      stroke="#f97316" strokeWidth="12"
                      strokeDasharray={`${(4.2 / 10) * 301} 301`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800">4.2</span>
                    <span className="text-xs text-slate-400">kg / 10kg</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-xs text-slate-500">
                <div>
                  <p className="text-slate-400 uppercase tracking-wide mb-0.5">Unit Type</p>
                  <p className="font-semibold text-slate-700">Kilograms (kg)</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 uppercase tracking-wide mb-0.5">Reorder Point</p>
                  <p className="font-semibold text-yellow-500">5.0 kg ⚠</p>
                </div>
              </div>
            </div>

            {/* Primary Supplier */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500">🚚</span>
                <span className="font-semibold text-slate-700 text-sm">Primary Supplier</span>
              </div>
              <p className="font-bold text-slate-800 text-sm mb-3">Farmery VegetablesSupplies</p>
              <div className="space-y-2 text-xs">
                {[
                  ["Contact", "+1 (555) 019-2834"],
                  ["Lead Time", "2 Days"],
                  ["Last Price", "$24.50 / kg"],
                  ["Min Order", "5 kg"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-slate-700 font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5">
                ✉ Contact Supplier
              </button>
            </div>
          </div>

          {/* Right col (span 2) */}
          <div className="col-span-2 flex flex-col gap-5">
            {/* Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-semibold text-slate-700 text-sm mb-4">7 - Day Usage History</h3>
              <div className="flex items-end gap-3 h-44">
                {usageData.map((val, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full flex flex-col justify-end" style={{ height: "160px" }}>
                      <div
                        className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors"
                        style={{ height: `${(val / maxVal) * 160}px` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{days[i]}</span>
                  </div>
                ))}
              </div>
              {/* Y axis labels */}
              <div className="flex justify-between text-xs text-slate-300 mt-1">
                {[0, 10, 20, 30, 40, 50].map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </div>
            </div>

            {/* Recent Deliveries */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500">🚚</span>
                <span className="font-semibold text-slate-700 text-sm">Recent Deliveries</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 uppercase tracking-wide border-b border-slate-100">
                    <th className="pb-2 text-left font-medium">Date Received</th>
                    <th className="pb-2 text-left font-medium">Invoice #</th>
                    <th className="pb-2 text-left font-medium">Supplier</th>
                    <th className="pb-2 text-left font-medium">QTY (KG)</th>
                    <th className="pb-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeliveries.map((d, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="py-2.5 text-slate-600">{d.date}</td>
                      <td className="py-2.5 text-slate-600">{d.invoice}</td>
                      <td className="py-2.5 text-slate-600">{d.supplier}</td>
                      <td className="py-2.5 text-slate-600">{d.qty}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-semibold">
                          {d.status}
                        </span>
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