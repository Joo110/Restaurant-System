import { useState, useRef, useEffect } from "react";
import { X, Save, Upload } from "lucide-react";
import type { MenuItem } from "./MenuManagement";

type Category = "Starters" | "Mains" | "Desserts" | "Drinks";

interface EditMenuItemModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onSave: (updated: MenuItem) => void;
}

const CATEGORIES: Category[] = ["Starters", "Mains", "Desserts", "Drinks"];

export default function EditMenuItemModal({ isOpen, item, onClose, onSave }: EditMenuItemModalProps) {
  const [form, setForm] = useState<MenuItem | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      // تأجيل تحديث الحالة إلى microtask لتفادي setState المتزامن داخل الـ effect
      Promise.resolve().then(() => {
        setForm({ ...item });
        setImagePreview(item.image ?? null);
      });
    }
  }, [item]);

  if (!isOpen || !form) return null;

  const handleImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImagePreview(src);
      setForm((f) => f ? { ...f, image: src } : f);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      handleImage(file);
    }
  };

  const handleSave = () => {
    if (!form.name || !form.category) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-blue-50 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Menu Item</h2>
              <p className="text-sm text-gray-500 mt-0.5">Update details for "{form.name}"</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 grid grid-cols-2 gap-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${
                dragOver
                  ? "border-blue-400 bg-blue-50"
                  : imagePreview
                  ? "border-gray-200 bg-white"
                  : "border-gray-300 bg-white hover:border-blue-400"
              }`}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
              ) : (
                // Default food emoji placeholder
                <div className="w-full h-full flex items-center justify-center bg-white">
                  <div className="text-center">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-100 to-yellow-100 flex items-center justify-center text-6xl mx-auto mb-3">
                      🥗
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Upload size={12} />
                      Click to change image
                    </div>
                  </div>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
              />
            </div>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => f ? { ...f, name: e.target.value } : f)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => f ? { ...f, category: e.target.value as Category } : f)}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 appearance-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => setForm((f) => f ? { ...f, price: parseFloat(e.target.value) || 0 } : f)}
                  className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => f ? { ...f, description: e.target.value } : f)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>

            {/* Available */}
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm((f) => f ? { ...f, available: e.target.checked } : f)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  form.available ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                }`}>
                  {form.available && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-700">Available for order</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={!form.name || !form.category}
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}