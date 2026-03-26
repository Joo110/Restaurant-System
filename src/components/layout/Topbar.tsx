import { useState, useRef, useEffect } from "react";
import { Bell, Calendar, ChevronDown, RefreshCw, User, Menu, Check, LogOut } from "lucide-react";
import { useBranches } from "../branches/hook/useBranches";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

interface TopbarProps {
  onMenuClick?: () => void;
  onLogout?: () => void;
  onBranchChange?: (branch: ApiBranch) => void;
}

export type ApiBranch = {
  id?: string;
  _id?: string;
  branchId?: number | string;
  name: string;
};

export function getBranchId(branch: ApiBranch | undefined): string | undefined {
  if (!branch) return undefined;
  if (branch.id) return String(branch.id);
  if (branch._id) return String(branch._id);
  if (branch.branchId != null) return String(branch.branchId);
  return undefined;
}

function getAuthUser(): { role?: string; branchId?: string; name?: string } | null {
  try {
    const raw = Cookies.get("authUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick, onLogout, onBranchChange }) => {
  const { t, i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<ApiBranch | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data } = useBranches();

  const authUser = getAuthUser();
  const isManager = authUser?.role === "manager";
  const isAr = i18n.language === "ar";

  const apiBranches: ApiBranch[] = Array.isArray(data)
    ? (data as ApiBranch[])
    : Array.isArray((data as any)?.data)
    ? (data as any).data
    : [];

  const branches: ApiBranch[] = apiBranches;

  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      const first = branches[0];
      setSelectedBranch(first);
      onBranchChange?.(first);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches]);

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
    onBranchChange?.(branch);
  };

  const toggleLang = () => {
    const newLang = isAr ? "en" : "ar";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const today = new Date().toLocaleDateString(isAr ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="bg-white border-b border-gray-100 px-3 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4 flex-shrink-0">
      {/* ── Left ── */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <Menu size={18} />
          </button>
        )}

        <h1 className="text-sm sm:text-base font-bold text-gray-800 whitespace-nowrap">
          {t("storeOverview")}
        </h1>

        {/* Branch Dropdown */}
        {!isManager && (
          <div ref={dropdownRef} className="hidden sm:block relative">
            <button
              onClick={() => {
                if (branches.length === 0) return;
                setDropdownOpen((o) => !o);
              }}
              disabled={branches.length === 0}
              className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-blue-400 hover:text-blue-600 transition-all bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>🏢</span>
              <span className="whitespace-nowrap max-w-[140px] truncate">
                {selectedBranch?.name ?? t("selectBranch")}
              </span>
              <ChevronDown
                size={13}
                className={`transition-transform flex-shrink-0 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && branches.length > 0 && (
              <div className="absolute left-0 top-full mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                {branches.map((branch) => {
                  const key = branch._id ?? branch.id ?? branch.name;
                  const isActive = selectedBranch?.name === branch.name;
                  return (
                    <button
                      key={key}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(branch);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
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
        )}

        {/* Manager label */}
        {isManager && authUser?.name && (
          <span className="hidden sm:flex items-center gap-2 text-sm text-gray-500 border border-gray-100 rounded-lg px-3 py-1.5 bg-gray-50">
            <span>🏢</span>
            <span className="whitespace-nowrap max-w-[140px] truncate text-gray-600 font-medium">
              {authUser.name}
            </span>
          </span>
        )}
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

        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-all bg-white text-xs font-bold w-9 h-9 flex items-center justify-center"
          title={isAr ? t("switchToEnglish") : t("switchToArabic")}
        >
          {isAr ? "EN" : "عر"}
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

        {/* User → Profile */}
        <button
          onClick={() => navigate("/profile")}
          className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white"
          title={t("myProfile")}
        >
          <User size={15} />
        </button>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            title={t("logout")}
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