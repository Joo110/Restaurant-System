// src/components/Tables/page/TablesPage.tsx
import React, { useState } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import AddTableModal    from "../page/Addtablemodal";
import AssignGuestModal from "../../Finance/page/Assignguestmodal";

/* ── types ─────────────────────────────────────────── */
type TableStatus = "Available" | "Occupied" | "Reserved";
type AreaType    = "Indoor" | "Outdoor";

interface TableData {
  id:           string;
  number:       string;
  capacity:     number;
  status:       TableStatus;
  area:         AreaType;
  guestName?:   string;
  waiterName?:  string;
  arrivalTime?: string;
  bill?:        number;
}

/* ── mock data ─────────────────────────────────────── */
const INITIAL_TABLES: TableData[] = [
  { id:"t01", number:"T01", capacity:4, status:"Reserved",  area:"Indoor",  guestName:"Mohamed Morsy", arrivalTime:"0:12:02", bill:24.50  },
  { id:"t02", number:"T02", capacity:8, status:"Available", area:"Indoor"  },
  { id:"t03", number:"T03", capacity:4, status:"Occupied",  area:"Indoor",  waiterName:"Mohamed Morsy", arrivalTime:"6:45:02", bill:124.50 },
  { id:"t04", number:"T04", capacity:4, status:"Occupied",  area:"Indoor",  waiterName:"Mohamed Morsy", arrivalTime:"6:45:02", bill:124.50 },
  { id:"t05", number:"T05", capacity:4, status:"Reserved",  area:"Outdoor", guestName:"Mohamed Morsy", arrivalTime:"0:12:02", bill:24.50  },
  { id:"t06", number:"T06", capacity:2, status:"Available", area:"Outdoor" },
];

const STATUS_BADGE: Record<TableStatus, string> = {
  Reserved:  "bg-yellow-100 text-yellow-700",
  Available: "bg-green-100  text-green-700",
  Occupied:  "bg-pink-100   text-pink-700",
};
const STATUS_BTN: Record<TableStatus, { label:string; style:string }> = {
  Reserved:  { label:"Check In",     style:"bg-yellow-400 hover:bg-yellow-500 text-white" },
  Available: { label:"Assign Table", style:"bg-green-500  hover:bg-green-600  text-white" },
  Occupied:  { label:"View Order",   style:"bg-purple-500 hover:bg-purple-600 text-white" },
};

