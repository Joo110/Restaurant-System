import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Cookies from "js-cookie";
import type { ApiBranch } from "../../layout/Topbar";
import { getBranchId } from "../../layout/Topbar";
import AddMenuItemModal from "../page/AddMenuItemModal";
import MenuManagement from "../page/MenuManagement";

type LayoutContext = {
  activeBranch?: ApiBranch | null;
};

function getAuthUser(): { role?: string; branchId?: string; name?: string } | null {
  try {
    const raw = Cookies.get("authUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function MenuPage() {
  const { activeBranch } = useOutletContext<LayoutContext>();
  const [addOpen, setAddOpen] = useState(false);

  const authUser = getAuthUser();
  const isManager = authUser?.role === "manager";

  const selectedBranchId: string | undefined = isManager
    ? authUser?.branchId
    : getBranchId(activeBranch ?? undefined);

  useEffect(() => {
    console.log("MenuPage — activeBranch:", activeBranch);
    console.log("MenuPage — selectedBranchId:", selectedBranchId);
    console.log("MenuPage — isManager:", isManager);
  }, [activeBranch, selectedBranchId, isManager]);

  const handleOpenAdd = () => {
    setAddOpen(true);
  };

  return (
    <>
      <main className="p-4">
        <MenuManagement
          onAddItem={handleOpenAdd}
          onEditItem={(item) => console.log(item)}
          branchId={selectedBranchId}
        />
      </main>

      <AddMenuItemModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        branchId={selectedBranchId ?? ""}
      />
    </>
  );
}