// src/components/Inventory/page/SupplierManagement.tsx
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import AddSupplierModal from "./Addsuppliermodal";
import EditSupplierModal from "./Editsuppliermodal";
import { useSuppliers, deleteSupplierFn } from "../hook/useSuppliers";
import type { Supplier } from "../services/supplierService";

export default function SupplierManagement() {
  const { t } = useTranslation();

  const [search,        setSearch]        = useState("");
  const [showAdd,       setShowAdd]       = useState(false);
  const [editSupplier,  setEditSupplier]  = useState<Supplier | null>(null);
  const [activeFilter,  setActiveFilter]  = useState("all");
  const [deletingId,    setDeletingId]    = useState<string | null>(null);
  const [page,          setPage]          = useState(1);

  const queryParams = {
    page,
    limit: 20,
    ...(search ? { keyword: search } : {}),
  };

  const { data, isLoading, isError, refetch } = useSuppliers(queryParams);
  const suppliers: Supplier[] = data?.data ?? [];

  const filtered = suppliers.filter((s) => {
    if (activeFilter === "active")   return s.status === "Active";
    if (activeFilter === "inactive") return s.status === "Inactive";
    return true;
  });

  const totalDocs    = data?.paginationResult?.totalDocs   ?? suppliers.length;
  const totalPages   = data?.paginationResult?.totalPages  ?? 1;
  const activeCount  = suppliers.filter((s) => s.status === "Active").length;
  const inactiveCount = suppliers.filter((s) => s.status === "Inactive").length;
  const totalItems   = suppliers.reduce((a, s) => a + (s.itemsSupplied ?? 0), 0);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this supplier?")) return;
      setDeletingId(id);
      try {
        await deleteSupplierFn(id);
        refetch();
      } catch {
        alert("Failed to delete supplier. Please try again.");
      } finally {
        setDeletingId(null);
      }
    },
    [refetch]
  );

  return (
    <div className="min-h-screen bg-slate-50 p-5 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t("supplierManagement")}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{t("supplierManagementSubtitle")}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          {t("addSupplier")}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: t("totalSuppliers"),    value: totalDocs,     color: "text-slate-800" },
          { label: t("active"),            value: activeCount,   color: "text-green-600" },
          { label: t("inactive"),          value: inactiveCount, color: "text-red-500"   },
          { label: t("totalItemsSupplied"), value: totalItems,   color: "text-blue-600"  },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            placeholder={t("searchSupplier")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: "all",      label: t("all")      },
            { key: "active",   label: t("active")   },
            { key: "inactive", label: t("inactive") },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === f.key
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center justify-between">
          <span>{t("failedToLoadSuppliers")}</span>
          <button onClick={refetch} className="underline font-medium">{t("retry")}</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            <svg className="animate-spin mx-auto mb-3 w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {t("loadingSuppliers")}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr className="text-slate-500 font-semibold text-xs uppercase tracking-wide">
                <th className="py-3 px-5 text-left">{t("supplierCol")}</th>
                <th className="py-3 px-5 text-left">{t("contactCol")}</th>
                <th className="py-3 px-5 text-left">{t("categoriesCol")}</th>
                <th className="py-3 px-5 text-left">{t("bankCol")}</th>
                <th className="py-3 px-5 text-left">{t("itemsCol")}</th>
                <th className="py-3 px-5 text-left">{t("statusCol")}</th>
                <th className="py-3 px-5 text-left">{t("actionsCol")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const id   = (s.id ?? s._id) as string;
                const cats: string[] = Array.isArray(s.categories)
                  ? s.categories
                  : typeof s.categories === "string"
                    ? s.categories.split("/").map((c: string) => c.trim()).filter(Boolean)
                    : [];

                return (
                  <tr key={id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-slate-800">{s.companyName}</p>
                      <p className="text-xs text-slate-400">{s.email}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="text-slate-700">{s.mainContact}</p>
                      <p className="text-xs text-slate-400">{s.supportPhone}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-wrap gap-1">
                        {cats.slice(0, 2).map((c) => (
                          <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                            {c}
                          </span>
                        ))}
                        {cats.length > 2 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
                            +{cats.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">{s.bank?.name ?? "—"}</td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-slate-700">{s.itemsSupplied ?? 0}</span>
                      <span className="text-xs text-slate-400 ml-1">{t("items")}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        s.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {s.status ?? "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditSupplier(s)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          {t("editBtn")}
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          disabled={deletingId === id}
                          className="px-3 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingId === id ? "..." : t("deleteBtn")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            {t("noSuppliersFound")}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-400">
            {t("page")} {page} {t("of")} {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              {t("prev")}
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AddSupplierModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); refetch(); }}
        />
      )}
      {editSupplier && (
        <EditSupplierModal
          supplier={editSupplier}
          onClose={() => setEditSupplier(null)}
          onSuccess={() => { setEditSupplier(null); refetch(); }}
        />
      )}
    </div>
  );
}