import { useState, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDrivers } from "../hooks/useDrivers";
import { useDriverDispatches } from "../hooks/useDispatches";
import {
  useSettlements,
  useDriverSettlements,
  createSettlementFn,
  settleShiftFn,
  updateSettlementFn,
  deleteSettlementFn,
} from "../hooks/Usesettlements";
import { invalidateQuery } from "../../../hook/queryClient";
import type { Settlement } from "../services/Settlementservice";
import type { Driver } from "../services/driverService";
import type { ApiBranch } from "../../layout/Topbar";

/* eslint-disable @typescript-eslint/no-explicit-any */

function useBranchId(): string | undefined {
  const outlet = useOutletContext<{ activeBranch?: ApiBranch | null } | undefined>();
  const b = outlet?.activeBranch ?? null;
  const candidates = [b?.id, b?._id];
  return candidates.find(v => typeof v === "string" && /^[a-f\d]{24}$/i.test(v));
}

const statusBadge: Record<string, string> = {
  delivered: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-600",
  pending: "bg-yellow-100 text-yellow-700",
  settled: "bg-blue-100 text-blue-700",
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDriverStatusClass(status?: string) {
  return (
    {
      present: "bg-green-100 text-green-700",
      busy: "bg-blue-100 text-blue-700",
      absent: "bg-orange-100 text-orange-700",
      offline: "bg-gray-100 text-gray-500",
    }[status ?? "offline"] ?? "bg-gray-100 text-gray-500"
  );
}

function CloseShiftModal({
  driver,
  dispatches,
  branchId,
  existingSettlementId,
  onCancel,
  onDone,
}: {
  driver: Driver;
  dispatches: any[];
  branchId: string;
  existingSettlementId?: string;
  onCancel: () => void;
  onDone: () => void;
}) {
  const { t } = useTranslation();

  const [cashAmount, setCashAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cashErr, setCashErr] = useState("");

  const driverId = driver.id ?? "";
  const driverName = driver.name ?? t("driver");
  const delivered = dispatches.filter(d => d.status === "delivered");
  const failed = dispatches.filter(d => d.status === "failed");
  const totalCash = delivered.reduce((s: number, d: any) => s + (Number(d.cashCollected) || 0), 0);
  const totalFees = delivered.reduce((s: number, d: any) => s + (Number(d.deliveryFee) || 0), 0);
  const totalCommission = delivered.reduce((s: number, d: any) => s + (Number(d.commission) || 0), 0);
  const netToSubmit = totalCash - totalCommission;
  const variance = cashAmount ? Number(cashAmount) - netToSubmit : null;

  const validate = () => {
    if (!cashAmount.trim()) {
      setCashErr(t("pleaseEnterTheActualCashReceived"));
      return false;
    }
    if (isNaN(Number(cashAmount)) || Number(cashAmount) < 0) {
      setCashErr(t("enterAValidPositiveAmount"));
      return false;
    }
    setCashErr("");
    return true;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      const now = new Date();
      const shiftStart = new Date(now);
      shiftStart.setHours(0, 0, 0, 0);

      if (existingSettlementId) {
        await settleShiftFn(existingSettlementId, {
          settledAt: now.toISOString(),
          notes: notes.trim() || t("shiftClosed"),
        });
      } else {
        const created = await createSettlementFn({
          driverId,
          branchId,
          shiftDate: today(),
          shiftStart: shiftStart.toISOString(),
          shiftEnd: now.toISOString(),
          totalOrders: dispatches.length,
          deliveredOrders: delivered.length,
          failedOrders: failed.length,
          totalCashCollected: Number(cashAmount),
          totalDeliveryFees: totalFees,
          totalCommission,
        });
        const settlementId = created?.data?.id ?? created?.id;
        if (settlementId) {
          await settleShiftFn(settlementId, {
            settledAt: now.toISOString(),
            notes: notes.trim() || t("shiftClosed"),
          });
        }
      }

      invalidateQuery("settlements");
      onDone();
    } catch (err: any) {
      const data = err?.response?.data ?? err?.data ?? err;
      setApiError(data?.message ?? err?.message ?? t("failedToCloseShift"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900">{t("closeShiftAndSettleFinances")}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {t("settlementFor")} <strong className="text-gray-700">{driverName}</strong>
        </p>
        <div className="border-t border-gray-200 my-5" />

        {apiError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: t("orders"), value: String(dispatches.length) },
            { label: t("collected"), value: `$${totalCash.toFixed(2)}` },
            { label: t("netToSubmit"), value: `$${netToSubmit.toFixed(2)}` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("actualCashReceived")}</label>
          <div className={`bg-white rounded-2xl border flex items-center px-4 py-3 shadow-sm focus-within:ring-2 transition ${
            cashErr ? "border-red-400 focus-within:ring-red-300" : "border-gray-200 focus-within:ring-blue-500"
          }`}>
            <span className="text-gray-400 text-sm mr-2">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={cashAmount}
              onChange={e => {
                setCashAmount(e.target.value);
                setCashErr("");
                setApiError(null);
              }}
              className="flex-1 text-gray-800 text-sm bg-transparent focus:outline-none"
            />
            <span className="text-gray-400 text-sm ml-2">USD</span>
          </div>
          {cashErr && <p className="text-xs text-red-500 mt-1">{cashErr}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("notes")} <span className="text-gray-400 font-normal">{t("optional")}</span>
          </label>
          <textarea
            rows={2}
            placeholder={t("shiftCompletedSuccessfully")}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
          />
        </div>

        {variance !== null && (
          <div className={`mb-4 rounded-xl px-4 py-3 flex items-center justify-between text-sm font-semibold ${
            variance === 0 ? "bg-green-50 text-green-700" :
            variance > 0 ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-600"
          }`}>
            <span>
              {variance === 0
                ? t("exactMatch")
                : variance > 0
                ? t("surplus")
                : t("shortage")}
            </span>
            <span>${Math.abs(variance).toFixed(2)}</span>
          </div>
        )}

        <div className="bg-red-50 border-l-4 border-red-400 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-600">
            {t("closingTheShiftWillLockAllRecordsForThisPeriodAndCannotBeUndone")}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
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
            {loading ? t("closing") : t("closeShift")}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditSettlementModal({
  settlement,
  onClose,
}: {
  settlement: Settlement;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  const [notes, setNotes] = useState(settlement.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setApiError(null);
    try {
      await updateSettlementFn(settlement.id!, { notes: notes.trim() });
      invalidateQuery("settlements");
      onClose();
    } catch (err: any) {
      setApiError(err?.response?.data?.message ?? t("failedToUpdateSettlement"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("deleteThisSettlementThisCannotBeUndone"))) return;
    setLoading(true);
    try {
      await deleteSettlementFn(settlement.id!);
      invalidateQuery("settlements");
      onClose();
    } catch (err: any) {
      setApiError(err?.response?.data?.message ?? t("failedToDeleteSettlement"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900">{t("editSettlement")}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {settlement.driverName ?? t("driver")} · {settlement.shiftDate}
        </p>
        <div className="border-t border-gray-200 my-4" />

        {apiError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: t("totalOrders"), value: settlement.totalOrders ?? 0 },
            { label: t("delivered"), value: settlement.deliveredOrders ?? 0 },
            { label: t("failed"), value: settlement.failedOrders ?? 0 },
            { label: t("cashCollected"), value: `$${(settlement.totalCashCollected ?? 0).toFixed(2)}` },
            { label: t("deliveryFees"), value: `$${(settlement.totalDeliveryFees ?? 0).toFixed(2)}` },
            { label: t("commission"), value: `$${(settlement.totalCommission ?? 0).toFixed(2)}` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className="font-bold text-gray-800">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("notes")}</label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t("adjustedCommissionPlaceholder")}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50"
          >
            {t("delete")}
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-60 flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? t("saving") : t("saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}

function DriverSettlementPanel({
  driver,
  onClose,
  onCloseShift,
}: {
  driver: Driver;
  onClose: () => void;
  onCloseShift: (driver: Driver) => void;
}) {
  const { t } = useTranslation();
  const driverId = driver.id ?? "";
  const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null);

  const { data, isLoading, isError } = useDriverSettlements(driverId, { limit: 10 });
  const settlements: Settlement[] = data?.data ?? [];

  return (
    <>
      {editingSettlement && (
        <EditSettlementModal settlement={editingSettlement} onClose={() => setEditingSettlement(null)} />
      )}

      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        <div className="bg-[#f0f7ff] px-6 py-5 border-b border-gray-200 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{driver.name}</h2>
            <p className="text-sm text-gray-500 capitalize">
              {driver.vehicleType} · {driver.vehiclePlate}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-gray-500">⭐ {driver.rating ?? 0}</span>
              <span className="text-xs text-gray-500">📦 {driver.totalDeliveries ?? 0} {t("total")}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getDriverStatusClass(driver.status)}`}>
                {t(driver.status ?? "offline")}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition text-xl leading-none">✕</button>
        </div>

        {driver.todayStats && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-4 text-sm">
            <span className="text-blue-700 font-semibold">{t("today")}:</span>
            <span className="text-blue-600">📋 {driver.todayStats.assigned ?? 0} {t("assigned")}</span>
            <span className="text-green-600">✓ {driver.todayStats.delivered ?? 0} {t("delivered")}</span>
          </div>
        )}

        <div className="px-6 py-3 border-b border-gray-100">
          <button
            onClick={() => onCloseShift(driver)}
            className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            {t("closeShiftAndCreateSettlement")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">{t("settlementHistory")}</h3>

          {isLoading && (
            <div className="flex justify-center py-8">
              <svg className="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          )}

          {isError && <p className="text-sm text-red-500 text-center py-4">{t("failedToLoadSettlements")}</p>}

          {!isLoading && !isError && settlements.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">{t("noSettlementsYetForThisDriver")}</p>
          )}

          <div className="space-y-3">
            {settlements.map(s => (
              <div key={s.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{s.shiftDate}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge[s.status ?? "pending"] ?? "bg-gray-100 text-gray-600"}`}>
                      {t(s.status ?? "pending")}
                    </span>
                  </div>
                  <button
                    onClick={() => setEditingSettlement(s)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
                    title={t("editSettlement")}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                  <div>
                    <span className="block text-gray-400">{t("orders")}</span>
                    <span className="font-semibold text-gray-700">{s.totalOrders ?? 0}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">{t("collected")}</span>
                    <span className="font-semibold text-gray-700">${(s.totalCashCollected ?? 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">{t("commission")}</span>
                    <span className="font-semibold text-red-500">-${(s.totalCommission ?? 0).toFixed(2)}</span>
                  </div>
                </div>
                {s.notes && <p className="text-xs text-gray-400 mt-2 italic">"{s.notes}"</p>}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

export default function RiderShiftSettlement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const branchId = useBranchId() ?? "";
  const [page, setPage] = useState(1);
  const [showClose, setShowClose] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [closingDriver, setClosingDriver] = useState<Driver | null>(null);
  const [settlementsPage, setSettlementsPage] = useState(1);
  const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null);

  const {
    data: settlementsData,
    isLoading: settlementsLoading,
    isError: settlementsError,
    refetch: refetchSettlements,
  } = useSettlements({ sort: "-shiftDate", limit: 10, page: settlementsPage });

  const settlements: Settlement[] = settlementsData?.data ?? [];
  const settlementsTotalPages = settlementsData?.paginationResult?.totalPages ?? 1;
  const settlementsTotalDocs = settlementsData?.paginationResult?.totalDocs ?? 0;

  const { data: driversData, isLoading: driversLoading } = useDrivers({ sort: "-createdAt", limit: 50 });
  const drivers: Driver[] = driversData?.data ?? [];

  const closingDriverId = closingDriver?.id ?? "";
  const { data: dispatchData } = useDriverDispatches(closingDriverId, { limit: 100 });
  const closingDriverDispatches: any[] = dispatchData?.data ?? [];

  const handleShiftClosed = useCallback(() => {
    setShowClose(false);
    setClosingDriver(null);
    setSelectedDriver(null);
    invalidateQuery("settlements");
    navigate("/dashboard/dispatch");
  }, [navigate]);

  const handleCloseShiftForDriver = (driver: Driver) => {
    setClosingDriver(driver);
    setSelectedDriver(null);
    setShowClose(true);
  };

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(drivers.length / ITEMS_PER_PAGE));
  const paginatedDrivers = drivers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {showClose && closingDriver && (
        <CloseShiftModal
          driver={closingDriver}
          dispatches={closingDriverDispatches}
          branchId={branchId}
          onCancel={() => {
            setShowClose(false);
            setClosingDriver(null);
          }}
          onDone={handleShiftClosed}
        />
      )}

      {selectedDriver && (
        <DriverSettlementPanel
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onCloseShift={handleCloseShiftForDriver}
        />
      )}

      {editingSettlement && (
        <EditSettlementModal settlement={editingSettlement} onClose={() => setEditingSettlement(null)} />
      )}

      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <nav className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <button onClick={() => navigate("/dashboard/dispatch")} className="hover:text-blue-600 transition">
              {t("home")} / {t("dispatch")} /
            </button>
            <span className="text-blue-600">{t("riderShift")}</span>
          </nav>
          <h1 className="text-xl font-bold text-gray-900">{t("riderShiftSettlement")}</h1>
          <p className="text-sm text-gray-500">{t("manageDriverShiftsAndFinancialSettlements")}</p>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">{t("allSettlements")}</h2>
            <span className="text-xs text-gray-400">{settlementsTotalDocs} {t("total")}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[t("driver"), t("shiftDateHeader"), t("orders"), t("delivered"), t("failed"), t("cash"), t("commission"), t("status"), t("action")].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {settlementsLoading && (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-400 text-sm">
                      <svg className="animate-spin w-5 h-5 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      {t("loadingSettlements")}
                    </td>
                  </tr>
                )}
                {settlementsError && !settlementsLoading && (
                  <tr>
                    <td colSpan={9} className="text-center py-10">
                      <p className="text-red-500 text-sm mb-2">{t("failedToLoadSettlements")}</p>
                      <button
                        onClick={refetchSettlements}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        {t("retry")}
                      </button>
                    </td>
                  </tr>
                )}
                {!settlementsLoading && !settlementsError && settlements.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-400 text-sm">
                      {t("noSettlementsFound")}
                    </td>
                  </tr>
                )}
                {!settlementsLoading && !settlementsError && settlements.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-sm">{s.driverName ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{s.shiftDate ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-700 font-semibold">{s.totalOrders ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-green-600 font-semibold">{s.deliveredOrders ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-red-500 font-semibold">{s.failedOrders ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-gray-800 font-semibold">${(s.totalCashCollected ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-red-500 font-semibold">-${(s.totalCommission ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge[s.status ?? "pending"] ?? "bg-gray-100 text-gray-600"}`}>
                        {t(s.status ?? "pending")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditingSettlement(s)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                        title={t("edit")}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {t("showing")} <strong>{settlements.length}</strong> {t("from")} <strong>{settlementsTotalDocs}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={settlementsPage <= 1}
                onClick={() => setSettlementsPage(p => p - 1)}
                className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(settlementsTotalPages, 5) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setSettlementsPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                    settlementsPage === p ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={settlementsPage >= settlementsTotalPages}
                onClick={() => setSettlementsPage(p => p + 1)}
                className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">{t("drivers")}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{t("clickAnyDriverToViewTheirSettlementsAndCloseShift")}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[t("driver"), t("vehicle"), t("status"), t("today"), t("totalDeliveries"), t("rating"), t("action")].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {driversLoading && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                      {t("loadingDrivers")}
                    </td>
                  </tr>
                )}
                {!driversLoading && paginatedDrivers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                      {t("noDriversFound")}
                    </td>
                  </tr>
                )}
                {paginatedDrivers.map(driver => {
                  const dId = driver.id ?? "";
                  const statusKey = driver.status ?? "offline";

                  return (
                    <tr
                      key={dId}
                      onClick={() => setSelectedDriver(driver)}
                      className="border-b border-gray-50 hover:bg-blue-50 transition cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{driver.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{driver.phone ?? ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 capitalize">{driver.vehicleType ?? "—"}</p>
                        <p className="text-xs text-gray-400">{driver.vehiclePlate ?? ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getDriverStatusClass(statusKey)}`}>
                          {t(statusKey)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {driver.todayStats?.assigned ?? 0} {t("assigned")} · {driver.todayStats?.delivered ?? 0} ✓
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        {(driver.totalDeliveries ?? 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        ⭐ {driver.rating ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedDriver(driver);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition whitespace-nowrap"
                        >
                          {t("viewSettlements")} →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {t("showing")} <strong>{paginatedDrivers.length}</strong> {t("from")} <strong>{drivers.length}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
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
                onClick={() => setPage(p => p + 1)}
                className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}