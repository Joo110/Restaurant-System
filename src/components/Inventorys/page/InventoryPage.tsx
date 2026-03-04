// src/components/Inventory/page/InventoryPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RestockModal from "./RestockModal";
import ConfirmReorderModal from "./ConfirmReorderModal";
import { useInventory, deleteInventoryFn } from "../hook/useInventory";
import type { InventoryItem } from "../services/inventoryService";

/* ─── Real API shape ───────────────────────────────────────────────────────────
  item.id            string
  item.item          { id, name, price, category } | undefined   ← populated menu item
  item.unit          string
  item.currentQuantity  number
  item.targetQuantity   number
  item.supplier      { id, name } | null
  item.lastPrice     number
  item.expiryDate    string | null
  item.branch        string
─────────────────────────────────────────────────────────────────────────────── */

// ── helpers ──────────────────────────────────────────────────────────────────

function getStockPercent(current: number, target: number) {
  return Math.min((current / target) * 100, 100);
}

function getStatus(current: number, target: number): "critical" | "reorder" | "ok" {
  const pct = getStockPercent(current, target);
  if (pct <= 20) return "critical";
  if (pct <= 50) return "reorder";
  return "ok";
}

function getBarColor(status: "critical" | "reorder" | "ok") {
  if (status === "critical") return "bg-red-500";
  if (status === "reorder") return "bg-yellow-400";
  return "bg-green-500";
}

function getEmoji(name: string) {
  const n = (name ?? "").toLowerCase();
  if (n.includes("tomato")) return "🍅";
  if (n.includes("chicken")) return "🍗";
  if (n.includes("flour") || n.includes("bread")) return "🌾";
  if (n.includes("milk") || n.includes("dairy") || n.includes("cheese")) return "🧀";
  if (n.includes("beef") || n.includes("meat")) return "🥩";
  if (n.includes("fish") || n.includes("seafood")) return "🐟";
  if (n.includes("pepper") || n.includes("spice")) return "🌶️";
  if (n.includes("juice") || n.includes("drink") || n.includes("water")) return "🥤";
  return "🫙";
}

// Unwrap API envelope: handles { message, data, stats } shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapList(raw: any) {
  if (!raw) return { items: [], totalPages: 1, totalDocs: 0, stats: null };
  const items: InventoryItem[] = Array.isArray(raw.data) ? raw.data : [];
  const totalPages = raw.paginationResult?.totalPages ?? 1;
  const totalDocs  = raw.paginationResult?.totalDocs  ?? items.length;
  const stats      = raw.stats ?? null;
  return { items, totalPages, totalDocs, stats };
}

// ── Component ─────────────────────────────────────────────────────────────────

const STATUS_FILTERS = ["Total Items", "Critical Low", "Reorder soon"];

