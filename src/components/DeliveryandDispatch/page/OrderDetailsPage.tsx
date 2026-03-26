// src/components/Dispatch/page/OrderDetailsPage.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useDispatches,
  markDispatchFailedFn,
  updateDispatchStatusFn,
} from "../hooks/useDispatches";
import { invalidateQuery } from "../../../hook/queryClient";

/* eslint-disable @typescript-eslint/no-explicit-any */

type ModalType = "settlement" | "failed" | "edit" | null;

const reasonToApi: Record<string, string> = {
  customerUnavailable: "customer-unavailable",
  wrongAddress: "wrong-address",
  customerRefusedDelivery: "customer-refused",
  itemDamaged: "item-damaged",
  weatherConditions: "weather-conditions",
  vehicleBreakdown: "vehicle-breakdown",
  other: "other",
};

const timelineSteps = [
  { status: "out-for-delivery", time: "11:35 AM", detailKey: "riderIsOnTheWay", icon: "🛵" },
  { status: "picked-up", time: "11:20 AM", detailKey: "riderCollectedOrder", icon: "🏪" },
  { status: "prepared", time: "11:15 AM", detailKey: "kitchenFinishedCooking", icon: "👨‍🍳" },
  { status: "assigned", time: "11:05 AM", detailKey: "paymentVerified", icon: "✅" },
];

const orderItems = [
  { name: "Truffle Fries", size: "Large Size", qty: 1, price: 8.5 },
  { name: "Truffle Fries", size: "Large Size", qty: 1, price: 8.5 },
  { name: "Truffle Fries", size: "Large Size", qty: 1, price: 8.5 },
];

function getStatusLabel(status: string, t: any) {
  const map: Record<string, string> = {
    assigned: "assigned",
    "picked-up": "pickedUp",
    "out-for-delivery": "outForDelivery",
    delivered: "delivered",
    failed: "failed",
  };
  return t(map[status] ?? status);
}

// ─── Settlement Modal ─────────────────────────────────────────────────────────