/* ── TableCard ──────────────────────────────────────── */
const TableCard: React.FC<{
  table:       TableData;
  onAssign:    (id:string) => void;
  onCheckIn:   (id:string) => void;
  onViewOrder: (id:string) => void;
}> = ({ table, onAssign, onCheckIn, onViewOrder }) => {
  const btn = STATUS_BTN[table.status];

  const handlePrimary = () => {
    if (table.status === "Available") onAssign(table.id);
    if (table.status === "Reserved")  onCheckIn(table.id);
    if (table.status === "Occupied")  onViewOrder(table.id);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">{table.number}</h3>
          <p className="text-[11px] sm:text-xs text-slate-400">Capacity: {table.capacity}</p>
        </div>
        <span className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full ${STATUS_BADGE[table.status]}`}>
          {table.status}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1">
        {table.status === "Available" ? (
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
            {(table.guestName || table.waiterName) && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs flex-shrink-0">👤</div>
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] text-slate-400">{table.guestName ? "Guest" : "Waiter"}</p>
                  <p className="font-medium text-[11px] sm:text-xs text-slate-800 truncate">{table.guestName ?? table.waiterName}</p>
                </div>
              </div>
            )}
            {table.arrivalTime && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs flex-shrink-0">🕐</div>
                <div>
                  <p className="text-[9px] sm:text-[10px] text-slate-400">{table.status === "Reserved" ? "Arrival" : "Time"}</p>
                  <p className="font-medium text-[11px] sm:text-xs text-slate-800">{table.arrivalTime}</p>
                </div>
              </div>
            )}
            {table.bill !== undefined && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs flex-shrink-0">💰</div>
                <div>
                  <p className="text-[9px] sm:text-[10px] text-slate-400">Bill</p>
                  <p className="font-medium text-[11px] sm:text-xs text-slate-800">${table.bill.toFixed(2)}</p>
                </div>
              </div>
            )}
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
  const [tables,        setTables]        = useState<TableData[]>(INITIAL_TABLES);
  const [search,        setSearch]        = useState("");
  const [areaFilter,    setAreaFilter]    = useState<"All Tables"|"Indoor"|"Outdoor">("All Tables");
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [assignTableId, setAssignTableId] = useState<string|null>(null);

  /* stats */
  const total     = tables.length;
  const occupied  = tables.filter((t) => t.status === "Occupied").length;
  const available = tables.filter((t) => t.status === "Available").length;
  const reserved  = tables.filter((t) => t.status === "Reserved").length;

  /* filtered */
  const filtered = tables.filter((t) => {
    const matchSearch = t.number.toLowerCase().includes(search.toLowerCase());
    const matchArea   = areaFilter === "All Tables" || t.area === areaFilter;
    return matchSearch && matchArea;
  });

  /* handlers */
  const handleAddTable = (data: { tableNumber:string; seats:number; area:string }) => {
    setTables((prev) => [...prev, {
      id:       `t${Date.now()}`,
      number:   data.tableNumber.toUpperCase(),
      capacity: data.seats,
      status:   "Available",
      area:     data.area === "Outdoor" ? "Outdoor" : "Indoor",
    }]);
  };

  const handleAssign = (tableId: string, data: { guestName:string; guests:number; waiterId:string }) => {
    setTables((prev) => prev.map((t) =>
      t.id === tableId
        ? { ...t, status:"Reserved" as TableStatus, guestName:data.guestName,
            arrivalTime: new Date().toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit", second:"2-digit" }) }
        : t
    ));
  };

  const handleCheckIn = (tableId: string) => {
    setTables((prev) => prev.map((t) =>
      t.id === tableId
        ? { ...t, status:"Occupied" as TableStatus, waiterName:t.guestName, guestName:undefined }
        : t
    ));
  };

  const assigningTable = tables.find((t) => t.id === assignTableId);

  const statCards = [
    { label:"Total Tables", value:total,    pct:100,                      color:"bg-blue-600"   },
    { label:"Occupied",     value:occupied, pct:(occupied/total)*100,     color:"bg-red-500"    },
    { label:"Available",    value:available,pct:(available/total)*100,    color:"bg-green-500"  },
    { label:"Reserved",     value:reserved, pct:(reserved/total)*100,     color:"bg-yellow-400" },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-sm">
            <p className="text-[11px] sm:text-sm text-slate-500 font-medium">{s.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{s.value}</p>
            <div className="mt-2 sm:mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width:`${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search by Table...."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Area filters */}
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {(["All Tables","Indoor","Outdoor"] as const).map((f) => (
              <button key={f} onClick={() => setAreaFilter(f)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  areaFilter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}>
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            + Add New Table
          </button>
        </div>
      </div>

      {/* ── Tables Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map((table) => (
          <TableCard
            key={table.id} table={table}
            onAssign={(id)     => setAssignTableId(id)}
            onCheckIn={(id)    => handleCheckIn(id)}
            onViewOrder={(id)  => alert(`View order for ${id}`)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-3 text-center text-slate-400 text-sm py-12">No tables found.</p>
        )}
      </div>

      {/* ── Modals ── */}
      <AddTableModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTable}
      />
      <AssignGuestModal
        isOpen={!!assignTableId}
        tableId={assigningTable?.number ?? ""}
        onClose={() => setAssignTableId(null)}
        onConfirm={(data) => {
          if (assignTableId) handleAssign(assignTableId, data);
          setAssignTableId(null);
        }}
      />
    </div>
  );
}