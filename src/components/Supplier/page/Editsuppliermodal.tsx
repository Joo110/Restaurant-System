// src/components/Inventory/page/EditSupplierModal.tsx

type Props = {
  onClose: () => void;
};

const banks = ["Cairo", "CIB", "NBE", "Banque Misr", "Alex Bank"];

// Mock supplier data - in real app fetch by id
const supplier = {
  company: "Dina flour supplier group",
  contact: "Ahmed Ali",
  email: "contact@Dinasupplier.com",
  phone: "+20 12125626",
  website: "https://Dinasuuplier.com",
  address: "Dakahlia, Metghamr, Dahab street, Building 4,",
  categories: "Flour / Salt / Ketchup / Milk",
  bank: "Cairo",
  accountNumber: "044445123445185",
};

export default function EditSupplierModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 font-sans max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900">Edit Supplier Details</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-5">Update existing partner information and configuration</p>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          {/* Supplier Company */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Supplier Company<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              defaultValue={supplier.company}
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
                defaultValue={supplier.contact}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Business Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                defaultValue={supplier.email}
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
                defaultValue={supplier.phone}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
              <input
                type="text"
                defaultValue={supplier.website}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Office Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Office Address</label>
            <textarea
              rows={3}
              defaultValue={supplier.address}
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
              defaultValue={supplier.categories}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Dashed divider */}
          <div className="border-t-2 border-dashed border-slate-200" />

          {/* Bank + Account Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bank</label>
              <select
                defaultValue={supplier.bank}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {banks.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Account Number</label>
              <input
                type="text"
                defaultValue={supplier.accountNumber}
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