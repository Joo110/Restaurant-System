import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Plus, Edit2, Trash2, X, RefreshCw, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useItems } from "../hook/useItems";
//import type { ItemsQueryParams } from "../services/itemService";
import { useDeleteItemMutation } from "../hook/useItemMutations";
import type { ApiBranch } from "../../layout/Topbar";

interface ApiItem {
  id: string;
  itemId: number;
  name: string;
  price: number;
  description: string;
  category: "starters" | "mains" | "desserts" | "drinks";
  isAvailable: boolean;
  image?: string;
  branch?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  id: number;
  _id: string;
  name: string;
  price: number;
  description: string;
  category: "Starters" | "Mains" | "Desserts" | "Drinks";
  available: boolean;
  image?: string;
  branch?: string;
  createdAt?: string;
  updatedAt?: string;
}

function normaliseItem(raw: ApiItem): MenuItem {
  const CAT_MAP: Record<string, MenuItem["category"]> = {
    starters: "Starters",
    mains: "Mains",
    desserts: "Desserts",
    drinks: "Drinks",
  };
  return {
    id: raw.itemId,
    _id: raw.id,
    name: raw.name,
    price: raw.price,
    description: raw.description,
    category: CAT_MAP[raw.category] ?? "Mains",
    available: raw.isAvailable,
    image: raw.image,
    branch: raw.branch,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

const CATEGORIES = ["All Items", "Starters", "Mains", "Desserts", "Drinks"] as const;
type Category = (typeof CATEGORIES)[number];

interface MenuManagementProps {
  onAddItem: () => void;
  onEditItem: (item: MenuItem) => void;
  branchId?: string;
  refreshTrigger?: number;
}

const CATEGORY_EMOJI: Record<string, string> = {
  Starters: "🥗",
  Mains: "🍽️",
  Desserts: "🍰",
  Drinks: "🥤",
};

const FoodImage = ({ category, image }: { category?: string; image?: string }) =>
  image ? (
    <div className="w-full h-28 sm:h-36 bg-gray-100 rounded-lg overflow-hidden">
      <img src={image} alt={category} className="w-full h-full object-cover" loading="lazy" decoding="async" />
    </div>
  ) : (
    <div className="w-full h-28 sm:h-36 bg-gray-100 rounded-lg" />
  );

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-100 p-2.5 sm:p-3 animate-pulse">
    <div className="w-full h-28 sm:h-36 bg-gray-200 rounded-lg mb-3" />
    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-100 rounded w-full mb-1" />
    <div className="h-3 bg-gray-100 rounded w-2/3 mb-3" />
    <div className="flex justify-between">
      <div className="h-3 bg-gray-200 rounded w-16" />
      <div className="flex gap-1">
        <div className="w-6 h-6 bg-gray-200 rounded-md" />
        <div className="w-6 h-6 bg-gray-200 rounded-md" />
      </div>
    </div>
  </div>
);

function buildPageWindow(currentPage: number, totalPages: number, maxVisible = 5) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  let end = start + maxVisible - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function MenuManagement({ onAddItem, onEditItem, branchId, refreshTrigger }: MenuManagementProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<Category>("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 12;

  const outlet = useOutletContext<{ activeBranch?: ApiBranch | null } | undefined>();
  const activeBranchFromOutlet = outlet?.activeBranch ?? null;

  const effectiveBranchId =
    branchId ??
    activeBranchFromOutlet?.id ??
    activeBranchFromOutlet?._id ??
    (activeBranchFromOutlet?.branchId != null ? String(activeBranchFromOutlet.branchId) : undefined);

  const { mutateAsync: deleteItem } = useDeleteItemMutation({
    onError: () => setDeletingId(null),
  });

  useEffect(() => {
    console.log("MenuManagement - received branchId (prop):", branchId);
    console.log("MenuManagement - activeBranchFromOutlet:", activeBranchFromOutlet);
    console.log("MenuManagement - effectiveBranchId (derived):", effectiveBranchId);
  }, [branchId, activeBranchFromOutlet, effectiveBranchId]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchQuery]);

  const handleDelete = async (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    if (!window.confirm(t("deleteItemConfirm", { name: item.name }))) return;
    setDeletingId(item._id);
    try {
      await deleteItem(item._id);
      if (selectedItem?._id === item._id) setSelectedItem(null);
    } finally {
      setDeletingId(null);
    }
  };

 const queryParams = useMemo(() => ({
  category:
    activeCategory !== "All Items"
      ? activeCategory.toLowerCase()
      : undefined,
  keyword: searchQuery.trim() || undefined,
  page,
  limit: PAGE_SIZE,
}), [activeCategory, searchQuery, page]);
  const { data, isLoading, isError, error, refetch } = useItems(queryParams);

  useEffect(() => {
    if (typeof refreshTrigger !== "undefined") {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const allItems: MenuItem[] = useMemo(
    () => ((data?.data ?? []) as ApiItem[]).map(normaliseItem),
    [data]
  );

  const items = allItems;

  const apiStats = data?.stats?.byCategory;
  const categoryCounts = useMemo(
    () => ({
      Starters: apiStats?.starters ?? allItems.filter((i) => i.category === "Starters").length,
      Mains: apiStats?.mains ?? allItems.filter((i) => i.category === "Mains").length,
      Desserts: apiStats?.desserts ?? allItems.filter((i) => i.category === "Desserts").length,
      Drinks: apiStats?.drinks ?? allItems.filter((i) => i.category === "Drinks").length,
    }),
    [apiStats, allItems]
  );

  const mostProfitableCategory = useMemo(() => {
    const entries = Object.entries(categoryCounts) as [string, number][];
    return entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0] ?? ["Mains", 0]);
  }, [categoryCounts]);

  const totalItems = allItems.length || 1;
  const mostProfitablePercent = Math.round(((mostProfitableCategory[1] as number) / totalItems) * 100);

  const unavailableItems = allItems.filter((i) => !i.available);

  const handleCardClick = (item: MenuItem) => {
    setSelectedItem((prev) => (prev?.id === item.id ? null : item));
  };

  const handleAddClick = () => {
    onAddItem();
  };

  const paginationMeta = (data as any)?.paginationResult ?? (data as any)?.pagination ?? (data as any)?.meta ?? {};
  const totalPages =
    paginationMeta?.totalPages ??
    paginationMeta?.pages ??
    Math.max(1, Math.ceil((paginationMeta?.totalDocs ?? paginationMeta?.total ?? items.length ?? 0) / PAGE_SIZE)) ??
    1;

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;
  const pageNumbers = buildPageWindow(page, totalPages, 5);

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden relative">
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <div className="relative w-full sm:w-56 flex-shrink-0">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("searchMenuItems")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-shrink-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {cat === "All Items" ? t("allItems") : t(cat.toLowerCase())}
                </button>
              ))}
            </div>

            <div className="sm:ml-auto flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                title={t("refresh")}
              >
                <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={handleAddClick}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                <Plus size={16} />
                {t("addNewItem")}
              </button>
            </div>
          </div>

          {isError && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-red-700">
              <AlertCircle size={18} className="shrink-0" />
              <div className="text-sm">
                <span className="font-semibold">{t("failedToLoadItems")}</span>{" "}
                {(error as Error)?.message ?? t("unknownError")}{" "}
                <button onClick={() => refetch()} className="underline font-medium hover:no-underline">
                  {t("tryAgain")}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleCardClick(item)}
                    className={`bg-white rounded-xl border p-2.5 sm:p-3 cursor-pointer transition-all ${
                      selectedItem?.id === item.id
                        ? "border-blue-400 ring-2 ring-blue-100"
                        : item.available
                          ? "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                          : "border-gray-200 opacity-70"
                    }`}
                  >
                    <FoodImage category={item.category} image={item.image} />
                    <div className="mt-2 sm:mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate flex-1 pr-1">
                          {item.name}
                        </span>
                        <span className="text-blue-600 font-bold text-xs sm:text-sm flex-shrink-0">
                          ${item.price}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 hidden sm:block">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-xs font-semibold ${
                            item.available ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {item.available ? t("available") : t("unavailable")}
                        </span>
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditItem(item);
                            }}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, item)}
                            disabled={deletingId === item._id}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          >
                            {deletingId === item._id ? (
                              <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

            {!isLoading && !isError && items.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                <span className="text-5xl mb-3">🍽️</span>
                <p className="text-sm font-medium">{t("noItemsFound")}</p>
                <p className="text-xs mt-1">{t("tryDifferentCategoryOrSearchTerm")}</p>
              </div>
            )}
          </div>

          {!isLoading && !isError && items.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3 flex-wrap border-t border-gray-100 pt-4">
              <p className="text-xs sm:text-sm text-gray-500">
                {t("showing")} <strong>{items.length}</strong> {t("of")}{" "}
                <strong>{(paginationMeta?.totalDocs ?? paginationMeta?.total ?? items.length) as number}</strong>
              </p>

              <div className="flex items-center gap-1">
                <button
                  disabled={!canGoPrev || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="w-7 h-7 rounded-lg text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  ‹
                </button>

                {pageNumbers.map((p) => (
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
                  disabled={!canGoNext || isLoading}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-7 h-7 rounded-lg text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedItem && (
        <>
          <aside className="hidden lg:flex w-64 bg-gray-900 text-white p-5 shrink-0 overflow-y-auto flex-col">
            <QuickStats
              selectedItem={selectedItem}
              categoryCounts={categoryCounts}
              mostProfitableCategory={mostProfitableCategory[0] as string}
              mostProfitablePercent={mostProfitablePercent}
              unavailableItems={unavailableItems}
              onClose={() => setSelectedItem(null)}
            />
          </aside>

          <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-gray-900 text-white rounded-t-2xl p-5 shadow-2xl max-h-[70vh] overflow-y-auto">
            <QuickStats
              selectedItem={selectedItem}
              categoryCounts={categoryCounts}
              mostProfitableCategory={mostProfitableCategory[0] as string}
              mostProfitablePercent={mostProfitablePercent}
              unavailableItems={unavailableItems}
              onClose={() => setSelectedItem(null)}
            />
          </div>
        </>
      )}
    </div>
  );
}

function QuickStats({
  selectedItem,
  categoryCounts,
  mostProfitableCategory,
  mostProfitablePercent,
  unavailableItems,
  onClose,
}: {
  selectedItem: MenuItem;
  categoryCounts: Record<string, number>;
  mostProfitableCategory: string;
  mostProfitablePercent: number;
  unavailableItems: MenuItem[];
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-bold">{t("quickStats")}</h2>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white rounded-md transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-4">{t("mostProfitable")}</p>

      <div className="bg-gray-800 rounded-xl p-3 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-gray-700 overflow-hidden flex items-center justify-center text-lg shrink-0">
            {selectedItem.image ? (
              <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
            ) : (
              CATEGORY_EMOJI[selectedItem.category] ?? "🍴"
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{selectedItem.name}</div>
            <div className={`text-[10px] mt-0.5 font-medium ${selectedItem.available ? "text-green-400" : "text-red-400"}`}>
              {selectedItem.available ? t("available") : t("unavailable")} · ${selectedItem.price}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] text-gray-400">{t("category")}:</span>
          <span className="text-[10px] font-semibold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
            {t(selectedItem.category.toLowerCase())}
          </span>
        </div>

        {selectedItem.description && (
          <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">
            {selectedItem.description}
          </p>
        )}

        <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">{t("price")}</span>
          <span className="text-base font-bold text-blue-400">${selectedItem.price}</span>
        </div>
      </div>

      <div className="mb-5">
        <div className="text-xl font-bold mb-1">{t(mostProfitableCategory.toLowerCase())}</div>
        <div className="text-blue-400 font-semibold text-sm mb-2">
          {mostProfitablePercent}% {t("ofTotalItems")}
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${mostProfitablePercent}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs text-gray-400 mb-3">{t("itemCountByCategory")}</p>
        <div className="flex flex-col gap-2">
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <div key={cat} className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span>{CATEGORY_EMOJI[cat] ?? "🍴"}</span>
                {t(cat.toLowerCase())}
              </span>
              <span className="font-bold text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-3">
          {t("currentlyUnavailable")}{" "}
          {unavailableItems.length > 0 && (
            <span className="text-red-400 font-semibold">({unavailableItems.length})</span>
          )}
        </p>
        {unavailableItems.length === 0 ? (
          <p className="text-xs text-gray-500 italic">{t("allItemsAreAvailable")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {unavailableItems.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-xl p-3 flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-sm shrink-0">
                  {CATEGORY_EMOJI[item.category] ?? "🍴"}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold">{item.name}</div>
                  <div className="text-[10px] text-red-400 mt-0.5">
                    ${item.price} · {t(item.category.toLowerCase())}
                  </div>
                  {item.description && (
                    <div className="text-[10px] text-gray-500 mt-0.5 truncate">{item.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}