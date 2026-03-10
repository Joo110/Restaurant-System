// src/components/Tables/page/TablesPage.tsx
import React, { useState } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import AddTableModal    from "../page/Addtablemodal";
import AssignGuestModal from "../../Finance/page/Assignguestmodal";
import {
  useTables,
  useTableStats,
  createTableFn,
  releaseTableFn,
} from "../hook/useTables";
import { invalidateQuery } from "../../../hook/queryClient";
import type { ApiBranch } from "../../layout/Topbar";

/* ── types ─────────────────────────────────────────── */
type TableStatus = "available" | "occupied" | "reserved";
type AreaFilter  = "All Tables" | "indoor" | "outdoor";

const STATUS_BADGE: Record<string, string> = {
  reserved:  "bg-yellow-100 text-yellow-700",
  available: "bg-green-100  text-green-700",
  occupied:  "bg-pink-100   text-pink-700",
};

const STATUS_BTN: Record<string, { label: string; style: string }> = {
  reserved:  { label: "Check In",     style: "bg-yellow-400 hover:bg-yellow-500 text-white" },
  available: { label: "Assign Table", style: "bg-green-500  hover:bg-green-600  text-white" },
  occupied:  { label: "Release",      style: "bg-purple-500 hover:bg-purple-600 text-white" },
};

