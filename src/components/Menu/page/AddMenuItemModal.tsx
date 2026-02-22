// src/components/Menu/AddMenuItemModal.tsx
import { useState, useRef } from "react";
import { X, Plus, Upload } from "lucide-react";

export type Category = "Starters" | "Mains" | "Desserts" | "Drinks";

export interface NewMenuItem {
  name: string;
  category: Category | "";
  price: number;
  description: string;
  available: boolean;
  image?: File;
}

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: NewMenuItem) => void;
}

const CATEGORIES: Category[] = ["Starters", "Mains", "Desserts", "Drinks"];

export default function AddMenuItemModal({ isOpen, onClose, onAdd }: AddMenuItemModalProps) {
  const [form, setForm] = useState<NewMenuItem>({
    name: "", category: "", price: 0, description: "", available: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragOver,     setDragOver]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImage = (file: File) => {
    setForm((f) => ({ ...f, image: file }));
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) handleImage(file);
  };

  const handleSubmit = () => {
    if (!form.name || !form.category || !form.price) return;
    onAdd(form);
    setForm({ name: "", category: "", price: 0, description: "", available: true });
    setImagePreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — stacks on mobile, side-by-side on sm+ */}
      <div className="relative bg-blue-50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-blue-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add New Menu Item</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors ml-3 flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-8 py-5">
          {/* 1-col on mobile, 2-col on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors h-52 sm:h-64 ${
                  dragOver        ? "border-blue-400 bg-blue-50" :
                  imagePreview    ? "border-gray-200 bg-white" :
                  "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/30"
                }`}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-xl p-2" />
                ) : (
                  <>
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-3">
                      <Upload size={20} className="text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Click to upload</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5 MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])} />
              </div>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Name</label>
                <input
                  type="text" placeholder="e.g. Classic cheese burger"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category | "" }))}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 appearance-none"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
                    type="number" min={0} step={0.01} placeholder="0.00"
                    value={form.price || ""}
                    onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  rows={3} placeholder="Brief description of ingredients and preparing"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>

              {/* Available */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={form.available}
                    onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${form.available ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}`}>
                    {form.available && <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                </div>
                <span className="text-sm text-gray-700">Available for order</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-8 pb-6 pt-4 border-t border-blue-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.name || !form.category}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus size={16} />
            Add item
          </button>
        </div>
      </div>
    </div>
  );
}