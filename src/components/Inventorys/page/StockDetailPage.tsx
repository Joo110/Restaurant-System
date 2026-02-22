// src/components/Inventory/page/StockDetailPage.tsx
import { useNavigate } from "react-router-dom";

const recentDeliveries = [
  { date: "Oct 24, 2023", invoice: "INV-8922", supplier: "OceanFresh Supplies", qty: "+10.0", status: "Received" },
  { date: "Oct 24, 2023", invoice: "INV-8922", supplier: "OceanFresh Supplies", qty: "+10.0", status: "Received" },
  { date: "Oct 24, 2023", invoice: "INV-8922", supplier: "OceanFresh Supplies", qty: "+10.0", status: "Received" },
];

const usageData = [32, 27, 35, 33, 31, 42, 41];
const days      = ["Sat", "Sun", "Mon", "Wed", "Tue", "Thu", "Fri"];
const maxVal    = Math.max(...usageData);

export default function StockDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="p-4 sm:p-6">

        {/* Breadcrumb */}
        <p className="text-xs text-slate-400 mb-2">
          <span className="cursor-pointer hover:text-blue-500" onClick={() => navigate("/dashboard/inventory")}>
            Inventory
          </span>
          {" / "}
          <span className="text-slate-600">Tomatoes Details</span>
        </p>

        {/* Title row — stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Tomatoes (Egyptian)</h1>
            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
              Low Stock Warning
            </span>
          </div>
          <button className="self-start sm:self-auto px-5 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
            Order Now
          </button>
        </div>

        {/* Main grid — 1 col mobile → 3 col lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

          {/* ── Left col ── */}
          <div className="flex flex-col gap-4 sm:gap-5">

            {/* Current Stock */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500">📦</span>
                <span className="font-semibold text-slate-700 text-sm">Current Stock Level</span>
              </div>

              {/* Donut */}
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32 sm:w-36 sm:h-36">
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
            <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500">🚚</span>
                <span className="font-semibold text-slate-700 text-sm">Primary Supplier</span>
              </div>
              <p className="font-bold text-slate-800 text-sm mb-3">Farmery VegetablesSupplies</p>
              <div className="space-y-2 text-xs">
                {[
                  ["Contact",    "+1 (555) 019-2834"],
                  ["Lead Time",  "2 Days"           ],
                  ["Last Price", "$24.50 / kg"      ],
                  ["Min Order",  "5 kg"             ],
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

          {/* ── Right col (span 2 on lg+) ── */}
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5">

            {/* Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
              <h3 className="font-semibold text-slate-700 text-sm mb-4">7-Day Usage History</h3>
              <div className="flex items-end gap-2 sm:gap-3 h-40 sm:h-44">
                {usageData.map((val, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full flex flex-col justify-end" style={{ height: "160px" }}>
                      <div
                        className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors"
                        style={{ height: `${(val / maxVal) * 160}px` }}
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-400">{days[i]}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-300 mt-1">
                {[0, 10, 20, 30, 40, 50].map((v) => <span key={v}>{v}</span>)}
              </div>
            </div>

            {/* Recent Deliveries — scrollable on mobile */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500">🚚</span>
                <span className="font-semibold text-slate-700 text-sm">Recent Deliveries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[420px]">
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
                        <td className="py-2.5 text-slate-600 whitespace-nowrap">{d.date}</td>
                        <td className="py-2.5 text-slate-600">{d.invoice}</td>
                        <td className="py-2.5 text-slate-600 whitespace-nowrap">{d.supplier}</td>
                        <td className="py-2.5 text-slate-600">{d.qty}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-semibold whitespace-nowrap">
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
    </div>
  );
}