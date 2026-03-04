// src/components/Inventory/page/RestockModal.tsx
import { useState, type FormEvent } from "react";
import { useOutletContext } from "react-router-dom";
import { useInventory, restockInventoryFn, createInventoryFn } from "../hook/useInventory";
import { useSuppliers } from "../../Supplier/hook/useSuppliers";
import { invalidateQuery } from "../../../hook/queryClient";
import api from "../../../lib/axios";
import type { ApiBranch } from "../../layout/Topbar";

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
  /** Optional branchId override — if not passed, read from outlet context */
  branchId?: string;
};

type Tab = "restock" | "add";

// ── Valid units accepted by the API ──────────────────────────────────────────
const VALID_UNITS = ["kg", "g", "L", "ml", "pcs", "box", "dozen", "lb", "oz", "cup", "tsp", "tbsp"];

/* ─── Restock form ─── */
type RestockForm = {
  inventoryId: string;
  quantity: string;
  supplierId: string;
  expiryDate: string;
  price: string;
};
type RestockErrors = Partial<Record<keyof RestockForm, string>>;

function validateRestock(f: RestockForm): RestockErrors {
  const e: RestockErrors = {};
  if (!f.inventoryId) e.inventoryId = "Please select an item.";
  const qty = parseFloat(f.quantity);
  if (!f.quantity || isNaN(qty) || qty <= 0)
    e.quantity = "Quantity must be a positive number.";
  if (f.price) {
    const p = parseFloat(f.price);
    if (isNaN(p) || p < 0) e.price = "Enter a valid positive price.";
  }
  if (f.expiryDate) {
    const d = new Date(f.expiryDate);
    if (isNaN(d.getTime()))  e.expiryDate = "Enter a valid date.";
    else if (d < new Date()) e.expiryDate = "Expiry date must be in the future.";
  }
  return e;
}

/* ─── Add New Item form ─── */
type AddForm = {
  itemId: string;
  unit: string;
  currentQuantity: string;
  targetQuantity: string;
  supplierId: string;
  lastPrice: string;
  expiryDate: string;
};
type AddErrors = Partial<Record<keyof AddForm, string>>;

function validateAdd(f: AddForm): AddErrors {
  const e: AddErrors = {};
  if (!f.itemId) e.itemId = "Please select a menu item.";
  if (!f.unit)   e.unit   = "Please select a unit.";
  const cur = parseFloat(f.currentQuantity);
  if (!f.currentQuantity || isNaN(cur) || cur < 0)
    e.currentQuantity = "Enter a valid current quantity (0 or more).";
  const tgt = parseFloat(f.targetQuantity);
  if (!f.targetQuantity || isNaN(tgt) || tgt <= 0)
    e.targetQuantity = "Target quantity must be a positive number.";
  if (!isNaN(cur) && !isNaN(tgt) && cur > tgt)
    e.currentQuantity = "Current quantity cannot exceed target quantity.";
  if (f.lastPrice) {
    const p = parseFloat(f.lastPrice);
    if (isNaN(p) || p < 0) e.lastPrice = "Enter a valid positive price.";
  }
  if (f.expiryDate) {
    const d = new Date(f.expiryDate);
    if (isNaN(d.getTime()))  e.expiryDate = "Enter a valid date.";
    else if (d < new Date()) e.expiryDate = "Expiry date must be in the future.";
  }
  return e;
}

// Parse server errors array → field map
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseServerErrors(err: any): { fieldErrors: Record<string, string>; general: string | null } {
  const errors = err?.response?.data?.errors;
  if (Array.isArray(errors)) {
    const fieldErrors: Record<string, string> = {};
    errors.forEach((e: { path?: string; msg?: string }) => {
      if (e.path && e.msg) fieldErrors[e.path] = e.msg;
    });
    return { fieldErrors, general: null };
  }
  const msg =
    err?.response?.data?.message ??
    err?.message ??
    "Something went wrong. Please try again.";
  return { fieldErrors: {}, general: msg };
}

