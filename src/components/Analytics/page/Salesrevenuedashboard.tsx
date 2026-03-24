// src/components/Sales/SalesRevenueDashboard.tsx
import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Data ─────────────────────────────────────────────────────────────────────

const revenueData = [
  { month: "Jan", revenue: 120000 }, { month: "Feb", revenue: 98000  },
  { month: "Mar", revenue: 145000 }, { month: "Apr", revenue: 132000 },
  { month: "May", revenue: 160000 }, { month: "Jun", revenue: 155000 },
  { month: "Jul", revenue: 170440 },
];

const revenueByBranch = [
  { branch: "Downtown Branch", value: 92.4  },
  { branch: "Uptown Branch",   value: 84.2  },
  { branch: "Marina Branch",   value: 76.8  },
  { branch: "Airport Branch",  value: 61.4  },
  { branch: "Mall Branch",     value: 54.3  },
];

const topSelling = [
  { name: "Margherita Pizza", orders: 41, revenue: 820,  img: "🍕", up: true  },
  { name: "Beef Tenderloin",  orders: 44, revenue: 1540, img: "🥩", up: true  },
  { name: "Caesar Salad",     orders: 40, revenue: 480,  img: "🥗", up: true  },
  { name: "Pasta Carbonara",  orders: 38, revenue: 760,  img: "🍝", up: true  },
  { name: "Grilled Salmon",   orders: 41, revenue: 1230, img: "🐟", up: true  },
  { name: "Beef Burger",      orders: 38, revenue: 570,  img: "🍔", up: true  },
];

const leastSelling = [
  { name: "Margherita Pizza", orders: 41, revenue: 820,  img: "🍕", up: false },
  { name: "Beef Tenderloin",  orders: 44, revenue: 1540, img: "🥩", up: false },
  { name: "Caesar Salad",     orders: 40, revenue: 480,  img: "🥗", up: false },
  { name: "Pasta Carbonara",  orders: 38, revenue: 760,  img: "🍝", up: false },
  { name: "Grilled Salmon",   orders: 41, revenue: 1230, img: "🐟", up: false },
  { name: "Beef Burger",      orders: 38, revenue: 570,  img: "🍔", up: false },
];

const categoryData = [
  { name: "Burgers", value: 203015, color: "#3b82f6" },
  { name: "Pizza",   value: 87000,  color: "#f59e0b" },
  { name: "Other",   value: 45000,  color: "#10b981" },
];

const reorderItems = [
  { name: "Mozzarella", category: "Dairy", status: "low" },
  { name: "McGridz",    category: "Dairy", status: "ok"  },
  { name: "Mazarelle",  category: "150g",  status: "ok"  },
  { name: "McGridz",    category: "Dairy", status: "low" },
  { name: "Mozzarella", category: "150g",  status: "out" },
];

const ordersByHour = [
  { hour: "9am",  v: 20  }, { hour: "10am", v: 35  }, { hour: "11am", v: 45  },
  { hour: "12pm", v: 80  }, { hour: "1pm",  v: 95  }, { hour: "2pm",  v: 70  },
  { hour: "3pm",  v: 50  }, { hour: "4pm",  v: 40  }, { hour: "5pm",  v: 55  },
  { hour: "6pm",  v: 90  }, { hour: "7pm",  v: 110 }, { hour: "8pm",  v: 85  },
  { hour: "9pm",  v: 60  }, { hour: "10pm", v: 30  },
];

const ordersByBranch = [
  { branch: "Downtown", orders: 455 }, { branch: "Uptown",  orders: 380 },
  { branch: "Marina",   orders: 310 }, { branch: "Airport", orders: 280 },
  { branch: "Mall",     orders: 210 },
];

const supplierData = [
  { cat: "Vegetables", v: 12000 }, { cat: "Dairy",    v: 18000 },
  { cat: "Meat",       v: 28000 }, { cat: "Bakery",   v: 9000  },
  { cat: "Seafood",    v: 22000 },
];

