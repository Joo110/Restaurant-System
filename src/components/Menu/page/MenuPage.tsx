// src/components/Menu/page/MenuPage.tsx
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { ApiBranch } from "../../layout/Topbar";
import AddMenuItemModal from "../page/AddMenuItemModal";

/**
 * MenuPage now reads the selected branch from the DashboardLayout Outlet context.
 * This ensures the Topbar (in the layout) and pages share the same selected branch.
 */

type LayoutContext = {
  activeBranch?: ApiBranch | null;
};

export default function MenuPage() {
  const { activeBranch } = useOutletContext<LayoutContext>();

  // extract id from activeBranch (may be undefined)
  const selectedBranchId =
    activeBranch?.id ??
    activeBranch?._id ??
    (activeBranch?.branchId != null ? String(activeBranch.branchId) : undefined);

  const [addOpen, setAddOpen] = useState(false);

  // DEBUG: print to help debugging selection flow
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("MenuPage - activeBranch (from layout):", activeBranch);
    // eslint-disable-next-line no-console
    console.log("MenuPage - selectedBranchId (derived):", selectedBranchId);
  }, [activeBranch, selectedBranchId]);

  const handleOpenAdd = () => {
    const branchId =
      activeBranch?.id ?? activeBranch?._id ?? (activeBranch?.branchId != null ? String(activeBranch.branchId) : undefined);

    if (!branchId) {
      alert("Please select a branch before adding an item.");
      return;
    }
    console.log("Opening Add Modal — branchId:", branchId);
    setAddOpen(true);
  };

  return (
    <>
      <main className="p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Add Menu Item
          </button>

          <div className="text-sm text-gray-600">
            Selected branch:{" "}
            <strong>{activeBranch?.name ?? "None"}</strong>
            {selectedBranchId ? (
              <span className="ml-2 text-xs text-gray-500">({selectedBranchId})</span>
            ) : null}
          </div>
        </div>
      </main>

      {/* Modal: نمرّر branchId كنص (أو undefined إذا مافيش) */}
      {addOpen && (
        <AddMenuItemModal
          onClose={() => setAddOpen(false)}
          branchId={selectedBranchId}
        />
      )}
    </>
  );
}