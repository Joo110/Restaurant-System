// src/components/layout/Topbar.tsx
import { useState, useRef, useEffect } from "react";
import {
  Bell, Calendar, ChevronDown, RefreshCw, User,
  Menu, Check, LogOut,
} from "lucide-react";
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
  if (branch.id)               return String(branch.id);
  if (branch._id)              return String(branch._id);
  if (branch.branchId != null) return String(branch.branchId);
  return undefined;
}

function getAuthUser(): {
  role?: string;
  branchId?: string;
  name?: string;
} | null {
  try {
    const raw = Cookies.get("authUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ─── Language Toggle ─────────────────────────────────────────────────────── */
const LanguageToggle: React.FC<{ isAr: boolean; onToggle: () => void }> = ({
  isAr,
  onToggle,
}) => (
  <button
    onClick={onToggle}
    title={isAr ? "Switch to English" : "التبديل للعربية"}
    aria-label="Toggle language"
    style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      width: "72px",
      height: "36px",
      borderRadius: "999px",
      border: "1.5px solid #e2e8f0",
      background: isAr
        ? "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)"
        : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      cursor: "pointer",
      padding: "3px",
      transition: "background 0.35s ease, border-color 0.35s ease",
      boxShadow: isAr
        ? "0 2px 8px rgba(37,99,235,0.25)"
        : "0 1px 4px rgba(0,0,0,0.06)",
      overflow: "hidden",
    }}
  >
    <span
      style={{
        position: "absolute", left: "10px", fontSize: "10px", fontWeight: 700,
        letterSpacing: "0.04em",
        color: isAr ? "rgba(255,255,255,0.55)" : "rgba(100,116,139,0.5)",
        transition: "color 0.3s", userSelect: "none",
      }}
    >
      ع
    </span>
    <span
      style={{
        position: "absolute", right: "9px", fontSize: "10px", fontWeight: 700,
        letterSpacing: "0.06em",
        color: isAr ? "rgba(255,255,255,0.55)" : "rgba(100,116,139,0.5)",
        transition: "color 0.3s", userSelect: "none",
      }}
    >
      EN
    </span>
    <span
      style={{
        position: "absolute",
        top: "3px",
        left: isAr ? "3px" : "calc(100% - 33px)",
        width: "30px",
        height: "28px",
        borderRadius: "999px",
        background: isAr
          ? "rgba(255,255,255,1)"
          : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px",
        fontWeight: 800,
        color: isAr ? "#1e40af" : "#fff",
        boxShadow: isAr
          ? "0 2px 6px rgba(30,64,175,0.2)"
          : "0 2px 6px rgba(37,99,235,0.4)",
        transition:
          "left 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.3s",
        userSelect: "none",
      }}
    >
      {isAr ? "ع" : "EN"}
    </span>
  </button>
);

/* ─── Main Topbar ─────────────────────────────────────────────────────────── */
const Topbar: React.FC<TopbarProps> = ({
  onMenuClick,
  onLogout,
  onBranchChange,
}) => {
  const { t, i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<ApiBranch | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate    = useNavigate();

  const { data } = useBranches();
  const authUser  = getAuthUser();

  // ── Role flags ──────────────────────────────────────────────────────────────
  const isManager        = authUser?.role === "manager";
  // "general-manager" sees the profile icon; "manager" does NOT
  const showProfileIcon  = authUser?.role !== "manager";

  const isAr = i18n.language === "ar";

  const apiBranches: ApiBranch[] = Array.isArray(data)
    ? (data as ApiBranch[])
    : Array.isArray((data as any)?.data)
    ? (data as any).data
    : [];

  // Auto-select first branch
  useEffect(() => {
    if (apiBranches.length > 0 && !selectedBranch) {
      const first = apiBranches[0];
      setSelectedBranch(first);
      onBranchChange?.(first);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBranches]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setDropdownOpen(false);
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
    document.documentElement.dir  = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const today = new Date().toLocaleDateString(isAr ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const goToProfile = () => {
    const branchId = getBranchId(selectedBranch ?? undefined);
    navigate("/profile", { state: { branchId } });
  };

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

        {/* Branch Dropdown — hidden for manager */}
        {!isManager && (
          <div ref={dropdownRef} className="hidden sm:block relative">
            <button
              onClick={() => {
                if (apiBranches.length === 0) return;
                setDropdownOpen((o) => !o);
              }}
              disabled={apiBranches.length === 0}
              className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-blue-400 hover:text-blue-600 transition-all bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>🏢</span>
              <span className="whitespace-nowrap max-w-[140px] truncate">
                {selectedBranch?.name ?? t("selectBranch")}
              </span>
              <ChevronDown
                size={13}
                className={`transition-transform flex-shrink-0 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && apiBranches.length > 0 && (
              <div className="absolute left-0 top-full mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                {apiBranches.map((branch) => {
                  const key      = branch._id ?? branch.id ?? branch.name;
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
                      {isActive && (
                        <Check size={13} className="shrink-0 text-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
        <button className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
          <Calendar size={13} />
          <span>{today}</span>
        </button>

        <button className="hidden sm:flex p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white">
          <RefreshCw size={15} />
        </button>

        <LanguageToggle isAr={isAr} onToggle={toggleLang} />

        <div className="relative">
          <button
            onClick={() => navigate("/dashboard/notifications")}
            className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white"
          >
            <Bell size={15} />
          </button>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </div>

        {/* ✅ Profile icon — visible ONLY for non-manager roles (e.g. general-manager) */}
        {showProfileIcon && (
          <button
            onClick={goToProfile}
            className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white"
            title={t("myProfile")}
          >
            <User size={15} />
          </button>
        )}

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