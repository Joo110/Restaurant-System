// src/components/Inventory/page/RestockModal.tsx

type Props = {
  onClose: () => void;
};

const ingredients = [
  "White Flour",
  "Tomatoes",
  "Chicken Breast",
  "Coke Zero",
  "Pepperoni",
  "Mozzarella",
];

const suppliers = [
  "Dina Flour Egyptian Kitchen",
  "Farmery VegetablesSupplies",
  "OceanFresh Supplies",
];

export default function RestockModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 font-sans">
        <h2 className="text-xl font-bold text-slate-900">Restock Ingredient</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-5">Add new inventory to your stock level</p>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          {/* Select Ingredient */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Ingredient</label>
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none">
              <option value="">Choose an item....</option>
              {ingredients.map((ing) => (
                <option key={ing} value={ing}>{ing}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Unit Price: $7 / Kg</p>
          </div>

          {/* Quantity + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Quantity to Add</label>
              <input
                type="number"
                defaultValue="0.00"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
              <input
                type="text"
                defaultValue="Kg"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Supplier</label>
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none">
              {suppliers.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Expiry Date</label>
            <div className="relative">
              <input
                type="text"
                placeholder="dd/mm/yy"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
            Add To Inventory
          </button>
        </div>
      </div>
    </div>
  );
}