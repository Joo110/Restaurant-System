// src/components/Menu/EditMenuItemModal.tsx
import { useState, useRef } from "react";
import { X, Save, Upload, Loader2, AlertCircle } from "lucide-react";
import type { MenuItem } from "./MenuManagement";
import { useUpdateItemMutation } from "../hook/useItemMutations";

type Category = "Starters" | "Mains" | "Desserts" | "Drinks";

/** Shape sent to the API — lowercase category & isAvailable */
interface UpdateItemPayload {
  name: string;
  description: string;
  price: number;
  category: "starters" | "mains" | "desserts" | "drinks";
  isAvailable: boolean;
  image?: File; // only when user picked a new file
}

interface EditMenuItemModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  onClose: () => void;
  /** Called after a successful save so the parent can react (optional) */
  onSaved?: (updated: MenuItem) => void;
}

const CATEGORIES: Category[] = ["Starters", "Mains", "Desserts", "Drinks"];

/** Local form state mirrors the UI fields */
interface FormState {
  name: string;
  category: Category;
  price: number;
  description: string;
  available: boolean;
  /** Existing remote URL (shown as preview when no new file chosen) */
  imageUrl?: string;
  /** New file chosen by the user — will be uploaded */
  imageFile?: File;
}

export default function EditMenuItemModal({
  isOpen,
  item,
  onClose,
  onSaved,
}: EditMenuItemModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  // helper to build initial form state from incoming item
  const initialFormFromItem = (it: MenuItem): FormState => ({
    name: it.name ?? "",
    category: (it.category as Category) ?? "Mains",
    price: typeof it.price === "number" ? it.price : Number(it.price ?? 0),
    description: it.description ?? "",
    available: typeof it.available === "boolean" ? it.available : Boolean(it.available),
    imageUrl: it.image ?? undefined,
    imageFile: undefined,
  });

  // initialize form & preview based on item (component remounts when `item` key changes)
  const [form, setForm] = useState<FormState | null>(() => (item ? initialFormFromItem(item) : null));
  const [imagePreview, setImagePreview] = useState<string | null>(() => (item ? (item.image ?? null) : null));
  const [dragOver, setDragOver] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { mutateAsync, isLoading } = useUpdateItemMutation({
    onError: (err) => {
      const msg =
        (err as { message?: string })?.message ??
        "Something went wrong. Please try again.";
      setApiError(msg);
    },
  });

  // if modal not open or no item yet, render nothing (keeps previous behavior)
  if (!isOpen || !form || !item) return null;

  // ── Image helpers ──────────────────────────────────────────────────────────
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setForm((f) => (f ? { ...f, imageFile: file } : f));
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

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim() || !form.category) return;
    setApiError(null);

    const CAT_LOWER: Record<Category, UpdateItemPayload["category"]> = {
      Starters: "starters",
      Mains: "mains",
      Desserts: "desserts",
      Drinks: "drinks",
    };

    // Build payload — use FormData when a new image was chosen, plain object otherwise
    let payload: UpdateItemPayload | FormData;

    if (form.imageFile) {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price", String(form.price));
      fd.append("category", CAT_LOWER[form.category]);
      fd.append("isAvailable", String(form.available));
      fd.append("image", form.imageFile);
      payload = fd;
    } else {
      payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: form.price,
        category: CAT_LOWER[form.category],
        isAvailable: form.available,
      };
    }

    try {
      // item._id is the mongo ObjectId the API expects
      await mutateAsync(item._id, payload);

      // Build updated MenuItem to hand back to the parent (optimistic-ish)
      if (onSaved) {
        const updated: MenuItem = {
          ...item,
          name: form.name.trim(),
          description: form.description.trim(),
          price: form.price,
          category: form.category,
          available: form.available,
          image: form.imageFile ? imagePreview ?? item.image : item.image,
        };
        onSaved(updated);
      }

      onClose();
    } catch {
      // error already handled in onError callback above
    }
  };

  const isValid = form.name.trim().length > 0 && !!form.category;

  // ── Render ─────────────────────────────────────────────────────────────────
  // add key so component remounts when `item` changes -> keeps state initialization consistent
  return (
    <div key={item._id ?? "edit-menu-item-modal"} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-blue-50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-blue-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 pr-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit Menu Item</h2>
              <p className="text-sm text-gray-500 mt-0.5 truncate">
                Update details for &ldquo;{item.name}&rdquo;
              </p>
            </div>
            <button
              onClick={!isLoading ? onClose : undefined}
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

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">

            {/* ── Image Upload ── */}
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
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </>
                ) : (
                  <div className="text-center px-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-green-100 to-yellow-100 flex items-center justify-center text-5xl sm:text-6xl mx-auto mb-3">
                      🍴
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                      <Upload size={12} />
                      Click or drag to change image
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
              {/* Show "change" hint when image is already set */}
              {imagePreview && (
                <p className="text-xs text-gray-400 mt-1.5 text-center">
                  Click the image to replace it
                </p>
              )}
            </div>

            {/* ── Fields ── */}
            <div className="flex flex-col gap-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Item Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => f ? { ...f, name: e.target.value } : f)}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                  disabled={isLoading}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => f ? { ...f, category: e.target.value as Category } : f)
                    }
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 appearance-none disabled:opacity-60"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▾
                  </span>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => f ? { ...f, price: parseFloat(e.target.value) || 0 } : f)
                    }
                    disabled={isLoading}
                    className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => f ? { ...f, description: e.target.value } : f)
                  }
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
                    onChange={(e) =>
                      setForm((f) => f ? { ...f, available: e.target.checked } : f)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      form.available ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                    }`}
                  >
                    {form.available && (
                      <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none">
                        <path
                          d="M1 4l2.5 2.5L9 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
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
            onClick={!isLoading ? onClose : undefined}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || isLoading}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}