/* ── TableCard ──────────────────────────────────────── */
const TableCard: React.FC<{
  table:     any;
  onAssign:  (id: string, tableNumber: string) => void;
  onCheckIn: (id: string, tableNumber: string) => void;
  onRelease: (id: string) => void;
}> = ({ table, onAssign, onCheckIn, onRelease }) => {
  const status = table.status?.toLowerCase() ?? "available";
  const btn    = STATUS_BTN[status] ?? STATUS_BTN["available"];

  const handlePrimary = () => {
    if (status === "available") onAssign(table.id, table.tableNumber);
    if (status === "reserved")  onCheckIn(table.id, table.tableNumber);
    if (status === "occupied")  onRelease(table.id);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">{table.tableNumber}</h3>
          <p className="text-[11px] sm:text-xs text-slate-400">Capacity: {table.capacity}</p>
        </div>
        <span className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_BADGE[status] ?? "bg-gray-100 text-gray-600"}`}>
          {table.status}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1">
        {status === "available" ? (
          <div className="flex flex-col items-center py-3 sm:py-4 text-slate-200">
            <svg width="40" height="34" viewBox="0 0 48 40" fill="none">
              <ellipse cx="24" cy="8" rx="20" ry="6" stroke="#cbd5e1" strokeWidth="2" fill="none"/>
              <line x1="24" y1="14" x2="24" y2="38" stroke="#cbd5e1" strokeWidth="2"/>
              <line x1="14" y1="34" x2="34" y2="34" stroke="#cbd5e1" strokeWidth="2"/>
            </svg>
            <p className="text-xs text-slate-400 mt-2">Ready for guests</p>
          </div>
        ) : (
          <div className="space-y-1.5 mb-3">
            {table.currentCustomer?.name && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs flex-shrink-0">👤</div>
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] text-slate-400">Guest</p>
                  <p className="font-medium text-[11px] sm:text-xs text-slate-800 truncate">
                    {table.currentCustomer.name}
                  </p>
                </div>
              </div>
            )}
            {table.reservedFor && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs flex-shrink-0">🕐</div>
                <div>
                  <p className="text-[9px] sm:text-[10px] text-slate-400">Reserved For</p>
                  <p className="font-medium text-[11px] sm:text-xs text-slate-800">
                    {new Date(table.reservedFor).toLocaleString("en-GB", {
                      hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short",
                    })}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs flex-shrink-0">📍</div>
              <div>
                <p className="text-[9px] sm:text-[10px] text-slate-400">Location</p>
                <p className="font-medium text-[11px] sm:text-xs text-slate-800 capitalize">{table.location}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2">
        <button onClick={handlePrimary}
          className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${btn.style}`}>
          {btn.label}
        </button>
        <button className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors flex-shrink-0">
          <MoreHorizontal size={15} />
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════ */
export default function TablesPage() {
  // ── Branch resolution ──
  const outlet            = useOutletContext<{ activeBranch?: ApiBranch | null } | undefined>();
  const activeBranch      = outlet?.activeBranch ?? null;
  const effectiveBranchId = activeBranch?.id ?? activeBranch?._id ??
    (activeBranch?.branchId != null ? String(activeBranch.branchId) : undefined);

  // ── State ──
  const [search,        setSearch]        = useState("");
  const [areaFilter,    setAreaFilter]    = useState<AreaFilter>("All Tables");
  const [statusFilter,  setStatusFilter]  = useState<string>("");
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ← بنحفظ { id: MongoDB_id, tableNumber: "T01" } عشان نبعت الاتنين للـ modal
  const [assigningTable, setAssigningTable] = useState<{ id: string; tableNumber: string } | null>(null);

  // ── Data ──
  const { data, isLoading, refetch } = useTables({
    ...(areaFilter !== "All Tables" ? { location: areaFilter as "indoor" | "outdoor" } : {}),
    ...(statusFilter ? { status: statusFilter as TableStatus } : {}),
    ...(effectiveBranchId ? { branchId: effectiveBranchId } : {}),
    limit: 50,
  });

  const { data: statsData } = useTableStats(effectiveBranchId);
  const stats  = statsData?.data;
  const tables = data?.data ?? [];

  // ── Client-side search ──
  const filtered = tables.filter((t) =>
    t.tableNumber?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Stat cards ──
  const total     = stats?.total     ?? tables.length;
  const occupied  = stats?.occupied  ?? tables.filter((t) => t.status === "occupied").length;
  const available = stats?.available ?? tables.filter((t) => t.status === "available").length;
  const reserved  = stats?.reserved  ?? tables.filter((t) => t.status === "reserved").length;

  const statCards = [
    { label: "Total Tables", value: total,     pct: 100,                                   color: "bg-blue-600"   },
    { label: "Occupied",     value: occupied,  pct: total ? (occupied  / total) * 100 : 0, color: "bg-red-500"    },
    { label: "Available",    value: available, pct: total ? (available / total) * 100 : 0, color: "bg-green-500"  },
    { label: "Reserved",     value: reserved,  pct: total ? (reserved  / total) * 100 : 0, color: "bg-yellow-400" },
  ];

  // ── Handlers ──
  const handleAddTable = async (tableData: {
    tableNumber: string; seats: number; area: string; branchId?: string;
  }) => {
    if (!effectiveBranchId) return;
    try {
      await createTableFn({
        tableNumber: tableData.tableNumber,
        capacity:    tableData.seats,
        location:    tableData.area.toLowerCase().includes("outdoor") ? "outdoor" : "indoor",
        branchId:    effectiveBranchId,
      });
      invalidateQuery("tables");
      refetch();
    } catch (err) {
      console.error("Failed to create table:", err);
    }
  };

  // الـ AssignGuestModal بيعمل الـ API call جواه، هنا بس نعمل refetch
  const handleAssignConfirm = () => {
    invalidateQuery("tables");
    refetch();
    setAssigningTable(null);
  };

  const handleRelease = async (tableId: string) => {
    setActionLoading(tableId);
    try {
      await releaseTableFn(tableId);
      invalidateQuery("tables");
      refetch();
    } catch (err) {
      console.error("Failed to release table:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-sm">
            <p className="text-[11px] sm:text-sm text-slate-500 font-medium">{s.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{s.value}</p>
            <div className="mt-2 sm:mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search by Table..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {(["All Tables", "indoor", "outdoor"] as const).map((f) => (
              <button key={f} onClick={() => setAreaFilter(f)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium capitalize transition-all ${
                  areaFilter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                {f === "All Tables" ? "All Tables" : f}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 bg-white outline-none"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            + Add New Table
          </button>
        </div>
      </div>

      {/* ── Tables Grid ── */}
      {isLoading ? (
        <p className="text-center text-slate-400 text-sm py-12 animate-pulse">Loading tables...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((table) => (
            <div
              key={table.id}
              className={actionLoading === table.id ? "opacity-50 pointer-events-none" : ""}
            >
              <TableCard
                table={table}
                onAssign={(id, tableNumber) => setAssigningTable({ id, tableNumber })}
                onCheckIn={(id, tableNumber) => setAssigningTable({ id, tableNumber })}
                onRelease={(id) => handleRelease(id)}
              />
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-3 text-center text-slate-400 text-sm py-12">No tables found.</p>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <AddTableModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTable}
        branchId={effectiveBranchId}
      />

      {/*
        tableId  → للعرض فقط (T01, T02...)
        realId   → الـ MongoDB _id اللي بيتبعت للـ API
      */}
      <AssignGuestModal
        isOpen={!!assigningTable}
        tableId={assigningTable?.tableNumber ?? ""}
        realId={assigningTable?.id ?? ""}
        onClose={() => setAssigningTable(null)}
        onConfirm={handleAssignConfirm}
      />
    </div>
  );
}