/* ─── Shared helpers ─── */
const fc = (err?: string) =>
  `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
    err
      ? "border-red-400 focus:ring-red-400 bg-red-50"
      : "border-slate-200 focus:ring-blue-500 bg-white"
  }`;

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ── Hook: fetch menu items for itemId dropdown ────────────────────────────────
function useMenuItems() {
  const [items, setItems]   = useState<{ id: string; name: string; category: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);

  if (!fetched) {
    setFetched(true);
    api
      .get("/items", { params: { limit: 200 } })
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any[] = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        setItems(
          data.map((i) => ({
            id:       i.id ?? i._id,
            name:     i.name ?? i.itemId ?? i.id,
            category: i.category ?? "",
          }))
        );
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  return { items, loading };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function RestockModal({ onClose, onSuccess, branchId: branchIdProp }: Props) {
  const [tab, setTab] = useState<Tab>("restock");

  // ── Resolve branchId — same pattern as AddMenuItemModal ──────────────────
  const outlet = useOutletContext<{ activeBranch?: ApiBranch | null } | undefined>();
  const activeBranch = outlet?.activeBranch ?? null;
  const branchId =
    branchIdProp ??
    activeBranch?.id ??
    activeBranch?._id ??
    (activeBranch?.branchId != null ? String(activeBranch.branchId) : undefined);

  // ── Shared data fetches ───────────────────────────────────────────────────
  const { data: invData, isLoading: loadingInv } = useInventory({ limit: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inventoryItems: any[] = invData?.data ?? [];

  const { items: menuItems, loading: loadingMenu } = useMenuItems();

  const { data: supData, isLoading: loadingSup } = useSuppliers({ limit: 100 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const suppliers: any[] = supData?.data ?? [];

  /* ─────────────────────── RESTOCK TAB ─────────────────────── */
  const [rf, setRf]       = useState<RestockForm>({ inventoryId: "", quantity: "", supplierId: "", expiryDate: "", price: "" });
  const [re, setRe]       = useState<RestockErrors>({});
  const [rSub, setRSub]   = useState(false);
  const [rErr, setRErr]   = useState<string | null>(null);

  const setR = (k: keyof RestockForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setRf((p) => ({ ...p, [k]: e.target.value }));
      setRe((p) => ({ ...p, [k]: undefined }));
    };

  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id  = e.target.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inv = inventoryItems.find((i: any) => i.id === id);
    setRf((p) => ({
      ...p,
      inventoryId: id,
      price:       inv?.pricing?.lastPrice != null ? String(inv.pricing.lastPrice) : p.price,
      supplierId:  inv?.supplier?.id ?? p.supplierId,
    }));
    setRe((p) => ({ ...p, inventoryId: undefined }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selInv  = inventoryItems.find((i: any) => i.id === rf.inventoryId);
  const selUnit = selInv?.stock?.unit ?? selInv?.unit ?? "";

  const handleRestock = async (e: FormEvent) => {
    e.preventDefault();
    setRErr(null);
    const errs = validateRestock(rf);
    if (Object.keys(errs).length) { setRe(errs); return; }

    setRSub(true);
    try {
      await restockInventoryFn(rf.inventoryId, {
        quantity:   parseFloat(rf.quantity),
        supplier:   rf.supplierId  || undefined,
        price:      rf.price       ? parseFloat(rf.price) : undefined,
        expiryDate: rf.expiryDate  || null,
      });
      invalidateQuery("inventory");
      onSuccess?.();
    } catch (err: unknown) {
      const { general } = parseServerErrors(err);
      setRErr(general ?? "Something went wrong.");
    } finally {
      setRSub(false);
    }
  };

  /* ─────────────────────── ADD NEW ITEM TAB ─────────────────────── */
  const [af, setAf]       = useState<AddForm>({ itemId: "", unit: "", currentQuantity: "", targetQuantity: "", supplierId: "", lastPrice: "", expiryDate: "" });
  const [ae, setAe]       = useState<AddErrors>({});
  const [aSub, setASub]   = useState(false);
  const [aErr, setAErr]   = useState<string | null>(null);

  const setA = (k: keyof AddForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setAf((p) => ({ ...p, [k]: e.target.value }));
      setAe((p) => ({ ...p, [k]: undefined }));
    };

  const selMenuItem = menuItems.find((m) => m.id === af.itemId);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setAErr(null);

    // Branch required for general manager
    if (!branchId) {
      setAErr("Please select a branch before adding an item.");
      return;
    }

    const errs = validateAdd(af);
    if (Object.keys(errs).length) { setAe(errs); return; }

    setASub(true);
    try {
      await createInventoryFn({
        itemId:          af.itemId,
        unit:            af.unit,
        currentQuantity: parseFloat(af.currentQuantity),
        targetQuantity:  parseFloat(af.targetQuantity),
        supplier:        af.supplierId || undefined,
        lastPrice:       af.lastPrice  ? parseFloat(af.lastPrice) : undefined,
        expiryDate:      af.expiryDate || null,
        branchId,                        // ← required by API for general manager
      });
      invalidateQuery("inventory");
      onSuccess?.();
    } catch (err: unknown) {
      const { fieldErrors, general } = parseServerErrors(err);
      if (Object.keys(fieldErrors).length) {
        setAe((prev) => ({ ...prev, ...fieldErrors }));
      } else {
        setAErr(general);
      }
    } finally {
      setASub(false);
    }
  };

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-5 sm:p-6 font-sans max-h-[90vh] overflow-y-auto">

        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Stock Management</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-4">Restock existing items or add a new item to inventory</p>

        {/* Branch warning */}
        {!branchId && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700 flex items-center gap-2">
            <span>⚠</span>
            <span>No branch selected. Please select a branch from the top bar first.</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
          {(["restock", "add"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "restock" ? "🔄 Restock Item" : "➕ Add New Item"}
            </button>
          ))}
        </div>

        {/* ══════════════ RESTOCK TAB ══════════════ */}
        {tab === "restock" && (
          <form onSubmit={handleRestock} noValidate>
            {rErr && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {rErr}
              </div>
            )}
            <div className="space-y-4">

              {/* Select existing inventory item */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Select Item<span className="text-red-500">*</span>
                </label>
                <select
                  value={rf.inventoryId}
                  onChange={handleItemChange}
                  disabled={loadingInv}
                  className={fc(re.inventoryId) + " text-slate-600 appearance-none"}
                >
                  <option value="">{loadingInv ? "Loading items…" : "Choose an item…"}</option>
                  {inventoryItems.map((inv) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const s = (inv as any).stock ?? {};
                    const name = inv.item?.name ?? inv.id;
                    return (
                      <option key={inv.id} value={inv.id}>
                        {name} — {s.current ?? inv.currentQuantity ?? 0} {s.unit ?? inv.unit ?? ""} left
                      </option>
                    );
                  })}
                </select>
                {re.inventoryId && <p className="mt-1 text-xs text-red-500">{re.inventoryId}</p>}
                {selInv?.pricing?.lastPrice != null && (
                  <p className="text-xs text-slate-400 mt-1">
                    Last price: ${selInv.pricing.lastPrice} / {selUnit}
                  </p>
                )}
              </div>

              {/* Quantity + Unit readonly */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Quantity to Add<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" min="0" step="0.01"
                    value={rf.quantity} onChange={setR("quantity")} placeholder="0.00"
                    className={fc(re.quantity)}
                  />
                  {re.quantity && <p className="mt-1 text-xs text-red-500">{re.quantity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
                  <input
                    type="text" readOnly
                    value={selUnit || ""}
                    placeholder="Select item first"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 text-slate-500"
                  />
                </div>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Supplier</label>
                <select
                  value={rf.supplierId} onChange={setR("supplierId")} disabled={loadingSup}
                  className={fc() + " text-slate-600 appearance-none"}
                >
                  <option value="">{loadingSup ? "Loading…" : "Select a supplier"}</option>
                  {suppliers.map((s) => (
                    <option key={s.id ?? s._id} value={s.id ?? s._id}>{s.companyName}</option>
                  ))}
                </select>
              </div>

              {/* Unit Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={rf.price} onChange={setR("price")} placeholder="0.00"
                    className={fc(re.price) + " pl-7"}
                  />
                </div>
                {re.price && <p className="mt-1 text-xs text-red-500">{re.price}</p>}
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Expiry Date</label>
                <input
                  type="date" value={rf.expiryDate} onChange={setR("expiryDate")}
                  min={new Date().toISOString().split("T")[0]}
                  className={fc(re.expiryDate)}
                />
                {re.expiryDate && <p className="mt-1 text-xs text-red-500">{re.expiryDate}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button type="button" onClick={onClose} disabled={rSub}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={rSub}
                className="px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 flex items-center gap-2">
                {rSub && <Spinner />}
                {rSub ? "Adding…" : "Add To Inventory"}
              </button>
            </div>
          </form>
        )}

        {/* ══════════════ ADD NEW ITEM TAB ══════════════ */}
        {tab === "add" && (
          <form onSubmit={handleAdd} noValidate>
            {aErr && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {aErr}
              </div>
            )}
            <div className="space-y-4">

              {/* Menu Item dropdown — real ObjectId */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Menu Item<span className="text-red-500">*</span>
                </label>
                <select
                  value={af.itemId} onChange={setA("itemId")} disabled={loadingMenu}
                  className={fc(ae.itemId) + " text-slate-600 appearance-none"}
                >
                  <option value="">{loadingMenu ? "Loading menu items…" : "Select a menu item…"}</option>
                  {menuItems.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}{m.category ? ` (${m.category})` : ""}
                    </option>
                  ))}
                </select>
                {ae.itemId && <p className="mt-1 text-xs text-red-500">{ae.itemId}</p>}
                {selMenuItem && (
                  <p className="text-xs text-slate-400 mt-1 capitalize">
                    Category: {selMenuItem.category || "—"}
                  </p>
                )}
                {menuItems.length === 0 && !loadingMenu && (
                  <p className="text-xs text-orange-500 mt-1">
                    ⚠ Could not load menu items. Check /items endpoint.
                  </p>
                )}
              </div>

              {/* Unit — predefined select */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Unit<span className="text-red-500">*</span>
                </label>
                <select
                  value={af.unit} onChange={setA("unit")}
                  className={fc(ae.unit) + " text-slate-600 appearance-none"}
                >
                  <option value="">Select a unit…</option>
                  {VALID_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                {ae.unit && <p className="mt-1 text-xs text-red-500">{ae.unit}</p>}
              </div>

              {/* Current + Target Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Current Qty<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" min="0" step="0.01"
                    value={af.currentQuantity} onChange={setA("currentQuantity")} placeholder="0.00"
                    className={fc(ae.currentQuantity)}
                  />
                  {ae.currentQuantity && <p className="mt-1 text-xs text-red-500">{ae.currentQuantity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Target Qty<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number" min="0.01" step="0.01"
                    value={af.targetQuantity} onChange={setA("targetQuantity")} placeholder="0.00"
                    className={fc(ae.targetQuantity)}
                  />
                  {ae.targetQuantity && <p className="mt-1 text-xs text-red-500">{ae.targetQuantity}</p>}
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200" />

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Supplier</label>
                <select
                  value={af.supplierId} onChange={setA("supplierId")} disabled={loadingSup}
                  className={fc() + " text-slate-600 appearance-none"}
                >
                  <option value="">{loadingSup ? "Loading…" : "Select a supplier"}</option>
                  {suppliers.map((s) => (
                    <option key={s.id ?? s._id} value={s.id ?? s._id}>{s.companyName}</option>
                  ))}
                </select>
              </div>

              {/* Unit Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={af.lastPrice} onChange={setA("lastPrice")} placeholder="0.00"
                    className={fc(ae.lastPrice) + " pl-7"}
                  />
                </div>
                {ae.lastPrice && <p className="mt-1 text-xs text-red-500">{ae.lastPrice}</p>}
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Expiry Date</label>
                <input
                  type="date" value={af.expiryDate} onChange={setA("expiryDate")}
                  min={new Date().toISOString().split("T")[0]}
                  className={fc(ae.expiryDate)}
                />
                {ae.expiryDate && <p className="mt-1 text-xs text-red-500">{ae.expiryDate}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button type="button" onClick={onClose} disabled={aSub}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={aSub || !branchId}
                className="px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 flex items-center gap-2"
              >
                {aSub && <Spinner />}
                {aSub ? "Creating…" : "Create Inventory Item"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}