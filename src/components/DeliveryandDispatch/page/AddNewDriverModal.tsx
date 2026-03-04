import { useState, useRef } from "react";

interface AddNewDriverModalProps {
  onCancel?: () => void;
  onAdd?: (data: DriverFormData) => void;
}

interface DriverFormData {
  name: string;
  phone: string;
  vehicleType: string;
  license: File | null;
  insurance: File | null;
}

export default function AddNewDriverModal({ onCancel, onAdd }: AddNewDriverModalProps) {
  const [form, setForm] = useState<DriverFormData>({
    name: "",
    phone: "",
    vehicleType: "",
    license: null,
    insurance: null,
  });

  const licenseRef = useRef<HTMLInputElement>(null);
  const insuranceRef = useRef<HTMLInputElement>(null);

  const handleFile = (field: "license" | "insurance", file: File | null) => {
    setForm((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = () => {
    onAdd?.(form);
  };

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900">Add New Driver</h2>
        <p className="text-sm text-gray-500 mt-1">Register a anew delivery partner to your fleet.</p>

        <div className="border-t border-gray-200 my-5" />

        {/* Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name</label>
            <input
              type="text"
              placeholder="e.g. Mohamed Morsy"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
            <input
              type="tel"
              placeholder="+(20) 20522463"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Vehicle Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
          <input
            type="text"
            placeholder="e.g. Bike"
            value={form.vehicleType}
            onChange={(e) => setForm((p) => ({ ...p, vehicleType: e.target.value }))}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Document Upload */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Document upload</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Driving License */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Driving License</p>
              <input
                ref={licenseRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFile("license", e.target.files?.[0] ?? null)}
              />
              <button
                onClick={() => licenseRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-2xl py-4 px-3 flex flex-col items-center gap-2 transition ${
                  form.license
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                <svg className={`w-6 h-6 ${form.license ? "text-blue-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className={`text-xs font-medium ${form.license ? "text-blue-600" : "text-gray-500"}`}>
                  {form.license ? form.license.name.slice(0, 15) + "..." : "Upload PDF / JPG"}
                </span>
              </button>
            </div>

            {/* Insurance Policy */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Insurance Policy</p>
              <input
                ref={insuranceRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFile("insurance", e.target.files?.[0] ?? null)}
              />
              <button
                onClick={() => insuranceRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-2xl py-4 px-3 flex flex-col items-center gap-2 transition ${
                  form.insurance
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                <svg className={`w-6 h-6 ${form.insurance ? "text-blue-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className={`text-xs font-medium ${form.insurance ? "text-blue-600" : "text-gray-500"}`}>
                  {form.insurance ? form.insurance.name.slice(0, 15) + "..." : "Upload PDF / JPG"}
                </span>
              </button>
            </div>
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
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Add Driver
          </button>
        </div>
      </div>
    </div>
  );
}