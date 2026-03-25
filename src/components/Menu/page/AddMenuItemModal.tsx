import { useState, useRef } from "react";
import { X, Save, Upload, Loader2, AlertCircle } from "lucide-react";
import { useCreateItemMutation } from "../hook/useItemMutations";

type Category = "Starters" | "Mains" | "Desserts" | "Drinks";

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  branchId: string;
}

interface FormState {
  name: string;
  category: Category;
  price: number | "";
  description: string;
  available: boolean;
  imageFile?: File;
}

const CATEGORIES: Category[] = ["Starters", "Mains", "Desserts", "Drinks"];

const CAT_LOWER: Record<Category, string> = {
  Starters: "starters",
  Mains: "mains",
  Desserts: "desserts",
  Drinks: "drinks",
};

const INITIAL_FORM: FormState = {
  name: "",
  category: "Mains",
  price: "",
  description: "",
  available: true,
  imageFile: undefined,
};

export default function AddMenuItemModal({
  isOpen,
  onClose,
  onSaved,
  branchId,
}: AddMenuItemModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const { mutateAsync, isLoading } = useCreateItemMutation({
    onError: (err) => {
      const msg =
        (err as { message?: string })?.message ??
        "Something went wrong. Please try again.";
      setApiError(msg);
    },
  });

  if (!isOpen) return null;

  // ── Image helpers ──────────────────────────────────────────────────────────
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setForm((f) => ({ ...f, imageFile: file }));
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) {
      newErrors.name = "Item name is required.";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!form.category) {
      newErrors.category = "Please select a category.";
    }

    if (form.price === "" || Number(form.price) < 0) {
      newErrors.price = "Please enter a valid price.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleClose = () => {
    if (isLoading) return;
    setForm(INITIAL_FORM);
    setImagePreview(null);
    setApiError(null);
    setErrors({});
    onClose();
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
  if (!validate()) return;
  setApiError(null);

  try {
    await mutateAsync({
      name:        form.name.trim(),
      description: form.description.trim(),
      price:       String(form.price),
      category:    CAT_LOWER[form.category],
      isAvailable: form.available ? "true" : "false",
      branchId:    branchId,
      image:       form.imageFile ?? null,   // File أو null
    });
    handleClose();
    onSaved?.();
  } catch {
    // handled in onError
  }
};

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-blue-50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-blue-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 pr-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add Menu Item</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Fill in the details for the new item
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors flex-shrink-0 disabled:opacity-40"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="mx-5 sm:mx-8 mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="text-sm">{apiError}</p>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden h-52 sm:h-64 ${
                  dragOver
                    ? "border-blue-400 bg-blue-50"
                    : imagePreview
                    ? "border-gray-200 bg-white"
                    : "border-gray-300 bg-white hover:border-blue-400"
                }`}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center px-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-green-100 to-yellow-100 flex items-center justify-center text-5xl sm:text-6xl mx-auto mb-3">
                      🍴
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                      <Upload size={12} />
                      Click or drag to upload image
                    </div>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                />
              </div>
              {imagePreview && (
                <p className="text-xs text-gray-400 mt-1.5 text-center">Click the image to replace it</p>
              )}
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Item Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. Grilled Salmon"
                  disabled={isLoading}
                  className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-colors disabled:opacity-60 ${
                    errors.name
                      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, category: e.target.value as Category }));
                      if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                    }}
                    disabled={isLoading}
                    className={`w-full px-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 appearance-none transition-colors disabled:opacity-60 ${
                      errors.category
                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                    }`}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
                </div>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.price}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, price: e.target.value === "" ? "" : parseFloat(e.target.value) }));
                      if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                    }}
                    placeholder="0.00"
                    disabled={isLoading}
                    className={`w-full pl-8 pr-4 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition-colors disabled:opacity-60 ${
                      errors.price
                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                    }`}
                  />
                </div>
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional — describe the item..."
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none disabled:opacity-60"
                />
              </div>

              {/* Available toggle */}
              <label className={`flex items-center gap-2 cursor-pointer ${isLoading ? "opacity-60 pointer-events-none" : ""}`}>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    form.available ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                  }`}>
                    {form.available && (
                      <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none">
                        <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-700">Available for order</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-8 pb-6 pt-4 border-t border-blue-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Save size={16} />
                Add Item
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}