function SettlementModal({
  orderId,
  dispatchId,
  onClose,
}: {
  orderId: string;
  dispatchId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const [collected, setCollected] = useState("60");
  const [tip, setTip] = useState("0");
  const [fullPaid, setFullPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectedErr, setCollectedErr] = useState("");
  const totalValue = 60;

  const remaining = Math.max(0, totalValue - parseFloat(collected || "0"));

  const validate = () => {
    if (!collected || isNaN(Number(collected))) {
      setCollectedErr(t("enterAValidCollectedAmount"));
      return false;
    }
    if (Number(collected) < 0) {
      setCollectedErr(t("amountCannotBeNegative"));
      return false;
    }
    setCollectedErr("");
    return true;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      await updateDispatchStatusFn(dispatchId, {
        status: "delivered",
        deliveredAt: new Date().toISOString(),
        cashCollected: parseFloat(collected || "0"),
        ...(parseFloat(tip || "0") > 0 ? { notes: t("driverTipValue", { amount: tip }) } : {}),
      });
      invalidateQuery("dispatches");
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t("failedToConfirmSettlement"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900">{t("orderDelivered", { orderId })}</h2>
        <p className="text-sm text-gray-500 mt-1">{t("completeSettlementDetails")}</p>
        <div className="border-t border-gray-200 my-5" />

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{t("totalOrderValue")}</p>
            <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{t("paymentMethod")}</p>
            <p className="text-sm font-semibold text-blue-600 mt-1">💵 {t("cashOnDelivery")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("collectedAmount")}
            </label>
            <input
              type="number"
              value={collected}
              onChange={e => {
                setCollected(e.target.value);
                setCollectedErr("");
              }}
              className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${
                collectedErr ? "border-red-400" : "border-gray-200"
              }`}
            />
            {collectedErr && <p className="text-xs text-red-500 mt-1">{collectedErr}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("driverTip")}
              <span className="text-gray-400 font-normal ml-1">{t("optional")}</span>
            </label>
            <input
              type="number"
              value={tip}
              onChange={e => setTip(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">{t("wasFullAmountPaid")}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t("toggleIfCustomerPaidExactAmount")}</p>
            </div>
            <button
              onClick={() => setFullPaid(!fullPaid)}
              className={`relative w-12 h-6 rounded-full transition-colors ${fullPaid ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  fullPaid ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 px-1">
          <span className="text-sm font-medium text-gray-600">{t("remainingToBeCollected")}</span>
          <span className={`text-xl font-bold ${remaining === 0 ? "text-blue-600" : "text-red-500"}`}>
            ${remaining.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-60 flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? t("confirming") : t("confirmSettlement")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delivery Failed Modal ────────────────────────────────────────────────────

function DeliveryFailedModal({
  orderId,
  dispatchId,
  onClose,
}: {
  orderId: string;
  dispatchId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [dropOpen, setDrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reasonErr, setReasonErr] = useState("");

  const reasonOptions = [
    { key: "customerUnavailable", label: t("customerUnavailable") },
    { key: "wrongAddress", label: t("wrongAddress") },
    { key: "customerRefusedDelivery", label: t("customerRefusedDelivery") },
    { key: "itemDamaged", label: t("itemDamaged") },
    { key: "weatherConditions", label: t("weatherConditions") },
    { key: "vehicleBreakdown", label: t("vehicleBreakdown") },
    { key: "other", label: t("other") },
  ];

  const handleSubmit = async () => {
    if (!reason) {
      setReasonErr(t("pleaseSelectAReason"));
      return;
    }
    setReasonErr("");
    setLoading(true);
    setError(null);
    try {
      await markDispatchFailedFn(dispatchId, {
        status: "failed",
        failureReason: reasonToApi[reason] ?? "other",
        failureNotes: notes.trim() || undefined,
      });
      invalidateQuery("dispatches");
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t("failedToMarkAsFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("deliveryFailed")}</h2>
            <p className="text-sm text-gray-500">{t("reportAnIssueWithOrder", { orderId })}</p>
          </div>
        </div>
        <div className="border-t border-gray-200 my-5" />

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-5 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("reasonForFailure")}
          </label>
          <button
            onClick={() => setDrop(!dropOpen)}
            className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm text-left flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 transition ${
              reasonErr
                ? "border-red-400 focus:ring-red-400"
                : reason
                ? "border-blue-300 focus:ring-blue-500"
                : "border-gray-200 focus:ring-blue-500"
            } ${reason ? "text-gray-800" : "text-gray-400"}`}
          >
            {reasonOptions.find(r => r.key === reason)?.label || t("selectAReason")}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${dropOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {reasonErr && <p className="text-xs text-red-500 mt-1">{reasonErr}</p>}
          {dropOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
              {reasonOptions.map(r => (
                <button
                  key={r.key}
                  onClick={() => {
                    setReason(r.key);
                    setDrop(false);
                    setReasonErr("");
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition ${
                    reason === r.key ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("additionalNotes")}
            <span className="text-gray-400 font-normal ml-1">{t("optional")}</span>
          </label>
          <textarea
            placeholder={t("provideMoreDetailsAboutTheFailedDeliveryAttempt")}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{notes.length}/500</p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            {t("back")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || loading}
            className={`px-6 py-2.5 rounded-2xl text-white text-sm font-semibold transition shadow-md flex items-center gap-2 ${
              reason && !loading ? "bg-red-500 hover:bg-red-600" : "bg-red-300 cursor-not-allowed"
            }`}
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? t("marking") : t("markAsFailed")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Order Modal ─────────────────────────────────────────────────────────

function EditOrderModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { t } = useTranslation();

  const [phone, setPhone] = useState("+(20) 0123456");
  const [address, setAddress] = useState("123 Gomhoria Street, Mansoura");
  const [notes, setNotes] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [addrErr, setAddrErr] = useState("");
  const [items, setItems] = useState(orderItems.map(i => ({ ...i, note: "" })));

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = 3.5;
  const deliveryFee = 21.5;
  const total = subtotal + tax + deliveryFee;

  const updateQty = (idx: number, d: number) =>
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, qty: Math.max(1, it.qty + d) } : it)));

  const updateNote = (idx: number, note: string) =>
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, note } : it)));

  const handleSave = () => {
    let valid = true;
    if (!phone.trim()) {
      setPhoneErr(t("phoneIsRequired"));
      valid = false;
    } else if (!/^[0-9+\-\s()]{7,15}$/.test(phone.trim())) {
      setPhoneErr(t("invalidPhone"));
      valid = false;
    } else setPhoneErr("");

    if (!address.trim()) {
      setAddrErr(t("addressIsRequired"));
      valid = false;
    } else if (address.trim().length < 5) {
      setAddrErr(t("addressIsTooShort"));
      valid = false;
    } else setAddrErr("");

    if (!valid) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900">{t("editDeliveryOrder")}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {t("orderId")} : #{orderId}
        </p>
        <div className="border-t border-gray-200 my-5" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("customerNumber")}
            </label>
            <input
              value={phone}
              onChange={e => {
                setPhone(e.target.value);
                setPhoneErr("");
              }}
              className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${phoneErr ? "border-red-400" : "border-gray-200"}`}
            />
            {phoneErr && <p className="text-xs text-red-500 mt-1">{phoneErr}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("deliveryAddress")}
            </label>
            <input
              value={address}
              onChange={e => {
                setAddress(e.target.value);
                setAddrErr("");
              }}
              className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${addrErr ? "border-red-400" : "border-gray-200"}`}
            />
            {addrErr && <p className="text-xs text-red-500 mt-1">{addrErr}</p>}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("notes")}</label>
          <textarea
            placeholder={t("notesPlaceholder")}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            maxLength={300}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
          />
        </div>

        <div className="space-y-3 mb-5">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-0.5">
                  <button
                    onClick={() => updateQty(idx, 1)}
                    className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold transition"
                  >
                    +
                  </button>
                  <span className="text-sm font-bold text-gray-800">{item.qty}</span>
                  <button
                    onClick={() => updateQty(idx, -1)}
                    className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold transition"
                  >
                    −
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                    <span className="text-sm font-bold text-gray-800">${item.price.toFixed(2)}</span>
                  </div>
                  <input
                    type="text"
                    placeholder={t("addItemNotePlaceholder")}
                    value={item.note}
                    onChange={e => updateNote(idx, e.target.value)}
                    className="w-full mt-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 space-y-2">
          {([
            [t("subtotal"), subtotal],
            [t("tax"), tax],
            [t("deliveryFee"), deliveryFee],
          ] as [string, number][]).map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm text-gray-600">
              <span>{l}</span>
              <span className="font-semibold">${v.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>{t("total")}</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md"
          >
            {t("saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrderDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatchId = id ?? "";
  const [modal, setModal] = useState<ModalType>(null);

  const { data } = useDispatches({ limit: 1 });
  const dispatch = (data?.data ?? []).find(d => (d.id ?? d._id) === dispatchId) ?? null;
  const orderId = (dispatch as any)?.orderId ?? dispatchId.slice(-6);

  const statusLabel = dispatch?.status ? getStatusLabel(dispatch.status, t) : t("outForDelivery");

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {modal === "settlement" && (
        <SettlementModal
          orderId={orderId}
          dispatchId={dispatchId}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "failed" && (
        <DeliveryFailedModal
          orderId={orderId}
          dispatchId={dispatchId}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "edit" && (
        <EditOrderModal orderId={orderId} onClose={() => setModal(null)} />
      )}

      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <nav className="text-xs text-gray-400 mb-1 flex items-center gap-1">
          <button onClick={() => navigate("/dashboard/dispatch")} className="hover:text-blue-600 transition">
            {t("home")}
          </button>
          <span>/</span>
          <button onClick={() => navigate("/dashboard/dispatch")} className="hover:text-blue-600 transition">
            {t("orders")}
          </button>
          <span>/</span>
          <span className="text-blue-600">{t("orderDetails")}</span>
        </nav>
        <h1 className="text-lg font-bold text-blue-600">{t("dispatchOverview")}</h1>
        <p className="text-sm text-gray-500">{t("mansouraBranch")}</p>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl">🛵</div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">#ORD-{orderId}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  • {statusLabel}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {t("placedOn")}{" "}
                {dispatch?.assignedAt
                  ? new Date(dispatch.assignedAt).toLocaleString()
                  : t("defaultPlacedOn")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModal("edit")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
            >
              ✏️ {t("editOrder")}
            </button>
            <div className="text-right">
              <p className="text-xs text-gray-500">{t("totalAmount")}</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(dispatch as any)?.amount ?? "60.00"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-xl mb-4">
              📍 {t("customerAndDelivery")}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-base font-bold text-gray-900">
                  {(dispatch as any)?.customer?.name ?? "Mohamed Morsy"}
                </p>
                <p className="text-xs text-gray-500">{t("frequentCustomer12Orders")}</p>
              </div>
              {[
                { icon: "📞", label: t("contactNumberUpper"), value: (dispatch as any)?.customer?.phone ?? "+(20) 0123456" },
                { icon: "📍", label: t("deliveryAddressUpper"), value: (dispatch as any)?.deliveryAddress ?? "123 Gomhoria Street, Mansoura" },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="text-base flex-shrink-0 mt-0.5">{row.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{row.label}</p>
                    <p className="text-sm text-gray-800">{row.value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <span className="text-base flex-shrink-0 mt-0.5">💳</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{t("paymentMethodUpper")}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-800">{t("cashOnDelivery")}</p>
                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-md font-semibold">
                      {t("pending")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-xl">
                📋 {t("orderItems")}
              </div>
              <span className="bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg">3 {t("items")}</span>
            </div>
            <div className="grid grid-cols-3 text-xs font-bold text-white bg-gray-900 rounded-xl px-3 py-2 mb-3">
              <span>{t("item")}</span><span className="text-center">{t("qty")}</span><span className="text-right">{t("price")}</span>
            </div>
            <div className="space-y-2 mb-4">
              {orderItems.map((item, i) => (
                <div key={i} className="grid grid-cols-3 text-sm px-3 py-2 hover:bg-gray-50 rounded-xl transition">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{t("largeSize")}</p>
                  </div>
                  <p className="text-center text-gray-600 self-center">{item.qty}</p>
                  <p className="text-right font-semibold text-gray-800 self-center">${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 rounded-xl p-3 mb-4 border border-blue-100">
              <p className="text-xs font-bold text-blue-700 mb-1">{t("kitchenNotes")}</p>
              <p className="text-xs text-blue-700 italic">
                {(dispatch as any)?.notes ?? t("noOnionsOnTheBurgersPlease")}
              </p>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-gray-100">
              {[
                [t("subtotal"), "$25.50"],
                [t("tax10"), "$3.50"],
                [t("deliveryFee"), "$21.50"],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm text-gray-600">
                  <span>{l}</span><span>{v}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>{t("total")}</span>
                <span className="text-blue-600">${(dispatch as any)?.amount ?? "60.00"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-xl mb-4">
              ⏱ {t("riderAndTimeline")}
            </div>
            <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between mb-5 border border-gray-100">
              <div>
                <p className="font-bold text-gray-900">
                  {(dispatch as any)?.driverName ?? t("assignedDriver")}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-xs text-gray-600 font-semibold">4.9</span>
                  <span className="text-xs text-gray-400">• 1,204 {t("deliveries")}</span>
                </div>
              </div>
              <button className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition text-lg">
                📞
              </button>
            </div>

            <div className="relative space-y-3 mb-5">
              {((dispatch?.timeline ?? []).length > 0
                ? [...(dispatch?.timeline ?? [])].reverse()
                : timelineSteps.map(s => ({ status: s.status, timestamp: s.time, noteKey: s.detailKey, icon: s.icon }))
              ).map((step: any, i: number, arr: any[]) => {
                const statusIcon: Record<string, string> = {
                  assigned: "📋",
                  "picked-up": "🏪",
                  "out-for-delivery": "🛵",
                  delivered: "✅",
                  failed: "❌",
                };

                const icon = statusIcon[step.status] ?? "⏱";
                const time = step.timestamp
                  ? new Date(step.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : step.time ?? "";

                const detail =
                  step.note ??
                  (step.noteKey ? t(step.noteKey) : "");

                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm flex-shrink-0">
                        {icon}
                      </div>
                      {i < arr.length - 1 && <div className="w-0.5 h-5 bg-blue-200 mt-1" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-600 capitalize">
                        {getStatusLabel(step.status ?? "", t)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {time} • {detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-700 font-semibold hover:bg-gray-50 transition">
                  🖨 {t("receipt")}
                </button>
                <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-700 font-semibold hover:bg-gray-50 transition">
                  💬 {t("contact")}
                </button>
              </div>

              {dispatch?.status === "out-for-delivery" && (
                <button
                  onClick={() => setModal("settlement")}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                >
                  ✅ {t("confirmSettlement")}
                </button>
              )}

              {dispatch?.status === "out-for-delivery" && (
                <button
                  onClick={() => setModal("failed")}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-red-100 transition"
                >
                  ❌ {t("markAsFailed")}
                </button>
              )}

              {dispatch?.status && !["out-for-delivery"].includes(dispatch.status) && (
                <div
                  className={`w-full rounded-xl py-2.5 text-sm font-semibold text-center ${
                    dispatch.status === "delivered"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : dispatch.status === "failed"
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : dispatch.status === "picked-up"
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {dispatch.status === "assigned" && t("waitingForPickupGoBackToTableToAdvance")}
                  {dispatch.status === "picked-up" && t("riderPickedUpGoBackToTableToMarkOutForDelivery")}
                  {dispatch.status === "delivered" && t("deliveredOrderComplete")}
                  {dispatch.status === "failed" && t("deliveryFailed")}
                </div>
              )}

              <button
                onClick={() => navigate("/dashboard/dispatch")}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-500 rounded-xl py-2 text-xs font-semibold hover:bg-gray-50 transition"
              >
                ← {t("backToDispatch")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}