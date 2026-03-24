// src/components/Dispatch/page/DispatchManagement.tsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import Cookies from "js-cookie";
import {
  useDispatches,
  useActiveDispatches,
  useRecentActivity,
  updateDispatchStatusFn,
  createDispatchFn,
} from "../hooks/useDispatches";
import {
  useDrivers,
  createDriverFn,
  deleteDriverFn,
  updateDriverFn,
} from "../hooks/useDrivers";
import { useOrders } from "../../Order/hook/useOrders";
import { invalidateQuery } from "../../../hook/queryClient";
import type { Dispatch, CreateDispatchDTO } from "../services/dispatchService";
import type { Driver, CreateDriverDTO, UpdateDriverDTO, VehicleType } from "../services/driverService";
import type { Order } from "../../Order/services/orderService";
import type { ApiBranch } from "../../layout/Topbar";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Auth user helper ──────────────────────────────────────────────────────────
function getAuthUser(): { role?: string; branchId?: string; name?: string } | null {
  try {
    const raw = Cookies.get("authUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─── Branch helper ─────────────────────────────────────────────────────────────
function isObjectId(value: unknown): value is string {
  return typeof value === "string" && /^[a-f\d]{24}$/i.test(value.trim());
}

function useBranchId(propBranchId?: string): string | undefined {
  const outlet = useOutletContext<{ activeBranch?: ApiBranch | null } | undefined>();
  const branch = outlet?.activeBranch ?? null;
  const authUser = getAuthUser();

  if (authUser?.role === "manager") {
    const bid = authUser?.branchId;
    return isObjectId(bid) ? bid : undefined;
  }

  const candidates = [propBranchId, branch?.id, branch?._id];
  return candidates.find(isObjectId);
}

// ─── Colour maps ───────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  assigned: "bg-blue-100 text-blue-700",
  "picked-up": "bg-purple-100 text-purple-700",
  "out-for-delivery": "bg-yellow-100 text-yellow-700",
  delivered: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const driverStatusColors: Record<string, string> = {
  present: "bg-green-100 text-green-700",
  busy: "bg-blue-100 text-blue-700",
  absent: "bg-orange-100 text-orange-700",
  offline: "bg-gray-100 text-gray-500",
};

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "scooter", label: "🛵 Scooter" },
  { value: "car", label: "🚗 Car" },
  { value: "bicycle", label: "🚲 Bicycle" },
];

// ─── Validation ────────────────────────────────────────────────────────────────
const PHONE_RE = /^[0-9+\-\s()]{7,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface DriverFormData {
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehiclePlate: string;
  assignedAreas: string;
}

interface DriverFormErrors {
  name?: string;
  phone?: string;
  email?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  assignedAreas?: string;
}

function validateDriver(f: DriverFormData): DriverFormErrors {
  const e: DriverFormErrors = {};
  if (!f.name.trim()) e.name = "Driver name is required";
  else if (f.name.trim().length < 3) e.name = "Name must be at least 3 characters";
  if (!f.phone.trim()) e.phone = "Phone number is required";
  else if (!PHONE_RE.test(f.phone.trim())) e.phone = "Enter a valid phone number";
  if (f.email && !EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email address";
  if (!f.vehicleType) e.vehicleType = "Vehicle type is required";
  if (!f.vehiclePlate.trim()) e.vehiclePlate = "Vehicle plate is required";
  else if (f.vehiclePlate.trim().length < 3) e.vehiclePlate = "Plate number is too short";
  return e;
}

// ─── FormField ────────────────────────────────────────────────────────────────
function FormField({
  label,
  value,
  placeholder,
  type = "text",
  error,
  optional = false,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  error?: string;
  optional?: boolean;
  onChange: (v: string) => void;
  onBlur?: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {optional && <span className="text-gray-400 font-normal ml-1 text-xs">(optional)</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400
          focus:outline-none focus:ring-2 shadow-sm transition
          ${error ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Add Driver Modal ──────────────────────────────────────────────────────────
function AddDriverModal({ onClose }: { onClose: () => void }) {
  const resolvedBranchId = useBranchId();
  const [form, setForm] = useState<DriverFormData>({
    name: "",
    phone: "",
    email: "",
    vehicleType: "",
    vehiclePlate: "",
    assignedAreas: "",
  });
  const [errors, setErrors] = useState<DriverFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof DriverFormData, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const setField = (field: keyof DriverFormData, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) setErrors((p) => ({ ...p, [field]: validateDriver(next)[field as keyof DriverFormErrors] }));
    setApiError(null);
  };

  const blur = (field: keyof DriverFormData) => {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors((p) => ({ ...p, [field]: validateDriver(form)[field as keyof DriverFormErrors] }));
  };

  const handleSubmit = async () => {
    setTouched(Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {} as any));
    const errs = validateDriver(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setApiError(null);

    try {
      const areas = form.assignedAreas
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: any = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        vehicleType: form.vehicleType as VehicleType,
        vehiclePlate: form.vehiclePlate.trim(),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
        ...(areas.length ? { assignedAreas: areas } : {}),
      };

      // لو فيه برنش معروف، ابعته. لو مفيش، كمّل من غيره.
      if (resolvedBranchId) payload.branchId = resolvedBranchId;

      await createDriverFn(payload as CreateDriverDTO);
      invalidateQuery("drivers");
      onClose();
    } catch (err: any) {
      const data = err?.response?.data ?? err?.data ?? err;
      const list = data?.errors;
      if (Array.isArray(list) && list.length) {
        const fe: DriverFormErrors = {};
        let gen: string | null = null;
        list.forEach((e: any) => {
          const k = e.field as keyof DriverFormErrors;
          if (k && !fe[k]) fe[k] = e.msg;
          else if (!gen) gen = e.msg;
        });
        setErrors((p) => ({ ...p, ...fe }));
        setTouched((p) => ({ ...p, ...Object.keys(fe).reduce((a, k) => ({ ...a, [k]: true }), {}) }));
        setApiError(gen);
      } else {
        setApiError(data?.message ?? err?.message ?? "Failed to add driver.");
      }
    } finally {
      setLoading(false);
    }
  };

  const errCount = Object.values(errors).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">🧑‍✈️</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Add New Driver</h2>
              <p className="text-xs text-gray-500">Register a new delivery partner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {errCount > 0 && Object.keys(touched).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-red-500">⚠</span>
              <p className="text-sm text-red-700 font-medium">
                {errCount} field{errCount > 1 ? "s" : ""} need attention
              </p>
            </div>
          )}

          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <p className="text-sm text-red-600 flex-1">{apiError}</p>
              <button onClick={() => setApiError(null)} className="text-red-300 hover:text-red-500">
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Driver Name"
              value={form.name}
              placeholder="Ahmed Ali"
              error={errors.name}
              onChange={(v) => setField("name", v)}
              onBlur={() => blur("name")}
            />
            <FormField
              label="Phone Number"
              value={form.phone}
              placeholder="01xxxxxxxxx"
              type="tel"
              error={errors.phone}
              onChange={(v) => setField("phone", v)}
              onBlur={() => blur("phone")}
            />
          </div>

          <FormField
            label="Email"
            value={form.email}
            placeholder="ahmed@example.com"
            type="email"
            optional
            error={errors.email}
            onChange={(v) => setField("email", v)}
            onBlur={() => blur("email")}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle Type</label>
            <div className="grid grid-cols-3 gap-2">
              {VEHICLE_TYPES.map((vt) => (
                <button
                  key={vt.value}
                  type="button"
                  onClick={() => {
                    setField("vehicleType", vt.value);
                    blur("vehicleType");
                  }}
                  className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                    form.vehicleType === vt.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : errors.vehicleType
                        ? "border-red-300 bg-white text-gray-600"
                        : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {vt.label}
                </button>
              ))}
            </div>
            {errors.vehicleType && <p className="text-xs text-red-500 mt-1">{errors.vehicleType}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Vehicle Plate"
              value={form.vehiclePlate}
              placeholder="ABC-123"
              error={errors.vehiclePlate}
              onChange={(v) => setField("vehiclePlate", v)}
              onBlur={() => blur("vehiclePlate")}
            />
            <FormField
              label="Assigned Areas"
              value={form.assignedAreas}
              placeholder="Gehan, Dokki"
              optional
              onChange={(v) => setField("assignedAreas", v)}
            />
          </div>

          <p className="text-xs text-gray-400 -mt-2">Separate areas with commas</p>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
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

// ─── Edit Driver Modal ─────────────────────────────────────────────────────────
function EditDriverModal({ driver, onClose }: { driver: Driver; onClose: () => void }) {
  const [form, setForm] = useState<DriverFormData>({
    name: driver.name ?? "",
    phone: driver.phone ?? "",
    email: driver.email ?? "",
    vehicleType: driver.vehicleType ?? "",
    vehiclePlate: driver.vehiclePlate ?? "",
    assignedAreas: (driver.assignedAreas ?? []).join(", "),
  });
  const [errors, setErrors] = useState<DriverFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof DriverFormData, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const driverId = (driver.id ?? "") as string;

  const setField = (field: keyof DriverFormData, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) setErrors((p) => ({ ...p, [field]: validateDriver(next)[field as keyof DriverFormErrors] }));
    setApiError(null);
  };

  const blur = (field: keyof DriverFormData) => {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors((p) => ({ ...p, [field]: validateDriver(form)[field as keyof DriverFormErrors] }));
  };

  const handleSave = async () => {
    setTouched(Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {} as any));
    const errs = validateDriver(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setApiError(null);
    try {
      const areas = form.assignedAreas.split(",").map((s) => s.trim()).filter(Boolean);
      await updateDriverFn(driverId, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        vehicleType: form.vehicleType as VehicleType,
        vehiclePlate: form.vehiclePlate.trim(),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
        ...(areas.length ? { assignedAreas: areas } : {}),
      } as UpdateDriverDTO);
      invalidateQuery("drivers");
      onClose();
    } catch (err: any) {
      const data = err?.response?.data ?? err?.data ?? err;
      setApiError(data?.message ?? err?.message ?? "Failed to update driver.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">✏️</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Edit Driver</h2>
              <p className="text-xs text-gray-500">{driver.name}{driver.branch ? ` · ${driver.branch}` : ""}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total", value: driver.totalDeliveries ?? 0 },
              { label: "Done", value: driver.successfulDeliveries ?? 0 },
              { label: "Failed", value: driver.failedDeliveries ?? 0 },
              { label: "Rating", value: `${driver.rating ?? 0}⭐` },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <p className="text-sm text-red-600 flex-1">{apiError}</p>
              <button onClick={() => setApiError(null)} className="text-red-300 hover:text-red-500">
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Driver Name"
              value={form.name}
              placeholder="Ahmed Ali"
              error={errors.name}
              onChange={(v) => setField("name", v)}
              onBlur={() => blur("name")}
            />
            <FormField
              label="Phone Number"
              value={form.phone}
              placeholder="01xxxxxxxxx"
              type="tel"
              error={errors.phone}
              onChange={(v) => setField("phone", v)}
              onBlur={() => blur("phone")}
            />
          </div>

          <FormField
            label="Email"
            value={form.email}
            placeholder="ahmed@example.com"
            type="email"
            optional
            error={errors.email}
            onChange={(v) => setField("email", v)}
            onBlur={() => blur("email")}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle Type</label>
            <div className="grid grid-cols-3 gap-2">
              {VEHICLE_TYPES.map((vt) => (
                <button
                  key={vt.value}
                  type="button"
                  onClick={() => {
                    setField("vehicleType", vt.value);
                    blur("vehicleType");
                  }}
                  className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                    form.vehicleType === vt.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : errors.vehicleType
                        ? "border-red-300 bg-white text-gray-600"
                        : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {vt.label}
                </button>
              ))}
            </div>
            {errors.vehicleType && <p className="text-xs text-red-500 mt-1">{errors.vehicleType}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Vehicle Plate"
              value={form.vehiclePlate}
              placeholder="ABC-123"
              error={errors.vehiclePlate}
              onChange={(v) => setField("vehiclePlate", v)}
              onBlur={() => blur("vehiclePlate")}
            />
            <FormField
              label="Assigned Areas"
              value={form.assignedAreas}
              placeholder="Gehan, Dokki"
              optional
              onChange={(v) => setField("assignedAreas", v)}
            />
          </div>

          {driver.todayStats && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
              <span>📅</span> Today: <strong>{driver.todayStats.assigned ?? 0}</strong> assigned ·{" "}
              <strong>{driver.todayStats.delivered ?? 0}</strong> delivered
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
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

// ─── Assign Driver Modal ───────────────────────────────────────────────────────
interface AssignDriverErrors {
  driverId?: string;
  deliveryFee?: string;
  commission?: string;
  address?: string;
  phone?: string;
}

function validateAssign(driverId: string, deliveryFee: string, commission: string, address: string, phone: string): AssignDriverErrors {
  const e: AssignDriverErrors = {};
  if (!driverId) e.driverId = "Please select a driver";
  if (!deliveryFee || isNaN(Number(deliveryFee))) e.deliveryFee = "Enter a valid delivery fee";
  else if (Number(deliveryFee) < 0) e.deliveryFee = "Fee cannot be negative";
  if (commission && isNaN(Number(commission))) e.commission = "Enter a valid commission";
  if (!address.trim()) e.address = "Delivery address is required";
  else if (address.trim().length < 5) e.address = "Address is too short";
  if (!phone.trim()) e.phone = "Customer phone is required";
  else if (!/^[0-9+\-\s()]{7,15}$/.test(phone.trim())) e.phone = "Enter a valid phone number";
  return e;
}

function AssignDriverModal({
  order,
  drivers,
  branchId,
  onClose,
}: {
  order: Order;
  drivers: Driver[];
  branchId: string;
  onClose: () => void;
}) {
  const [driverId, setDriverId] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("25");
  const [commission, setCommission] = useState("5");
  const [address, setAddress] = useState((order as any).customerLocation?.address ?? (order as any).deliveryAddress ?? "");
  const [phone, setPhone] = useState((order as any).customer?.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<AssignDriverErrors>({});

  const orderId = (order.id ?? order._id ?? "") as string;
  const orderNumber = (order as any).orderNumber ?? orderId.slice(-6);
  const availableDrivers = drivers.filter((d) => d.status === "present" || d.status === "busy");

  const handleAssign = async () => {
    const errs = validateAssign(driverId, deliveryFee, commission, address, phone);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setApiError(null);
    try {
      await createDispatchFn({
        orderId,
        driverId,
        branchId,
        deliveryFee: Number(deliveryFee),
        commission: Number(commission) || 0,
        cashCollected: (order as any).total ?? 0,
        customerLocation: { address: address.trim(), coordinates: [31.2357, 30.0444] },
      } as CreateDispatchDTO);
      invalidateQuery("dispatches");
      invalidateQuery("orders");
      onClose();
    } catch (err: any) {
      const data = err?.response?.data ?? err?.data ?? err;
      setApiError(Array.isArray(data?.errors) ? data.errors.map((e: any) => e.msg).join(" · ") : data?.message ?? err?.message ?? "Failed to assign driver.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-500 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">🛵</div>
              <div>
                <h2 className="text-lg font-bold text-white">Assign Driver</h2>
                <p className="text-blue-100 text-sm">Order #{orderNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition text-sm"
            >
              ✕
            </button>
          </div>
          {/* Order pills */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
              💰 ${(order as any).total?.toFixed(2) ?? "—"}
            </span>
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
              📦 {(order.items ?? []).length} items
            </span>
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
              🕐 {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
              <span className="text-red-500 shrink-0">⚠</span>
              <p className="text-sm text-red-600 flex-1">{apiError}</p>
              <button onClick={() => setApiError(null)} className="text-red-300 hover:text-red-500 shrink-0">
                ✕
              </button>
            </div>
          )}

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Delivery Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Gehan street villa 7, Mansoura"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setErrors((p) => ({ ...p, address: undefined }));
              }}
              className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:bg-white transition ${
                errors.address ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
              }`}
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Customer Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="01xxxxxxxxx"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors((p) => ({ ...p, phone: undefined }));
              }}
              className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:bg-white transition ${
                errors.phone ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Driver card picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Driver <span className="text-red-500">*</span>
            </label>
            {availableDrivers.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                <span>⚠️</span> No available drivers. Change a driver's status first.
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {availableDrivers.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setDriverId(d.id ?? "");
                      setErrors((p) => ({ ...p, driverId: undefined }));
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition ${
                      driverId === d.id
                        ? "border-blue-500 bg-blue-50"
                        : errors.driverId
                          ? "border-red-300 bg-white hover:border-blue-300"
                          : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                        driverId === d.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.vehicleType === "scooter" ? "🛵" : d.vehicleType === "car" ? "🚗" : "🚲"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${driverId === d.id ? "text-blue-700" : "text-gray-800"}`}>
                        {d.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {d.vehiclePlate ?? ""} ·{" "}
                        <span className={d.status === "present" ? "text-green-600" : "text-blue-600"}>{d.status}</span>
                      </p>
                    </div>
                    {driverId === d.id && <span className="text-blue-500 text-lg shrink-0">✓</span>}
                  </button>
                ))}
              </div>
            )}
            {errors.driverId && <p className="text-xs text-red-500 mt-1">{errors.driverId}</p>}
          </div>

          {/* Fee + Commission */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Fee</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={deliveryFee}
                  onChange={(e) => {
                    setDeliveryFee(e.target.value);
                    setErrors((p) => ({ ...p, deliveryFee: undefined }));
                  }}
                  className={`w-full bg-gray-50 border rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:bg-white transition ${
                    errors.deliveryFee ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.deliveryFee && <p className="text-xs text-red-500 mt-1">{errors.deliveryFee}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Commission</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={commission}
                  onChange={(e) => {
                    setCommission(e.target.value);
                    setErrors((p) => ({ ...p, commission: undefined }));
                  }}
                  className={`w-full bg-gray-50 border rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:bg-white transition ${
                    errors.commission ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.commission && <p className="text-xs text-red-500 mt-1">{errors.commission}</p>}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || availableDrivers.length === 0}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <span>🛵</span>
            )}
            {loading ? "Assigning..." : "Assign Driver"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Order Modal ──────────────────────────────────────────────────────────
interface EditItem {
  name: string;
  quantity: number;
  price: number;
  note: string;
}

function EditOrderModal({ dispatch, onClose }: { dispatch: Dispatch; onClose: () => void }) {
  const [phone, setPhone] = useState((dispatch as any).customer?.phone ?? "");
  const [address, setAddress] = useState((dispatch as any).deliveryAddress ?? "");
  const [notes, setNotes] = useState((dispatch as any).notes ?? "");
  const [items] = useState<EditItem[]>([
    { name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
    { name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
    { name: "Classic Cheeseburger", quantity: 2, price: 24, note: "" },
  ]);
  const [phoneErr, setPhoneErr] = useState("");
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = 12.5;
  const deliveryFee = 7.5;
  const total = subtotal + tax + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Delivery Order</h2>
            <p className="text-xs text-gray-500">Order #{(dispatch as any).orderNumber ?? dispatch._id?.slice(-6)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer Number</label>
              <input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneErr("");
                }}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition ${
                  phoneErr ? "border-red-400" : "border-gray-200"
                }`}
              />
              {phoneErr && <p className="text-xs text-red-500 mt-1">{phoneErr}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. No onions please"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none transition"
            />
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-700 shrink-0">
                  {item.quantity}
                </span>
                <span className="text-sm font-medium text-gray-800 flex-1">{item.name}</span>
                <span className="text-sm font-bold text-gray-800">${item.price}</span>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
            {(
              [
                ["Subtotal", subtotal],
                ["Tax", tax],
                ["Delivery Fee", deliveryFee],
              ] as [string, number][]
            ).map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm text-gray-600">
                <span>{l}</span>
                <span className="font-semibold">${v.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!phone.trim()) {
                setPhoneErr("Phone is required");
                return;
              }
              if (!PHONE_RE.test(phone.trim())) {
                setPhoneErr("Invalid phone number");
                return;
              }
              setPhoneErr("");
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DispatchManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const branchId = useBranchId();

  const [search, setSearch] = useState("");
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState<Dispatch | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const {
    data: dispatchData,
    isLoading: dispatchLoading,
    isError: dispatchError,
    error: dispatchRawError,
    refetch: refetchDispatches,
  } = useDispatches({ sort: "-assignedAt", limit: 10, page });
  const { data: activeData } = useActiveDispatches({ branchId: branchId ?? "" });
  const { data: recentData } = useRecentActivity({ branchId: branchId ?? "" });
  const { data: driversData, isLoading: driversLoading } = useDrivers({ sort: "-createdAt", limit: 20 });
  const { data: pendingOrdersData } = useOrders({ status: "pending", limit: 50 });

  const dispatches: Dispatch[] = dispatchData?.data ?? [];
  const drivers: Driver[] = driversData?.data ?? [];
  const recentActivity: any[] = recentData?.data ?? [];
  const pendingOrders: Order[] = (pendingOrdersData?.data ?? []).filter(
    (o) => (o.orderType ?? "").toLowerCase() === "delivery"
  );

  const totalPages = dispatchData?.paginationResult?.totalPages ?? 1;
  const totalDocs = dispatchData?.paginationResult?.totalDocs ?? 0;
  const activeCount = (activeData?.data ?? []).length;

  // ✅ لما يجي navigate من OrderDetailsPage بـ ?assignOrderId=xxx افتح المودال أوتوماتيك
  useEffect(() => {
    const assignOrderId = searchParams.get("assignOrderId");
    if (!assignOrderId || assigningOrder) return;
    const found = pendingOrders.find((o) => (o.id ?? o._id) === assignOrderId);
    if (found) {
      setAssigningOrder(found);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, pendingOrders, assigningOrder, setSearchParams]);

  const filtered = dispatches.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (d.orderNumber ?? "").toLowerCase().includes(q) ||
      (d.driverName ?? "").toLowerCase().includes(q) ||
      (d.branch ?? "").toLowerCase().includes(q) ||
      (d.customerLocation?.address ?? "").toLowerCase().includes(q)
    );
  });

  const handleStatusChange = useCallback(async (dispatchId: string, newStatus: string) => {
    setStatusUpdating(dispatchId);
    try {
      await updateDispatchStatusFn(dispatchId, { status: newStatus });
      invalidateQuery("dispatches");
    } catch (err: any) {
      alert(`Error: ${err?.response?.data?.message ?? "Failed to update status."}`);
    } finally {
      setStatusUpdating(null);
    }
  }, []);

  const handleDeleteDriver = useCallback(async (driverId: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;
    setDeletingId(driverId);
    try {
      await deleteDriverFn(driverId);
      invalidateQuery("drivers");
    } catch {
      alert("Failed to delete driver.");
    } finally {
      setDeletingId(null);
    }
  }, []);

  const dispatchId = (d: Dispatch) => (d.id ?? d._id ?? "") as string;
  const deliveredCount = dispatches.filter((d) => d.status === "delivered").length;
  const outCount = dispatches.filter((d) => d.status === "out-for-delivery").length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Modals */}
      {showAddDriver && <AddDriverModal onClose={() => setShowAddDriver(false)} />}
      {editingDispatch && <EditOrderModal dispatch={editingDispatch} onClose={() => setEditingDispatch(null)} />}
      {editingDriver && <EditDriverModal driver={editingDriver} onClose={() => setEditingDriver(null)} />}
      {assigningOrder && branchId && (
        <AssignDriverModal
          order={assigningOrder}
          drivers={drivers}
          branchId={branchId}
          onClose={() => setAssigningOrder(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-blue-600">Dispatch Management</h1>
          <p className="text-sm text-gray-500">Mansoura Branch</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, driver, area..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => navigate("/dashboard/dispatch/rider-shift")}
            className="bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition whitespace-nowrap"
          >
            Rider Shift
          </button>
          <button
            onClick={() => navigate("/dashboard/dispatch/new-order")}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition whitespace-nowrap"
          >
            + New Order
          </button>
          <button
            onClick={() => setShowAddDriver(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition whitespace-nowrap"
          >
            + Add Driver
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: String(totalDocs), sub: "+12% vs last month", subColor: "text-green-600" },
            { label: "Active Orders", value: String(activeCount), bar: { filled: activeCount, total: Math.max(totalDocs, 1), color: "bg-blue-500" } },
            { label: "Out for Delivery", value: `${outCount} / ${activeCount}`, bar: { filled: outCount, total: Math.max(activeCount, 1), color: "bg-orange-500" } },
            { label: "Delivered", value: String(deliveredCount), bar: { filled: deliveredCount, total: Math.max(totalDocs, 1), color: "bg-green-500" } },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              {"sub" in stat && stat.sub && <p className={`text-xs mt-1 font-medium ${stat.subColor}`}>{stat.sub}</p>}
              {"bar" in stat && stat.bar && (
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stat.bar.color} rounded-full transition-all`}
                    style={{ width: `${Math.min(100, (stat.bar.filled / stat.bar.total) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dispatches Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Active Dispatches</h2>
            {pendingOrders.length > 0 && (
              <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {pendingOrders.length} awaiting assignment
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["ORDER ID", "BRANCH", "AREA", "TIME", "COLLECTED", "DELIVERY FEE", "RIDER", "STATUS", "ACTIONS"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dispatchLoading && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                      <svg className="animate-spin w-5 h-5 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Loading dispatches...
                    </td>
                  </tr>
                )}
                {dispatchError && !dispatchLoading && (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <p className="text-red-500 text-sm mb-2">
                        Failed to load.
                        {(dispatchRawError as any)?.response?.data?.message
                          ? ` — ${(dispatchRawError as any).response.data.message}`
                          : ""}
                      </p>
                      <button
                        onClick={() => refetchDispatches()}
                        className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                )}
                {!dispatchLoading && !dispatchError && filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                      No dispatches found.
                    </td>
                  </tr>
                )}
                {!dispatchLoading && !dispatchError && filtered.map((dispatch) => {
                  const id = dispatchId(dispatch);
                  const status = dispatch.status ?? "assigned";
                  const isUpdating = statusUpdating === id;
                  const orderNumber = dispatch.orderNumber ?? `#${id.slice(-6)}`;
                  const area = dispatch.customerLocation?.address ?? "—";
                  const assignedAt = dispatch.assignedAt
                    ? new Date(dispatch.assignedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "—";
                  const cashCollected = dispatch.cashCollected != null ? `$${dispatch.cashCollected.toFixed(2)}` : "—";
                  const deliveryFee = dispatch.deliveryFee != null ? `$${dispatch.deliveryFee.toFixed(2)}` : "—";
                  const rider =
                    dispatch.driverName ??
                    (dispatch.driverId ? `Driver #${dispatch.driverId.slice(-4)}` : "Unassigned");

                  return (
                    <tr key={id} className="border-b border-gray-50 hover:bg-gray-50/70 transition">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-gray-800 text-xs">{orderNumber}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-xs">{dispatch.branch ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate text-xs" title={area}>
                        {area}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{assignedAt}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 text-xs">{cashCollected}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{deliveryFee}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{rider}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            statusColors[status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {status.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() => navigate(`/dashboard/dispatch/order/${id}`)}
                            title="View"
                            className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {status === "assigned" && (
                            <button
                              onClick={() => handleStatusChange(id, "picked-up")}
                              disabled={isUpdating}
                              className="px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold hover:bg-purple-200 transition disabled:opacity-50 whitespace-nowrap"
                            >
                              {isUpdating ? "..." : "📦 Pick Up"}
                            </button>
                          )}
                          {status === "picked-up" && (
                            <button
                              onClick={() => handleStatusChange(id, "out-for-delivery")}
                              disabled={isUpdating}
                              className="px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700 text-xs font-semibold hover:bg-yellow-200 transition disabled:opacity-50 whitespace-nowrap"
                            >
                              {isUpdating ? "..." : "🛵 Out"}
                            </button>
                          )}
                          {status === "out-for-delivery" && (
                            <>
                              <button
                                onClick={() => navigate(`/dashboard/dispatch/order/${id}`)}
                                className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition whitespace-nowrap"
                              >
                                ✓ Deliver
                              </button>
                              <button
                                onClick={() => navigate(`/dashboard/dispatch/order/${id}`)}
                                className="px-2 py-1 rounded-lg bg-red-100 text-red-600 text-xs font-semibold hover:bg-red-200 transition whitespace-nowrap"
                              >
                                ✗ Fail
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Showing <strong>{filtered.length}</strong> of <strong>{totalDocs}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                    page === p ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-7 h-7 rounded-lg text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Drivers + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Drivers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["DRIVER", "VEHICLE", "AREAS", "STATUS", "DELIVERIES", "BRANCH", "ACTION"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {driversLoading && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                        Loading drivers...
                      </td>
                    </tr>
                  )}
                  {!driversLoading && drivers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                        No drivers found.
                      </td>
                    </tr>
                  )}
                  {drivers.map((driver) => {
                    const dId = driver.id ?? "";
                    const isDeleting = deletingId === dId;
                    const statusKey = driver.status ?? "offline";
                    return (
                      <tr key={dId} className="border-b border-gray-50 hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-sm">{driver.name ?? "—"}</p>
                          <p className="text-xs text-gray-400">{driver.phone ?? ""}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 capitalize">{driver.vehicleType ?? "—"}</p>
                          <p className="text-xs text-gray-400">{driver.vehiclePlate ?? ""}</p>
                        </td>
                        <td className="px-4 py-3 max-w-[130px]">
                          <p className="text-xs text-gray-500 truncate" title={(driver.assignedAreas ?? []).join(", ")}>
                            {(driver.assignedAreas ?? []).join(", ") || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                              driverStatusColors[statusKey] ?? "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {statusKey}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 font-medium">{(driver.totalDeliveries ?? 0).toLocaleString()}</p>
                          <p className="text-xs text-gray-400">⭐ {driver.rating ?? 0} · Today: {driver.todayStats?.delivered ?? 0}✓</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{driver.branch ?? "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDeleteDriver(dId)}
                              disabled={isDeleting}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                            >
                              {isDeleting ? (
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => setEditingDriver(driver)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">⚡</div>
              <h3 className="font-bold text-gray-800">Recent Activity</h3>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 6).map((item: any, i: number) => {
                  const status = item.status ?? "assigned";
                  const dotColor =
                    status === "delivered"
                      ? "bg-green-500"
                      : status === "out-for-delivery"
                        ? "bg-blue-500"
                        : status === "failed"
                          ? "bg-red-500"
                          : "bg-orange-500";
                  const textColor =
                    status === "delivered"
                      ? "text-green-600"
                      : status === "out-for-delivery"
                        ? "text-blue-600"
                        : status === "failed"
                          ? "text-red-600"
                          : "text-orange-600";
                  const label = item.orderNumber ?? `#${(item.id ?? item._id ?? "").slice(-6)}`;
                  const statusText = status.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
                  const timestamp = item.assignedAt ?? item.createdAt;
                  const timeLabel = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${textColor}`}>
                          {label} · {statusText}
                        </p>
                        <p className="text-xs text-gray-400">
                          {timeLabel}
                          {item.driverName ? ` · ${item.driverName}` : ""}
                          {item.branch ? ` · ${item.branch}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button className="w-full mt-4 border border-gray-200 text-gray-500 text-xs font-semibold py-2 rounded-xl hover:bg-gray-50 transition">
              VIEW FULL AUDIT LOG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}