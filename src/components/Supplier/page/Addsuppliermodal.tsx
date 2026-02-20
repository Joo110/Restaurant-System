// src/components/Inventory/page/AddSupplierModal.tsx

type Props = {
  onClose: () => void;
};


export default function AddSupplierModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 font-sans max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900">Add Supplier</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-5">Expand your network by onboarding a anew partner.</p>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          {/* Supplier Company */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Supplier Company<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dina flour"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Main Contact + Business Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Main Contact<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ahmed Ali"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Business Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="contact@supplier.com"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Support Phone + Website */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Support Phone</label>
              <input
                type="tel"
                placeholder="+20 0000000000"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
              <input
                type="text"
                placeholder="https://"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Office Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Office Address</label>
            <textarea
              rows={3}
              placeholder="e.g. Dakahlia, Metghamr, Dahab street, Building 4,"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Dashed divider */}
          <div className="border-t-2 border-dashed border-slate-200" />

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Categories</label>
            <textarea
              rows={3}
              placeholder="e.g. Flour / Salt / Ketchup / Milk"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Dashed divider */}
          <div className="border-t-2 border-dashed border-slate-200" />

          {/* Bank + Account Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank</label>
              <input
                type="text"
                placeholder="Enter Bank Name"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Number</label>
              <input
                type="text"
                placeholder="Enter Account Number"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
            Add New Supplier
          </button>
        </div>
      </div>
    </div>
  );
}