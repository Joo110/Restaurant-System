import { useState } from "react";
import { Search, Plus, Edit2, Trash2, X } from "lucide-react";

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  category: "Starters" | "Mains" | "Desserts" | "Drinks";
  available: boolean;
  image?: string;
}

const SAMPLE_ITEMS: MenuItem[] = [
  { id: 1, name: "Caesar Salad", price: 22, description: "Chopped romaine lettuce and garlicky croutons, tossed in a creamy dressing made with eggs,", category: "Mains", available: true },
  { id: 2, name: "Caesar Salad", price: 22, description: "Chopped romaine lettuce and garlicky croutons, tossed in a creamy dressing made with eggs,", category: "Mains", available: true },
  { id: 3, name: "Caesar Salad", price: 22, description: "Chopped romaine lettuce and garlicky croutons, tossed in a creamy dressing made with eggs,", category: "Mains", available: true },
  { id: 4, name: "Caesar Salad", price: 22, description: "Chopped romaine lettuce and garlicky croutons, tossed in a creamy dressing made with eggs,", category: "Mains", available: true },
  { id: 5, name: "Caesar Salad", price: 22, description: "Chopped romaine lettuce and garlicky croutons, tossed in a creamy dressing made with eggs,", category: "Mains", available: true },
  { id: 6, name: "Caesar Salad", price: 22, description: "Chopped romaine lettuce and garlicky croutons, tossed in a creamy dressing made with eggs,", category: "Mains", available: false },
  { id: 7, name: "Caesar Salad", price: 22, description: "Chopped romaine lettuce and garlicky croutons, tossed in a creamy dressing made with eggs,", category: "Mains", available: true },
  { id: 8, name: "Caesar Salad", price: 22, description: "Chopped romaine lettuce and garlicky croutons, tossed in a creamy dressing made with eggs,", category: "Mains", available: true },
];

const UNAVAILABLE_ALERTS = [
  { id: 1, name: "Caesar Salad", missing: "eggs, garlicky croutons" },
  { id: 2, name: "Caesar Salad", missing: "eggs" },
];

const CATEGORIES = ["All Items", "Starters", "Mains", "Desserts", "Drinks"];

interface MenuManagementProps {
  onAddItem: () => void;
  onEditItem: (item: MenuItem) => void;
  items?: MenuItem[];
}

const FoodImage = () => (
  <div className="w-full h-36 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-200 to-yellow-200 flex items-center justify-center text-4xl">
      🥗
    </div>
  </div>
);

export default function MenuManagement({ onAddItem, onEditItem, items = SAMPLE_ITEMS }: MenuManagementProps) {
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const filtered = items.filter((item) => {
    const matchCat = activeCategory === "All Items" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const categoryCounts = {
    Starters: items.filter((i) => i.category === "Starters").length || 12,
    Mains: items.filter((i) => i.category === "Mains").length || 12,
    Desserts: items.filter((i) => i.category === "Desserts").length || 12,
    Drinks: items.filter((i) => i.category === "Drinks").length || 12,
  };

  const handleCardClick = (item: MenuItem) => {
    setSelectedItem((prev) => (prev?.id === item.id ? null : item));
  };

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">

          {/* Items Grid Area */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Search + Filters */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="relative w-56">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                      activeCategory === cat
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={onAddItem}
                className="ml-auto flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Add New Item
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className={`bg-white rounded-xl border p-3 cursor-pointer transition-all ${
                    selectedItem?.id === item.id
                      ? "border-blue-400 ring-2 ring-blue-100"
                      : item.available
                      ? "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                      : "border-gray-200 opacity-70"
                  }`}
                >
                  <FoodImage />
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                      <span className="text-blue-600 font-bold text-sm">${item.price}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-semibold ${item.available ? "text-green-500" : "text-red-500"}`}>
                        {item.available ? "Available" : "Unavailable"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditItem(item); }}
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Panel — يظهر فقط عند الضغط على كارت */}
          {selectedItem && (
            <aside className="w-64 bg-gray-900 text-white p-5 shrink-0 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold">Quick Stats</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white rounded-md transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-4">Most Profitable</p>

              {/* Selected Item Card */}
              <div className="bg-gray-800 rounded-xl p-3 mb-5 flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center text-lg shrink-0">
                  🥗
                </div>
                <div>
                  <div className="text-sm font-semibold">{selectedItem.name}</div>
                  <div className={`text-[10px] mt-0.5 font-medium ${selectedItem.available ? "text-green-400" : "text-red-400"}`}>
                    {selectedItem.available ? "Available" : "Unavailable"} · ${selectedItem.price}
                  </div>
                </div>
              </div>

              {/* Most Profitable */}
              <div className="mb-5">
                <div className="text-xl font-bold mb-1">Mains</div>
                <div className="text-blue-400 font-semibold text-sm mb-2">45% of total revenue</div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full w-[45%] bg-blue-500 rounded-full" />
                </div>
              </div>

              {/* Item Count By Category */}
              <div className="mb-6">
                <p className="text-xs text-gray-400 mb-3">Item Count By Category</p>
                <div className="flex flex-col gap-2">
                  {Object.entries(categoryCounts).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{cat}</span>
                      <span className="font-bold text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Currently Unavailable */}
              <div>
                <p className="text-xs text-gray-400 mb-3">Currently Unavailable</p>
                <div className="flex flex-col gap-2">
                  {UNAVAILABLE_ALERTS.map((alert) => (
                    <div key={alert.id} className="bg-gray-800 rounded-xl p-3 flex items-start gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-sm shrink-0">
                        🥗
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{alert.name}</div>
                        <div className="text-[10px] text-red-400 mt-0.5">Missing: {alert.missing}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  );
}