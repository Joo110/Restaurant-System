import { useState } from "react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  note: string;
}

interface EditDeliveryOrderModalProps {
  orderId?: string;
  initialAddress?: string;
  initialPhone?: string;
  initialNotes?: string;
  initialItems?: OrderItem[];
  onCancel?: () => void;
  onSave?: (data: EditOrderData) => void;
}

interface EditOrderData {
  phone: string;
  address: string;
  notes: string;
  items: OrderItem[];
}

const defaultItems: OrderItem[] = [
  { name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
  { name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
  { name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
];

export default function EditDeliveryOrderModal({
  orderId = "ORD-788",
  initialAddress = "125 Horeya street apartment 4.",
  initialPhone = "0.00",
  initialNotes = "",
  initialItems = defaultItems,
  onCancel,
  onSave,
}: EditDeliveryOrderModalProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [notes, setNotes] = useState(initialNotes);
  const [items, setItems] = useState<OrderItem[]>(initialItems);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = 12.5;
  const deliveryFee = 7.5;
  const total = subtotal + tax + deliveryFee;

  const updateQty = (index: number, delta: number) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, updated[index].quantity + delta);
    setItems(updated);
  };

  const updateNote = (index: number, note: string) => {
    const updated = [...items];
    updated[index].note = note;
    setItems(updated);
  };

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900">Edit Delivery Order</h2>
        <p className="text-sm text-gray-500 mt-1">Order ID : #{orderId}</p>

        <div className="border-t border-gray-200 my-5" />

        {/* Customer Number & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            placeholder="e.g. Dina Flour Egyptian Kitchen"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
          />
        </div>

        {/* Add Items Link */}
        <div className="flex justify-end mb-3">
          <button className="text-blue-600 font-semibold text-sm flex items-center gap-1 hover:underline">
            Add Items
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-5">
          {items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                {/* Quantity Controls */}
                <div className="flex flex-col items-center gap-0.5">
                  <button
                    onClick={() => updateQty(i, 1)}
                    className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <span className="text-sm font-bold text-gray-800 w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(i, -1)}
                    className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                    <span className="text-sm font-bold text-gray-800">${item.price}</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Add note...."
                    value={item.note}
                    onChange={(e) => updateNote(i, e.target.value)}
                    className="w-full mt-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax</span>
            <span className="font-semibold">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery Fee</span>
            <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-bold text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(0)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave?.({ phone, address, notes, items })}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Add To Inventory
          </button>
        </div>
      </div>
    </div>
  );
}