import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Plus, MapPin, TrendingUp, Trash2 } from "lucide-react";
import AddBranchModal from "../page/Addbranchmodal";
import { useBranches } from "../hook/useBranches";
import { useDeleteBranchMutation } from "../hook/useDeleteBranchMutation";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Branch type for UI mapping (kept same as before) ──────────────────────────
interface BranchUI {
  id?: string;
  name: string;
  location: string;
  revenue: string;
  orders: number;
  revenueGrowth: string;
  ordersGrowth: string;
  occupancy: number;
}

// ── Branch Card ───────────────────────────────────────────────────────────────
const BranchCard = ({
  branch,
  onClick,
  onDelete,
  deleting,
}: {
  branch: BranchUI;
  onClick: () => void;
  onDelete: () => void;
  deleting: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer"
    >
      {/* delete button - small and unobtrusive */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-md bg-red-50 hover:bg-red-100 text-red-600"
        aria-label={t("deleteBranchAria", { name: branch.name })}
        title={t("delete")}
        disabled={deleting}
      >
        {deleting ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        ) : (
          <Trash2 size={14} />
        )}
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-xl">🏪</span>
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm sm:text-base">{branch.name}</p>
          <p className="text-xs text-blue-500 flex items-center gap-1">
            <MapPin size={10} /> {branch.location}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">{t("dailyRevenue")}</p>
          <p className="text-xl font-bold text-gray-900">{branch.revenue}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <TrendingUp size={10} className="text-blue-500" />
            <span className="text-xs text-blue-500 font-semibold">{branch.revenueGrowth}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">{t("totalOrders")}</p>
          <p className="text-xl font-bold text-gray-900">{branch.orders}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <TrendingUp size={10} className="text-blue-500" />
            <span className="text-xs text-blue-500 font-semibold">{branch.ordersGrowth}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-50 pt-3">
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{t("occupancy")}</p>
          <p className="text-xs font-bold text-gray-600">{branch.occupancy}%</p>
        </div>
        <div className="h-2 bg-gray-100 rounded-full">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${branch.occupancy}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BranchesOverview() {
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { data, isError, error, refetch } = useBranches();

  // delete mutation hook (تُفترض موجودة عندك)
  const { mutateAsync: deleteBranchById, isLoading: isDeleting } =
    useDeleteBranchMutation({
      onError: (err) => {
        // eslint-disable-next-line no-console
        console.error("Delete branch error:", err);
      },
      onSuccess: () => {
        if (typeof refetch === "function") refetch();
      },
    });

  // ===== تحويل الداتا الواردة من السيرفر للشكل المتوقع للواجهة =====
  // data يتوقع الشكل: { message, stats, data: [ ...branches ], results, paginationResult }
  const remote = data ?? null;

  let remoteArray: any[] = [];

  if (remote && Array.isArray(remote.data)) {
    remoteArray = remote.data;
  } else {
    remoteArray = [];
  }

  const mapToBranch = (b: any, idx: number): BranchUI => {
    // name
    const name = b?.name ?? b?.title ?? `${t("branch")} ${idx + 1}`;

    // id
    const id = b?.id ?? b?._id ?? undefined;

    // location from address object if present
    let location = "";
    if (typeof b?.address === "object" && b.address !== null) {
      const street = b.address.street ?? "";
      const city = b.address.city ?? "";
      const country = b.address.country ?? "";
      const parts = [street, city].filter(Boolean);
      location = parts.join(", ");
      if (!location && country) location = country;
    } else if (typeof b?.location === "string") {
      location = b.location;
    } else if (typeof b?.address === "string") {
      location = b.address;
    } else {
      location = b?.city ?? b?.cityName ?? "";
    }

    // stats possibly nested under b.stats
    const stats = b?.stats ?? {};

    const dailyRevenueRaw = stats?.dailyRevenue ?? b?.dailyRevenue ?? b?.revenue ?? 0;
    const revenue =
      typeof dailyRevenueRaw === "number"
        ? `$${dailyRevenueRaw}`
        : (dailyRevenueRaw ?? "$0");

    const orders = Number(stats?.totalOrders ?? b?.totalOrders ?? b?.orders ?? 0) || 0;

    const revenueChangeRaw = stats?.revenueChange ?? b?.revenueChange ?? b?.revenueGrowth ?? 0;
    const revenueGrowth =
      typeof revenueChangeRaw === "number" ? `${revenueChangeRaw}%` : (revenueChangeRaw ?? "0%");

    const ordersChangeRaw = stats?.ordersChange ?? b?.ordersChange ?? b?.ordersGrowth ?? 0;
    const ordersGrowth =
      typeof ordersChangeRaw === "number" ? `${ordersChangeRaw}%` : (ordersChangeRaw ?? "0%");

    const occupancy = Number(stats?.occupancy ?? b?.occupancy ?? 0) || 0;

    return {
      id,
      name,
      location,
      revenue,
      orders,
      revenueGrowth,
      ordersGrowth,
      occupancy,
    };
  };

  // استخدم الداتا من الـ API (remoteArray) وخريطة العناصر للعرض
  const branchesSource: BranchUI[] = remoteArray.map(mapToBranch);

  // فلترة البحث
  const filtered = branchesSource.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase())
  );

  // optional: سجل الخطأ بالكونسول بس دون تغيير الواجهة
  if (isError) {
    // eslint-disable-next-line no-console
    console.error("Branches fetch error:", error);
  }

  // handle delete action
  const handleDelete = async (id?: string, name?: string) => {
    if (!id) {
      // eslint-disable-next-line no-console
      console.warn("No id provided for delete");
      return;
    }
    const confirmMsg = t("deleteBranchConfirm", { name: name ?? id });
    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteBranchById(id);
      if (typeof refetch === "function") refetch();
    } catch (err) {
      // basic user feedback - you can replace with toast
      // eslint-disable-next-line no-alert, no-console
      alert(t("failedToDeleteBranch"));
      // eslint-disable-next-line no-console
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t("branchesOverview")}</h2>
        <p className="text-sm text-gray-400 mt-0.5">{t("branchesOverviewDescription")}</p>
      </div>

      {/* Search + Add */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder={t("searchBranchesPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <Plus size={16} /> {t("addNewBranch")}
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-5xl mb-3">🏪</span>
          <p className="font-semibold">{t("noBranchesFound")}</p>
          <p className="text-sm mt-1">{t("tryDifferentSearchTerm")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b, i) => (
            <BranchCard
              key={`${b.id ?? b.name}-${i}`}
              branch={b}
              onClick={() => {}}
              onDelete={() => handleDelete(b.id, b.name)}
              deleting={isDeleting}
            />
          ))}
        </div>
      )}

      {/* Modal: مررنا onCreated عشان يعمل refetch بعد الاضافة */}
      {showModal && (
        <AddBranchModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            if (typeof refetch === "function") refetch();
          }}
        />
      )}
    </div>
  );
}