import React, { useState, useRef, useEffect } from "react";
import { Bell, Calendar, ChevronDown, RefreshCw, User, Menu, Check, LogOut } from "lucide-react";
import { useBranches } from "../branches/hook/useBranches"; // عدّل المسار حسب مشروعك
import { useNavigate } from "react-router-dom";

interface TopbarProps {
  onMenuClick?: () => void;
  onLogout?: () => void;
  onBranchChange?: (branch: ApiBranch) => void;
}
/* ── Raw branch shape from API (exported as type to match type-only imports) ── */
export type ApiBranch = {
  id?: string;      // REST style
  _id?: string;     // Mongo style
  branchId?: number | string; // numeric id from API
  name: string;
};

/** Extract the string id from whichever field the API returns (robust ordering) */
export function getBranchId(branch: ApiBranch | undefined): string | undefined {
  if (!branch) return undefined;
  // Prefer `id` (REST), then `_id` (Mongo), then numeric branchId
  if (branch.id) return String(branch.id);
  if (branch._id) return String(branch._id);
  if (branch.branchId != null) return String(branch.branchId);
  return undefined;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick, onLogout, onBranchChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<ApiBranch | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useBranches();

  /* Normalise — API قد يرجع { data: [...] } أو array مباشرة */
  const apiBranches: ApiBranch[] = Array.isArray(data)
    ? (data as ApiBranch[])
    : Array.isArray((data as any)?.data)
    ? (data as any).data
    : [];
const navigate = useNavigate();
  const SAMPLE_BRANCHES: ApiBranch[] = [
    { _id: "1", name: "Downtown Branch" },
    { _id: "2", name: "Mansoura Branch" },
    { _id: "3", name: "Cairo Branch" },
    { _id: "4", name: "Alexandria Branch" },
  ];

  const branches: ApiBranch[] = apiBranches.length > 0 ? apiBranches : SAMPLE_BRANCHES;

  /* Auto-select first branch when data loads */
  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      const first = branches[0];
      setSelectedBranch(first);
      // eslint-disable-next-line no-console
      console.log("Topbar - auto-selected branch:", first);
      onBranchChange?.(first);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches]);

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [dropdownOpen]);

  const handleSelect = (branch: ApiBranch) => {
    setSelectedBranch(branch);
    setDropdownOpen(false);
    // eslint-disable-next-line no-console
    console.log("Topbar - user selected branch:", branch);
    onBranchChange?.(branch);
  };

  /* Today's date */
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="bg-white border-b border-gray-100 px-3 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4 flex-shrink-0">

      {/* ── Left ── */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburger */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <Menu size={18} />
          </button>
        )}

        <h1 className="text-sm sm:text-base font-bold text-gray-800 whitespace-nowrap">
          Store Overview
        </h1>

        {/* Branch Dropdown — hidden on xs */}
        <div ref={dropdownRef} className="hidden sm:block relative">
          {/* Trigger button */}
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-blue-400 hover:text-blue-600 transition-all bg-white"
          >
            <span>🏢</span>
            <span className="whitespace-nowrap max-w-[140px] truncate">
              {selectedBranch?.name ?? "Select Branch"}
            </span>
            <ChevronDown size={13} className={`transition-transform flex-shrink-0 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Custom dropdown list */}
          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
              {branches.map((branch) => {
                const key = branch._id ?? branch.id ?? branch.name;
                const isActive = selectedBranch?.name === branch.name;
                return (
                  <button
                    key={key}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(branch); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                      isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate">{branch.name}</span>
                    {isActive && <Check size={13} className="shrink-0 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Date */}
        <button className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
          <Calendar size={13} />
          <span>{today}</span>
        </button>

        {/* Refresh */}
        <button className="hidden sm:flex p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white">
          <RefreshCw size={15} />
        </button>

    {/* Bell */}
<div className="relative">
  <button
    onClick={() => navigate("/dashboard/notifications")}
    className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white"
  >
    <Bell size={15} />
  </button>
  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
</div>
        {/* User */}
        <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white">
          <User size={15} />
        </button>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 border border-gray-200 rounded-lg text-red-400 hover:text-red-600 hover:border-red-300 transition-all bg-white"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;