export default function InventoryPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Total Items");
  const [search, setSearch]             = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage]                 = useState(1);
  const [showRestock, setShowRestock]   = useState(false);
  const [reorderItem, setReorderItem]   = useState<InventoryItem | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  // debounce 400ms
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as unknown as { __st?: ReturnType<typeof setTimeout> }).__st);
    (window as unknown as { __st?: ReturnType<typeof setTimeout> }).__st = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const { data: raw, isLoading, isError, refetch } = useInventory({
    page,
    limit: 16,
    ...(debouncedSearch ? { keyword: debouncedSearch } : {}),
  });

  const { items, totalPages, totalDocs, stats } = unwrapList(raw);

  // local status filter (server filter not available for status)
  const filtered = items.filter((item) => {
    const pct = getStockPercent(item.currentQuantity ?? 0, item.targetQuantity ?? 1);
    if (activeFilter === "Critical Low") return pct <= 20;
    if (activeFilter === "Reorder soon") return pct > 20 && pct <= 50;
    return true;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this inventory item?")) return;
    setDeletingId(id);
    try {
      await deleteInventoryFn(id);
      refetch();
    } catch {
      alert("Failed to delete item. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Use server stats if available, otherwise compute locally
  const statCritical = stats?.critical ?? filtered.filter((i) => getStatus(i.currentQuantity ?? 0, i.targetQuantity ?? 1) === "critical").length;
  const statLow      = stats?.low      ?? filtered.filter((i) => getStatus(i.currentQuantity ?? 0, i.targetQuantity ?? 1) === "reorder").length;
  const statExpiring = stats?.expiringSoon ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-4 font-sans">

      {/* Stats bar — only shown when server provides stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Total Items",    value: totalDocs,    color: "text-slate-800" },
            { label: "Critical",       value: statCritical, color: "text-red-500"   },
            { label: "Low Stock",      value: statLow,      color: "text-yellow-500"},
            { label: "Expiring Soon",  value: statExpiring, color: "text-orange-500"},
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
              <p className="text-xs text-slate-400 mb-0.5">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search item..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 flex-shrink-0">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setActiveFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                activeFilter === f
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f}
              {f === "Total Items" && totalDocs > 0 && (
                <span className="ml-1 text-xs opacity-70">({totalDocs})</span>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:ml-auto">
          <button
            onClick={() => navigate("/dashboard/inventory/supplier-management")}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 font-medium whitespace-nowrap"
          >
            + Add Supplier
          </button>
          <button
            onClick={() => setShowRestock(true)}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap"
          >
            + Add Stock
          </button>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center justify-between">
          <span>Failed to load inventory.</span>
          <button onClick={refetch} className="underline font-medium">Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm animate-pulse">
              <div className="w-full h-24 bg-slate-100 rounded-lg mb-3" />
              <div className="h-3 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-2 bg-slate-100 rounded w-1/2 mb-3" />
              <div className="h-1.5 bg-slate-100 rounded-full mb-3" />
              <div className="h-7 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((inv) => {
              const id      = inv.id as string;
              const current = inv.currentQuantity ?? 0;
              const target  = inv.targetQuantity  ?? 1;
              const status  = getStatus(current, target);
              // item.item is the populated menu item; fallback to unit or id
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const menuItem = (inv as any).item as { name?: string; category?: string } | undefined;
              const itemName = menuItem?.name ?? "Unknown Item";
              const category = menuItem?.category ?? inv.unit ?? "—";

              // expiry warning
              const isExpiringSoon = inv.expiryDate
                ? (new Date(inv.expiryDate).getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000
                : false;

              return (
                <div
                  key={id}
                  className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer relative group"
                  onClick={() => navigate(`/dashboard/inventory/${id}`)}
                >
                  {/* Delete */}
                  <button
                    onClick={(e) => handleDelete(e, id)}
                    disabled={deletingId === id}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-50 text-red-400 text-xs hidden group-hover:flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50 z-10"
                    title="Delete item"
                  >
                    {deletingId === id ? "…" : "✕"}
                  </button>

                  {/* Expiry badge */}
                  {isExpiringSoon && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-semibold rounded-full z-10">
                      Expires soon
                    </span>
                  )}

                  {/* Icon */}
                  <div className="w-full h-20 sm:h-24 bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-3xl mt-1">
                    {getEmoji(itemName)}
                  </div>

                  <p className="font-semibold text-slate-800 text-sm truncate">{itemName}</p>
                  <p className="text-xs text-slate-400 mb-2 truncate capitalize">{category}</p>

                  <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                    <span className={`text-base sm:text-lg font-bold ${
                      status === "critical" ? "text-red-500" :
                      status === "reorder"  ? "text-yellow-500" : "text-slate-800"
                    }`}>
                      {current}
                      <span className="text-xs font-normal text-slate-400 ml-0.5">{inv.unit}</span>
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400">
                      / {target}{inv.unit}
                    </span>
                  </div>

                  {/* Stock bar */}
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all ${getBarColor(status)}`}
                      style={{ width: `${getStockPercent(current, target)}%` }}
                    />
                  </div>

                  {/* Supplier name */}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(inv as any).supplier?.name && (
                    <p className="text-[10px] text-slate-400 truncate mb-2">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      🚚 {(inv as any).supplier.name}
                    </p>
                  )}

                  {status === "ok" || status === "reorder" ? (
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="w-full py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors"
                    >
                      Details
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setReorderItem(inv); }}
                      className="w-full py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                    >
                      Reorder Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">
              No inventory items found
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showRestock && (
        <RestockModal
          onClose={() => setShowRestock(false)}
          onSuccess={() => { setShowRestock(false); refetch(); }}
        />
      )}
      {reorderItem && (
        <ConfirmReorderModal
          item={reorderItem}
          onClose={() => setReorderItem(null)}
          onSuccess={() => { setReorderItem(null); refetch(); }}
        />
      )}
    </div>
  );
}