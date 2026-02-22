// src/components/Inventory/page/ConfirmReorderModal.tsx
import { type InventoryItem } from "./InventoryPage";

type Props = {
  item: InventoryItem;
  onClose: () => void;
};

const suppliers = [
  "Dina Flour Egyptian Kitchen",
  "Farmery VegetablesSupplies",
  "OceanFresh Supplies",
];

export default function ConfirmReorderModal({ item, onClose }: Props) {
  const qty       = 15;
  const unitPrice = item.unitPrice;
  const subtotal  = qty * unitPrice;
  const deliveryFee = 15;
  const total     = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 font-sans max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Confirm Reorder</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-5">
          Review and place your order for{" "}
          <span className="text-blue-500 font-semibold">{item.name}</span>
        </p>

        <div className="border-t border-slate-100 pt-5 space-y-4">

          {/* Qty + Delivery — stack on xs, side by side sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Order Quantity</label>
              <div className="relative">
                <input
                  type="number"
                  defaultValue={qty}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{item.unit}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Estimated Delivery</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="dd/mm/yy"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Supplier</label>
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none">
              {suppliers.map((s) => <option key={s}>{s}</option>)}
            </select>
            <p className="text-xs text-slate-400 mt-1">Unit Price: ${unitPrice} / {item.unit}</p>
          </div>

          {/* Dashed divider */}
          <div className="border-t-2 border-dashed border-slate-200 my-1" />

          {/* Cost breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span className="truncate pr-2">Subtotal ( {qty}{item.unit} × ${unitPrice} )</span>
              <span className="text-slate-700 font-medium flex-shrink-0">${subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery Fee</span>
              <span className="text-slate-700 font-medium">${deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Total Cost</span>
              <span className="text-blue-500">${total}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}