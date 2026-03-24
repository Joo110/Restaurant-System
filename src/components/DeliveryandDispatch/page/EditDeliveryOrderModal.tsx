// src/components/Dispatch/modals/EditDeliveryOrderModal.tsx
import { useState } from "react";
import { updateDispatchStatusFn } from "../hooks/useDispatches";
import { invalidateQuery } from "../../../hook/queryClient";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  note: string;
}

interface EditDeliveryOrderModalProps {
  dispatchId: string;
  orderId?: string;
  initialAddress?: string;
  initialPhone?: string;
  initialNotes?: string;
  initialItems?: OrderItem[];
  onCancel?: () => void;
  onSuccess?: () => void;
}

interface FormErrors {
  phone?:   string;
  address?: string;
}

const defaultItems: OrderItem[] = [
  { name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
  { name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
  { name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
];

const TAX          = 12.5;
const DELIVERY_FEE = 7.5;

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(phone: string, address: string): FormErrors {
  const errors: FormErrors = {};

  if (!phone.trim())
    errors.phone = "Customer phone number is required";
  else if (!/^[0-9+\-\s()]{7,15}$/.test(phone.trim()))
    errors.phone = "Enter a valid phone number (7–15 digits)";

  if (!address.trim())
    errors.address = "Delivery address is required";
  else if (address.trim().length < 5)
    errors.address = "Address is too short";
  else if (address.trim().length > 200)
    errors.address = "Address must be under 200 characters";

  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditDeliveryOrderModal({
  dispatchId,
  orderId        = "ORD-788",
  initialAddress = "125 Horeya street apartment 4",
  initialPhone   = "",
  initialNotes   = "",
  initialItems   = defaultItems,
  onCancel,
  onSuccess,
}: EditDeliveryOrderModalProps) {
  const [phone,    setPhone]    = useState(initialPhone);
  const [address,  setAddress]  = useState(initialAddress);
  const [notes,    setNotes]    = useState(initialNotes);
  const [items,    setItems]    = useState<OrderItem[]>(initialItems);
  const [errors,   setErrors]   = useState<FormErrors>({});
  const [touched,  setTouched]  = useState({ phone: false, address: false });
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total    = subtotal + TAX + DELIVERY_FEE;

  // ── Field helpers ──
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setApiError(null);
    if (touched.phone) {
      const errs = validate(val, address);
      setErrors(prev => ({ ...prev, phone: errs.phone }));
    }
  };

  const handleAddressChange = (val: string) => {
    setAddress(val);
    setApiError(null);
    if (touched.address) {
      const errs = validate(phone, val);
      setErrors(prev => ({ ...prev, address: errs.address }));
    }
  };

  const updateQty = (index: number, delta: number) =>
    setItems(prev =>
      prev.map((it, i) =>
        i === index ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it
      )
    );

  const updateNote = (index: number, note: string) =>
    setItems(prev =>
      prev.map((it, i) => (i === index ? { ...it, note } : it))
    );

  // ── Submit ──
  const handleSave = async () => {
    setTouched({ phone: true, address: true });
    const errs = validate(phone, address);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError(null);
    try {
      // The dispatch API supports PATCH on the dispatch doc.
      // Customer phone / address updates depend on your backend shape.
      // For now we refresh the status so the invalidation propagates.
      // Replace this with a proper PATCH payload once the API supports it.
      await updateDispatchStatusFn(dispatchId, {
        status:          undefined as any,
        customerPhone:   phone.trim(),
        deliveryAddress: address.trim(),
        notes:           notes.trim() || undefined,
      } as any);
      invalidateQuery("dispatches");
      onSuccess?.();
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ??
        err?.message ??
        "Failed to save changes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900">Edit Delivery Order</h2>
        <p className="text-sm text-gray-500 mt-1">Order ID : #{orderId}</p>

        <div className="border-t border-gray-200 my-5" />

        {/* API Error */}
        {apiError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {apiError}
          </div>
        )}

        {/* Customer Number & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => handlePhoneChange(e.target.value)}
              onBlur={() => {
                setTouched(prev => ({ ...prev, phone: true }));
                setErrors(validate(phone, address));
              }}
              placeholder="+(20) 01xxxxxxxxx"
              className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm text-gray-800 
                focus:outline-none focus:ring-2 shadow-sm transition placeholder-gray-400
                ${errors.phone
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-200 focus:ring-blue-500"}`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
            <input
              type="text"
              value={address}
              onChange={e => handleAddressChange(e.target.value)}
              onBlur={() => {
                setTouched(prev => ({ ...prev, address: true }));
                setErrors(validate(phone, address));
              }}
              placeholder="Street, apartment, city"
              className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm text-gray-800
                focus:outline-none focus:ring-2 shadow-sm transition placeholder-gray-400
                ${errors.address
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-200 focus:ring-blue-500"}`}
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            placeholder="e.g. No onions please"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            maxLength={300}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{notes.length}/300</p>
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
                    className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold transition"
                  >+</button>
                  <span className="text-sm font-bold text-gray-800 w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(i, -1)}
                    className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold transition"
                  >−</button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                    <span className="text-sm font-bold text-gray-800">${item.price.toFixed(2)}</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Add note...."
                    value={item.note}
                    onChange={e => updateNote(i, e.target.value)}
                    maxLength={100}
                    className="w-full mt-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 space-y-2">
          {([
            ["Subtotal",     subtotal],
            ["Tax",          TAX],
            ["Delivery Fee", DELIVERY_FEE],
          ] as [string, number][]).map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm text-gray-600">
              <span>{l}</span>
              <span className="font-semibold">${v.toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-bold text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-60 flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}