const branchComparison = [
  { name: "Downtown Branch",  revenue: "$92,415", orders: "1,384", foodCost: 34, margin: 210 },
  { name: "Uptown Branch",    revenue: "$84,220", orders: "1,261", foodCost: 35, margin: 225 },
  { name: "Marina Branch",    revenue: "$76,820", orders: "1,108", foodCost: 38, margin: 172 },
  { name: "Downtown Sales",   revenue: "$63,310", orders: "985",   foodCost: 31, margin: 198 },
  { name: "Downtown Branch2", revenue: "$51,190", orders: "876",   foodCost: 40, margin: 115 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, trend, trendUp }: {
  icon: string; label: string; value: string; trend: string; trendUp: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 min-w-0">
      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-2">
        <span>{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight truncate">{value}</p>
      <div className="flex items-center gap-1 mt-1 text-xs">
        <span className={`font-semibold ${trendUp ? "text-emerald-500" : "text-red-400"}`}>
          {trendUp ? "▲" : "▼"} {trend}
        </span>
        <span className="text-slate-400">vs last month</span>
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-slate-700 mb-3">{children}</h2>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    low: "bg-amber-100 text-amber-700",
    ok:  "bg-emerald-100 text-emerald-700",
    out: "bg-red-100 text-red-600",
  };
  const label = status === "low" ? "Low Stock" : status === "out" ? "Out of Stock" : "In Stock";
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${map[status] ?? ""}`}>{label}</span>;
}

const BRANCH_COLORS = ["#3b82f6","#6366f1","#8b5cf6","#ec4899","#f43f5e"];

// ─── Main ─────────────────────────────────────────────────────────────────────

type Period = "Today" | "This Week" | "This Month";

export default function SalesRevenueDashboard() {
  const [period, setPeriod] = useState<Period>("This Month");

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Sales &amp; Revenue</h1>
            <p className="text-xs text-slate-400 mt-0.5">View Business insights for all branches</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {(["Today","This Week","This Month"] as Period[]).map(p => (
                <button
                  key={p} onClick={() => setPeriod(p)}
                  className={`px-2.5 sm:px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    period === p ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >{p}</button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-blue-700 transition">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon="💰" label="Total Revenue"   value="$170,490" trend="+12.5%" trendUp />
          <KpiCard icon="📈" label="Growth"          value="+12.5%"   trend="+2.1%"  trendUp />
          <KpiCard icon="🛒" label="Avg order value" value="$42.50"   trend="-3.2%"  trendUp={false} />
          <KpiCard icon="📋" label="No. per table"   value="$185.00"  trend="-12%"   trendUp={false} />
        </div>

        {/* ── Revenue chart + Revenue by Branch ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <SectionTitle>Revenue</SectionTitle>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <SectionTitle>Revenue by Branch</SectionTitle>
            <div className="space-y-2.5 sm:space-y-3">
              {revenueByBranch.map((b, i) => {
                const pct = Math.round((b.value / revenueByBranch[0].value) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 truncate pr-2">{b.branch}</span>
                      <span className="font-semibold text-slate-700 flex-shrink-0">${b.value}k</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: BRANCH_COLORS[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ── Top + Least Selling ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Top selling dishes",   data: topSelling,   color: "text-emerald-500" },
            { title: "Least selling dishes", data: leastSelling, color: "text-red-400"     },
          ].map(({ title, data, color }) => (
            <Card key={title}>
              <SectionTitle>{title}</SectionTitle>
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[260px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="text-left pb-2 font-medium">Dish Name</th>
                      <th className="text-right pb-2 font-medium">Orders</th>
                      <th className="text-right pb-2 font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0">
                        <td className="py-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base flex-shrink-0">{item.img}</span>
                            <span className="font-medium text-slate-700 truncate">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-2 text-right text-slate-500">{item.orders}</td>
                        <td className={`py-2 text-right font-semibold ${color}`}>${item.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Category + Inventory + Restocked ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Category Pie */}
          <Card>
            <SectionTitle>Sales by Category</SectionTitle>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={48} outerRadius={70} dataKey="value">
                  {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3 mt-1 flex-wrap">
              {categoryData.map(c => (
                <div key={c.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  {c.name}
                </div>
              ))}
            </div>
          </Card>

          {/* Inventory Snapshot */}
          <Card>
            <SectionTitle>Inventory Snapshot</SectionTitle>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
                <div>
                  <p className="text-xs font-bold text-amber-700">Low Stock Alert</p>
                  <p className="text-xs text-amber-600">5 items need restocking</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Critical Items",  value: "12 Items",  color: "text-red-500"   },
                  { label: "Expiring Soon",   value: "45 Units",  color: "text-amber-500" },
                  { label: "Inventory Value", value: "$34,892",   color: "text-blue-600"  },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                    <p className={`text-xs sm:text-sm font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Stock availability rate</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-emerald-500 rounded-full" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600">94.2%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Most Restocked */}
          <Card>
            <SectionTitle>Most Restocked Items</SectionTitle>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="text-left pb-2 font-medium">Name</th>
                  <th className="text-left pb-2 font-medium">Category</th>
                  <th className="text-right pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {reorderItems.map((item, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 font-medium text-slate-700">{item.name}</td>
                    <td className="py-2 text-slate-500">{item.category}</td>
                    <td className="py-2 text-right"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="mt-3 text-xs text-blue-600 font-semibold hover:underline">View all inventory →</button>
          </Card>
        </div>

        {/* ── Order Status + Orders by Hour ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Donut */}
          <Card>
            <SectionTitle>Order Status Breakdown</SectionTitle>
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <div className="relative flex-shrink-0">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completed",   value: 170 },
                        { name: "In Progress", value: 69  },
                        { name: "Cancelled",   value: 0   },
                      ]}
                      cx="50%" cy="50%" innerRadius={44} outerRadius={62}
                      dataKey="value" startAngle={90} endAngle={-270}
                    >
                      <Cell fill="#3b82f6" /><Cell fill="#f59e0b" /><Cell fill="#f43f5e" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">239</span>
                </div>
              </div>
              <div className="space-y-2 min-w-0">
                {[
                  { label: "Completed",   count: 170, color: "#3b82f6" },
                  { label: "In Progress", count: 69,  color: "#f59e0b" },
                  { label: "Cancelled",   count: 0,   color: "#f43f5e" },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-slate-600">{s.label}</span>
                    <span className="text-xs font-bold text-slate-800 ml-auto pl-3">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Hours Bar */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle>Orders by Hour</SectionTitle>
              <span className="text-xs text-blue-600 font-semibold">Peak Zone</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={ordersByHour} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="v" radius={[3, 3, 0, 0]}>
                  {ordersByHour.map((e, i) => <Cell key={i} fill={e.v > 80 ? "#1d4ed8" : "#93c5fd"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Orders by Branch + Supplier ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Orders by Branch */}
          <Card>
            <SectionTitle>Orders by Branch</SectionTitle>
            <div className="space-y-2.5">
              {ordersByBranch.map((b, i) => {
                const pct = Math.round((b.orders / ordersByBranch[0].orders) * 100);
                return (
                  <div key={i} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs text-slate-500 w-16 sm:w-20 flex-shrink-0 truncate">{b.branch}</span>
                    <div className="flex-1 h-3 sm:h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: BRANCH_COLORS[i] }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-8 text-right flex-shrink-0">{b.orders}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Supplier */}
          <Card>
            <SectionTitle>Supplier Spending by Category</SectionTitle>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={supplierData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="cat" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Spend"]} />
                <Bar dataKey="v" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Branch Comparison ── */}
        <Card>
          <SectionTitle>Branch Comparison</SectionTitle>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-xs sm:text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Branch Name","Revenue","Orders","Food Cost","Margin"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 pb-3 pr-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {branchComparison.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-3 font-medium text-slate-700 whitespace-nowrap">{row.name}</td>
                    <td className="py-3 pr-3 text-slate-600 font-semibold whitespace-nowrap">{row.revenue}</td>
                    <td className="py-3 pr-3 text-slate-600">{row.orders}</td>
                    <td className="py-3 pr-3">
                      <span className={`text-xs font-semibold ${row.foodCost > 37 ? "text-red-500" : "text-emerald-600"}`}>
                        {row.foodCost}%
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 sm:w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100,(row.margin/250)*100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 flex-shrink-0">{row.margin}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}