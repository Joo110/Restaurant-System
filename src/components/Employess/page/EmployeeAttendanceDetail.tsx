// src/components/Inventory/page/SupplierManagement.tsx
import React, { useState } from "react";
import AddSupplierModal from "../../Supplier/page/Addsuppliermodal";
import EditSupplierModal from "../../Supplier/page/Editsuppliermodal";

type Supplier = {
  id: number;
  company: string;
  contact: string;
  email: string;
  phone: string;
  categories: string[];
  bank: string;
  status: "Active" | "Inactive";
  itemsSupplied: number;
};

const mockSuppliers: Supplier[] = [
  { id: 1, company: "Dina Flour Egyptian Kitchen", contact: "Ahmed Ali", email: "contact@Dinasupplier.com", phone: "+20 12125626", categories: ["Flour", "Salt", "Ketchup", "Milk"], bank: "Cairo", status: "Active", itemsSupplied: 8 },
  { id: 2, company: "Farmery VegetablesSupplies", contact: "Sara Mahmoud", email: "contact@farmery.com", phone: "+20 10234567", categories: ["Tomatoes", "Onion", "Pepper"], bank: "CIB", status: "Active", itemsSupplied: 5 },
  { id: 3, company: "OceanFresh Supplies", contact: "Karim Hassan", email: "contact@oceanfresh.com", phone: "+20 11345678", categories: ["Chicken", "Beef", "Fish"], bank: "NBE", status: "Active", itemsSupplied: 6 },
  { id: 4, company: "Delta Dairy Group", contact: "Nour Ibrahim", email: "contact@deltadairy.com", phone: "+20 12456789", categories: ["Milk", "Cheese", "Butter", "Yogurt"], bank: "Banque Misr", status: "Inactive", itemsSupplied: 4 },
  { id: 5, company: "Cairo Spice Co.", contact: "Mona Saad", email: "contact@cairospice.com", phone: "+20 10567890", categories: ["Spices", "Herbs", "Seasoning"], bank: "Alex Bank", status: "Active", itemsSupplied: 12 },
  { id: 6, company: "Nile Beverages Ltd.", contact: "Omar Fathi", email: "contact@nilebev.com", phone: "+20 11678901", categories: ["Juices", "Soft Drinks", "Water"], bank: "Cairo", status: "Active", itemsSupplied: 7 },
];

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = suppliers.filter((s) => {
    const matchSearch =
      s.company.toLowerCase().includes(search.toLowerCase()) ||
      s.contact.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === "Active") return matchSearch && s.status === "Active";
    if (activeFilter === "Inactive") return matchSearch && s.status === "Inactive";
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Supplier Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage and track all your supply chain partners</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          + Add Supplier
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Total Suppliers", value: suppliers.length, color: "text-slate-800" },
          { label: "Active", value: suppliers.filter((s) => s.status === "Active").length, color: "text-green-600" },
          { label: "Inactive", value: suppliers.filter((s) => s.status === "Inactive").length, color: "text-red-500" },
          { label: "Total Items Supplied", value: suppliers.reduce((a, s) => a + s.itemsSupplied, 0), color: "text-blue-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 sm:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search supplier or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === f
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table - scrollable on small screens */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr className="text-slate-500 font-semibold text-xs uppercase tracking-wide">
                <th className="py-3 px-4 sm:px-5 text-left">Supplier</th>
                <th className="py-3 px-4 sm:px-5 text-left">Contact</th>
                <th className="py-3 px-4 sm:px-5 text-left">Categories</th>
                <th className="py-3 px-4 sm:px-5 text-left">Bank</th>
                <th className="py-3 px-4 sm:px-5 text-left">Items</th>
                <th className="py-3 px-4 sm:px-5 text-left">Status</th>
                <th className="py-3 px-4 sm:px-5 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 sm:px-5">
                    <p className="font-semibold text-slate-800">{s.company}</p>
                    <p className="text-xs text-slate-400">{s.email}</p>
                  </td>
                  <td className="py-3.5 px-4 sm:px-5">
                    <p className="text-slate-700">{s.contact}</p>
                    <p className="text-xs text-slate-400">{s.phone}</p>
                  </td>
                  <td className="py-3.5 px-4 sm:px-5">
                    <div className="flex flex-wrap gap-1">
                      {s.categories.slice(0, 2).map((c) => (
                        <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                          {c}
                        </span>
                      ))}
                      {s.categories.length > 2 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
                          +{s.categories.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 text-slate-600">{s.bank}</td>
                  <td className="py-3.5 px-4 sm:px-5">
                    <span className="font-semibold text-slate-700">{s.itemsSupplied}</span>
                    <span className="text-xs text-slate-400 ml-1">items</span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditSupplier(s)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => setSuppliers((prev) => prev.filter((x) => x.id !== s.id))}
                        className="px-3 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            No suppliers found
          </div>
        )}
      </div>

      {showAdd && <AddSupplierModal onClose={() => setShowAdd(false)} />}
      {editSupplier && <EditSupplierModal onClose={() => setEditSupplier(null)} />}
    </div>
  );
}