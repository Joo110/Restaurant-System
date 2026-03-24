import { useState } from "react";

interface ConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmModal({ onCancel, onConfirm }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 mr-8 mt-16 self-start">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          warning
        </p>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-2">Confirm Tax Update</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Changing these tax settings will affect all future financial reports and order calculations immediately.
            </p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              This action <span className="font-semibold text-gray-700">cannot be undone</span> for past transactions. Are you sure you want to proceed with the update?
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirm Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TaxSettings() {
  const [vatPercentage, setVatPercentage] = useState<string>("14");
  const [scope, setScope] = useState("Apply to all branches");
  const [taxModel, setTaxModel] = useState<"exclusive" | "inclusive">("exclusive");
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const subtotal = 100;
  const vatAmount = (subtotal * parseFloat(vatPercentage || "0")) / 100;
  const displaySubtotal = taxModel === "inclusive" ? (subtotal / (1 + parseFloat(vatPercentage || "0") / 100)).toFixed(2) : subtotal.toFixed(2);

  const handleSave = () => setShowModal(true);

  const handleConfirm = () => {
    setShowModal(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      {showModal && (
        <ConfirmModal onCancel={() => setShowModal(false)} onConfirm={handleConfirm} />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tax Settings</h1>
            <p className="text-sm text-gray-400 mt-0.5">Configure global tax rules and invoice behaviors for your restaurant chain.</p>
          </div>
          <button
            onClick={handleSave}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md ${saved ? "bg-green-500" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">%</span>
              </div>
              <h2 className="font-bold text-gray-800">Global VAT Settings</h2>
            </div>

            {/* VAT Percentage & Scope */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">VAT Percentage</label>
                <div className="relative">
                  <input
                    type="number"
                    value={vatPercentage}
                    onChange={(e) => setVatPercentage(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Scope</label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option>Apply to all branches</option>
                  <option>Apply to selected branches</option>
                  <option>Apply to dine-in only</option>
                </select>
              </div>
            </div>

            {/* Tax Model */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-3">Tax Model</label>
              <div className="space-y-3">
                {/* Exclusive */}
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${taxModel === "exclusive" ? "border-blue-500 bg-blue-50/50" : "border-gray-100 hover:border-gray-200"}`}>
                  <input
                    type="radio"
                    name="taxModel"
                    checked={taxModel === "exclusive"}
                    onChange={() => setTaxModel("exclusive")}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Exclusive Tax</p>
                    <p className="text-xs text-gray-400 mt-0.5">Tax is added on top of the menu price during checkout.</p>
                  </div>
                </label>
                {/* Inclusive */}
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${taxModel === "inclusive" ? "border-blue-500 bg-blue-50/50" : "border-gray-100 hover:border-gray-200"}`}>
                  <input
                    type="radio"
                    name="taxModel"
                    checked={taxModel === "inclusive"}
                    onChange={() => setTaxModel("inclusive")}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Inclusive Tax</p>
                    <p className="text-xs text-gray-400 mt-0.5">Tax is already included in the displayed menu price.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="font-bold text-gray-800">LIVE PREVIEW</h2>
            </div>

            <p className="text-xs text-gray-400 mb-5">
              Based on your current "{taxModel === "exclusive" ? "Exclusive Tax" : "Inclusive Tax"}" selection with {vatPercentage}% VAT.
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-800">${taxModel === "exclusive" ? "100.00" : displaySubtotal}</span>
              </div>
              {taxModel === "exclusive" && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">+ VAT ({vatPercentage}%)</span>
                  <span className="font-medium text-gray-500">${vatAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-900 text-base">Total</span>
                <span className="font-bold text-gray-900 text-xl">${taxModel === "exclusive" ? (subtotal + vatAmount).toFixed(2) : "100.00"}</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 flex gap-2.5">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <p className="text-xs text-blue-700 leading-relaxed">
                {taxModel === "exclusive"
                  ? "The exclusive tax model adds the tax percentage to the final bill. This is common in B2B transactions and US/Canada markets."
                  : "The inclusive tax model includes the tax within the displayed price. Common in retail and EU markets."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}