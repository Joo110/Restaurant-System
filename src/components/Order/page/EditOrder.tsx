import { useState } from "react";

type OrderItem = {
  id: number;
  name: string;
  qty: number;
  unitPrice: number;
};

const initialItems: OrderItem[] = [
  { id: 1, name: "Pepperoni Pizza (L)", qty: 2, unitPrice: 18 },
  { id: 2, name: "Cesar Salad", qty: 1, unitPrice: 36 },
  { id: 3, name: "Coke zero", qty: 3, unitPrice: 3 },
];

export default function EditOrder() {
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const [instructions, setInstructions] = useState("No Onion on Salad");

  const updateQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => item.id === id ? { ...item, qty: item.qty + delta } : item)
        .filter((item) => item.qty > 0)
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const tax = parseFloat((subtotal * 0.15).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Edit Order #3918</h1>
          <p className="text-slate-400 text-sm mt-1">Modify items and instructions</p>
        </div>

        <div className="border-t border-slate-200 mb-6" />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left - Items */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 sm:gap-4 py-2">
                    {/* Qty Control */}
                    <div className="flex items-center gap-1.5 sm:gap-2 border border-slate-200 rounded-xl px-2 py-1.5 shrink-0">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-blue-500 font-bold transition-colors"
                      >
                        −
                      </button>
                      <span className="w-5 text-center font-bold text-slate-800 text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-blue-500 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Name */}
                    <span className="flex-1 text-slate-700 font-medium text-sm sm:text-base truncate">{item.name}</span>

                    {/* Price */}
                    <span className="text-blue-500 font-bold text-sm sm:text-base shrink-0">${item.unitPrice * item.qty}</span>
                  </div>
                ))}
              </div>

              {/* Add More Items */}
              <button className="mt-4 w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-slate-400 text-sm font-medium hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
                <span className="text-lg">⊕</span> Add More Items
              </button>
            </div>

            {/* Special Instructions */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Special Instructions</h3>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="w-full lg:w-64 bg-slate-900 rounded-2xl p-5 text-white flex flex-col gap-4 h-fit lg:sticky lg:top-6">
            <h2 className="text-lg font-bold">Order Summary</h2>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Tax</span><span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-3">
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <div className="text-right">
                  <span className="text-blue-400 text-xl">${total}</span>
                  <p className="text-slate-500 text-xs font-normal">Includes all taxes</p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-4">
              <button className="w-full py-3 rounded-xl bg-slate-700 text-sm font-semibold hover:bg-slate-600 transition-colors">
                Cancel
              </button>
              <button className="w-full py-3 rounded-xl bg-blue-500 text-sm font-bold hover:bg-blue-600 transition-colors">
                Update Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}