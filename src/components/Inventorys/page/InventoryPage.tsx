// src/components/Inventory/page/InventoryPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RestockModal from "./RestockModal";
import ConfirmReorderModal from "./ConfirmReorderModal";

export type InventoryItem = {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  targetStock: number;
  unit: string;
  status: "critical" | "reorder" | "ok";
  supplier: string;
  unitPrice: number;
};

const mockItems: InventoryItem[] = [
  { id: 1,  name: "White Flour",    category: "Dry Goods",     currentStock: 3.2, targetStock: 20, unit: "Kg", status: "critical", supplier: "Dina Flour Egyptian Kitchen",  unitPrice: 7  },
  { id: 2,  name: "Tomatoes",       category: "Fresh Produce", currentStock: 17,  targetStock: 20, unit: "Kg", status: "reorder",  supplier: "Farmery VegetablesSupplies",  unitPrice: 5  },
  { id: 3,  name: "White Flour",    category: "Dry Goods",     currentStock: 3.2, targetStock: 20, unit: "Kg", status: "critical", supplier: "Dina Flour Egyptian Kitchen",  unitPrice: 7  },
  { id: 4,  name: "White Flour",    category: "Dry Goods",     currentStock: 3.2, targetStock: 20, unit: "Kg", status: "critical", supplier: "Dina Flour Egyptian Kitchen",  unitPrice: 7  },
  { id: 5,  name: "White Flour",    category: "Dry Goods",     currentStock: 3.2, targetStock: 20, unit: "Kg", status: "critical", supplier: "Dina Flour Egyptian Kitchen",  unitPrice: 7  },
  { id: 6,  name: "Tomatoes",       category: "Fresh Produce", currentStock: 17,  targetStock: 20, unit: "Kg", status: "reorder",  supplier: "Farmery VegetablesSupplies",  unitPrice: 5  },
  { id: 7,  name: "Chicken Breast", category: "Butchery",      currentStock: 20,  targetStock: 40, unit: "Kg", status: "ok",       supplier: "OceanFresh Supplies",         unitPrice: 12 },
  { id: 8,  name: "White Flour",    category: "Dry Goods",     currentStock: 3.2, targetStock: 20, unit: "Kg", status: "critical", supplier: "Dina Flour Egyptian Kitchen",  unitPrice: 7  },
  { id: 9,  name: "White Flour",    category: "Dry Goods",     currentStock: 3.2, targetStock: 20, unit: "Kg", status: "critical", supplier: "Dina Flour Egyptian Kitchen",  unitPrice: 7  },
  { id: 10, name: "Tomatoes",       category: "Fresh Produce", currentStock: 17,  targetStock: 20, unit: "Kg", status: "reorder",  supplier: "Farmery VegetablesSupplies",  unitPrice: 5  },
  { id: 11, name: "White Flour",    category: "Dry Goods",     currentStock: 3.2, targetStock: 20, unit: "Kg", status: "critical", supplier: "Dina Flour Egyptian Kitchen",  unitPrice: 7  },
  { id: 12, name: "White Flour",    category: "Dry Goods",     currentStock: 3.2, targetStock: 20, unit: "Kg", status: "critical", supplier: "Dina Flour Egyptian Kitchen",  unitPrice: 7  },
  { id: 13, name: "White Flour",    category: "Dry Goods",     currentStock: 3.2, targetStock: 20, unit: "Kg", status: "critical", supplier: "Dina Flour Egyptian Kitchen",  unitPrice: 7  },
  { id: 14, name: "Tomatoes",       category: "Fresh Produce", currentStock: 17,  targetStock: 20, unit: "Kg", status: "reorder",  supplier: "Farmery VegetablesSupplies",  unitPrice: 5  },
  { id: 15, name: "Chicken Breast", category: "Butchery",      currentStock: 20,  targetStock: 40, unit: "Kg", status: "ok",       supplier: "OceanFresh Supplies",         unitPrice: 12 },
  { id: 16, name: "White Flour",    category: "Dry Goods",     currentStock: 3.2, targetStock: 20, unit: "Kg", status: "critical", supplier: "Dina Flour Egyptian Kitchen",  unitPrice: 7  },
];

const filters = ["Total Items", "Critical Low", "Reorder soon"];

export default function InventoryPage() {
  const navigate      = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Total Items");
  const [search,       setSearch]       = useState("");
  const [showRestock,  setShowRestock]  = useState(false);
  const [reorderItem,  setReorderItem]  = useState<InventoryItem | null>(null);

  const filtered = mockItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === "Critical Low")  return matchSearch && item.status === "critical";
    if (activeFilter === "Reorder soon") return matchSearch && item.status === "reorder";
    return matchSearch;
  });

  const getStockPercent = (current: number, target: number) =>
    Math.min((current / target) * 100, 100);

  const getBarColor = (status: string) => {
    if (status === "critical") return "bg-red-500";
    if (status === "reorder")  return "bg-yellow-400";
    return "bg-green-500";
  };

  const getEmoji = (name: string) => {
    if (name === "Tomatoes")       return "🍅";
    if (name === "Chicken Breast") return "🍗";
    return "🌾";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 font-sans">

      {/* Top Bar — stacks nicely on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Filters — scrollable on xs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 flex-shrink-0">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                activeFilter === f
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 sm:ml-auto">
          <button className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 font-medium whitespace-nowrap">
            + Add Supplier
          </button>
          <button
            onClick={() => setShowRestock(true)}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap"
          >
            + Add Stock
          </button>
        </div>
      </div>

      {/* Grid — 2 col mobile → 3 col md → 4 col xl */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate(`/dashboard/inventory/${item.id}`)}
          >
            {/* Image placeholder */}
            <div className="w-full h-20 sm:h-24 bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-3xl">
              {getEmoji(item.name)}
            </div>

            <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
            <p className="text-xs text-slate-400 mb-2 truncate">{item.category}</p>

            <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
              <span className={`text-base sm:text-lg font-bold ${
                item.status === "critical" ? "text-red-500" :
                item.status === "reorder"  ? "text-yellow-500" : "text-slate-800"
              }`}>
                {item.currentStock}
                <span className="text-xs font-normal text-slate-400 ml-0.5">{item.unit}</span>
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400">Target: {item.targetStock}{item.unit}</span>
            </div>

            {/* Stock bar */}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full ${getBarColor(item.status)}`}
                style={{ width: `${getStockPercent(item.currentStock, item.targetStock)}%` }}
              />
            </div>

            {item.status === "reorder" ? (
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-full py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
              >
                Details
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setReorderItem(item); }}
                className="w-full py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
              >
                Reorder Now
              </button>
            )}
          </div>
        ))}
      </div>

      {showRestock && <RestockModal onClose={() => setShowRestock(false)} />}
      {reorderItem && <ConfirmReorderModal item={reorderItem} onClose={() => setReorderItem(null)} />}
    </div>
  );
}