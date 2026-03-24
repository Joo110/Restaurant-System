// src/components/Dispatch/modals/AddNewDriverModal.tsx
import { useState, useRef } from "react";
import { createDriverFn } from "../hooks/useDrivers";
import { invalidateQuery } from "../../../hook/queryClient";
import type { CreateDriverDTO, VehicleType } from "../services/driverService";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddNewDriverModalProps {
  branchId: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

interface DriverFormData {
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehiclePlate: string;
  license: File | null;
  insurance: File | null;
}

interface DriverFormErrors {
  name?: string;
  phone?: string;
  email?: string;
  vehicleType?: string;
  vehiclePlate?: string;
}

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "scooter",  label: "Scooter" },
  { value: "car",      label: "Car" },
  { value: "bicycle",  label: "Bicycle" },
];

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(data: DriverFormData): DriverFormErrors {
  const errors: DriverFormErrors = {};

  if (!data.name.trim())
    errors.name = "Driver name is required";
  else if (data.name.trim().length < 3)
    errors.name = "Name must be at least 3 characters";
  else if (data.name.trim().length > 60)
    errors.name = "Name must be under 60 characters";

  if (!data.phone.trim())
    errors.phone = "Phone number is required";
  else if (!/^[0-9+\-\s()]{7,15}$/.test(data.phone.trim()))
    errors.phone = "Enter a valid phone number (7-15 digits)";

  if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    errors.email = "Enter a valid email address";

  if (!data.vehicleType)
    errors.vehicleType = "Vehicle type is required";

  if (!data.vehiclePlate.trim())
    errors.vehiclePlate = "Vehicle plate is required";
  else if (data.vehiclePlate.trim().length < 3)
    errors.vehiclePlate = "Plate number is too short";

  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddNewDriverModal({
  branchId,
  onCancel,
  onSuccess,
}: AddNewDriverModalProps) {
  const [form, setForm] = useState<DriverFormData>({
    name: "", phone: "", email: "",
    vehicleType: "", vehiclePlate: "",
    license: null, insurance: null,
  });
  const [errors,   setErrors]   = useState<DriverFormErrors>({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [touched,  setTouched]  = useState<Partial<Record<keyof DriverFormData, boolean>>>({});

  const licenseRef   = useRef<HTMLInputElement>(null);
  const insuranceRef = useRef<HTMLInputElement>(null);

  const setField = <K extends keyof DriverFormData>(field: K, value: DriverFormData[K]) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (touched[field]) {
        const errs = validate(next);
        setErrors(prev => ({ ...prev, [field]: errs[field as keyof DriverFormErrors] }));
      }
      return next;
    });
    setApiError(null);
  };

  const blur = (field: keyof DriverFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errs = validate(form);
    setErrors(prev => ({ ...prev, [field]: errs[field as keyof DriverFormErrors] }));
  };

  const handleFile = (field: "license" | "insurance", file: File | null) => {
    setForm(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async () => {
    setTouched({ name: true, phone: true, email: true, vehicleType: true, vehiclePlate: true });
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError(null);
    try {
      const payload: CreateDriverDTO = {
        name:         form.name.trim(),
        phone:        form.phone.trim(),
        vehicleType:  form.vehicleType as VehicleType,
        vehiclePlate: form.vehiclePlate.trim(),
        branchId,
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
      };
      await createDriverFn(payload);
      invalidateQuery("drivers");
      onSuccess?.();
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ??
        err?.message ??
        "Failed to add driver. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const TextField = ({
    id, label, placeholder, type = "text", optional = false,
  }: {
    id: keyof DriverFormErrors;
    label: string;
    placeholder: string;
    type?: string;
    optional?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[id] as string}
        onChange={e => setField(id, e.target.value)}
        onBlur={() => blur(id)}
        className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 
          focus:outline-none focus:ring-2 shadow-sm transition
          ${errors[id]
            ? "border-red-400 focus:ring-red-300"
            : "border-gray-200 focus:ring-blue-500"}`}
      />
      {errors[id] && <p className="text-xs text-red-500 mt-1">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl">

        <h2 className="text-2xl font-bold text-gray-900">Add New Driver</h2>
        <p className="text-sm text-gray-500 mt-1">Register a new delivery partner to your fleet.</p>

        <div className="border-t border-gray-200 my-5" />

        {apiError && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <TextField id="name"  label="Driver Name"    placeholder="e.g. Mohamed Morsy" />
          <TextField id="phone" label="Contact Number" placeholder="+(20) 01xxxxxxxxx" type="tel" />
        </div>

        <div className="mb-4">
          <TextField id="email" label="Email" placeholder="ahmed@example.com" type="email" optional />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
          <div className="flex gap-3">
            {VEHICLE_TYPES.map(vt => (
              <button
                key={vt.value}
                onClick={() => { setField("vehicleType", vt.value); blur("vehicleType"); }}
                className={`flex-1 py-3 rounded-2xl border-2 text-sm font-semibold transition ${
                  form.vehicleType === vt.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : errors.vehicleType
                    ? "border-red-300 bg-white text-gray-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                }`}
              >
                {vt.label}
              </button>
            ))}
          </div>
          {errors.vehicleType && <p className="text-xs text-red-500 mt-1">{errors.vehicleType}</p>}
        </div>

        <div className="mb-6">
          <TextField id="vehiclePlate" label="Vehicle Plate" placeholder="e.g. ABC-1234" />
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Document Upload</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Driving License</p>
              <input
                ref={licenseRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={e => handleFile("license", e.target.files?.[0] ?? null)}
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
                <span className={`text-xs font-medium text-center break-all ${form.license ? "text-blue-600" : "text-gray-500"}`}>
                  {form.license
                    ? form.license.name.length > 16
                      ? form.license.name.slice(0, 14) + "..."
                      : form.license.name
                    : "Upload PDF / JPG"}
                </span>
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Insurance Policy</p>
              <input
                ref={insuranceRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={e => handleFile("insurance", e.target.files?.[0] ?? null)}
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
                <span className={`text-xs font-medium text-center break-all ${form.insurance ? "text-blue-600" : "text-gray-500"}`}>
                  {form.insurance
                    ? form.insurance.name.length > 16
                      ? form.insurance.name.slice(0, 14) + "..."
                      : form.insurance.name
                    : "Upload PDF / JPG"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-60 flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? "Adding..." : "Add Driver"}
          </button>
        </div>
      </div>
    </div>
  );
}