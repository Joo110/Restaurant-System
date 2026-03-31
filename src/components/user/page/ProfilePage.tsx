// src/components/user/page/ProfilePage.tsx
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  User2,
  CalendarDays,
} from "lucide-react";

import UpdatePasswordModal from "./Updatepasswordmodal";
import { useBranch } from "../../branches/hook/useBranch";

type BranchAddress = {
  street?: string;
  city?: string;
  country?: string;
};

type BranchDetails = {
  name?: string;
  branchId?: string | number;
  isActive?: boolean;
  address?: BranchAddress;
  phone?: string;
  email?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
};

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function InfoCell({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border ${
        highlight ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-100"
      }`}
    >
      <span
        className={`mt-0.5 flex-shrink-0 ${
          highlight ? "text-blue-500" : "text-gray-400"
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase font-semibold tracking-wider text-gray-400 mb-0.5">
          {label}
        </p>
        <div
          className={`text-sm font-semibold leading-snug break-all ${
            highlight ? "text-blue-700" : "text-gray-800"
          }`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

function getBranchData(rawBranch: unknown): BranchDetails | null {
  if (!rawBranch) return null;

  if (typeof rawBranch === "object" && rawBranch !== null && "data" in rawBranch) {
    const data = (rawBranch as { data?: BranchDetails }).data;
    return data ?? null;
  }

  return rawBranch as BranchDetails;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const branchId = (location.state as { branchId?: string } | null)?.branchId;

  const { data: rawBranch, isLoading, isError } = useBranch(branchId);
  const branch = getBranchData(rawBranch);

  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarUrl(URL.createObjectURL(file));
  };

  const fmtDate = (iso?: string) => {
    if (!iso) return "-";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-EG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const cityText = branch?.address
    ? [branch.address.city, branch.address.country].filter(Boolean).join(", ")
    : "-";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {showPassModal && (
        <UpdatePasswordModal
          onClose={() => setShowPassModal(false)}
          onSubmit={async (cur, np) => {
            await new Promise((r) => setTimeout(r, 800));
            console.log("pwd", { cur, np });
          }}
        />
      )}

      <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-2">
        <nav className="text-xs text-gray-400 flex items-center gap-1">
          <button
            onClick={() => navigate("/")}
            className="hover:text-blue-600 transition"
          >
            {t("profile.breadcrumb.home")}
          </button>
          <span>/</span>
          <button
            onClick={() => navigate("/staff")}
            className="hover:text-blue-600 transition"
          >
            {t("profile.breadcrumb.staff")}
          </button>
          <span>/</span>
          <span className="text-blue-600 font-semibold">
            {t("profile.breadcrumb.profile")}
          </span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 flex flex-col lg:flex-row gap-5">
        <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-slate-800 to-slate-600 relative">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md overflow-hidden cursor-pointer group relative"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <User2 size={32} className="text-slate-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold tracking-wide">
                      CHANGE
                    </span>
                  </div>
                </div>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="pt-12 pb-5 px-5 text-center">
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-32 mx-auto mb-2" />
                  <Skeleton className="h-5 w-20 mx-auto" />
                </>
              ) : branch ? (
                <>
                  <h3 className="font-bold text-gray-900 text-base leading-snug">
                    {branch.name ?? "-"}
                  </h3>

                  <span
                    className={`inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                      branch.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {branch.isActive ? (
                      <CheckCircle2 size={10} />
                    ) : (
                      <XCircle size={10} />
                    )}
                    {branch.isActive ? "Active" : "Inactive"}
                  </span>
                </>
              ) : !branchId ? (
                <p className="text-sm text-gray-400 mt-2">No branch selected</p>
              ) : null}

              {branch && (
                <div className="mt-5 space-y-3 text-left">
                  {[
                    {
                      icon: <Hash size={12} className="text-blue-500" />,
                      bg: "bg-blue-50",
                      label: "Branch ID",
                      val: branch.branchId ? `#${branch.branchId}` : "-",
                    },
                    {
                      icon: <MapPin size={12} className="text-purple-500" />,
                      bg: "bg-purple-50",
                      label: "City",
                      val: cityText,
                    },
                    {
                      icon: <Phone size={12} className="text-orange-500" />,
                      bg: "bg-orange-50",
                      label: "Phone",
                      val: branch.phone ?? "-",
                    },
                    {
                      icon: <Mail size={12} className="text-emerald-600" />,
                      bg: "bg-emerald-50",
                      label: "Email",
                      val: branch.email ?? "-",
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg ${row.bg} flex items-center justify-center flex-shrink-0`}
                      >
                        {row.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                          {row.label}
                        </p>
                        <p className="text-xs font-semibold text-gray-700 truncate">
                          {row.val}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {branch?.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <FileText size={12} className="text-amber-600" />
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  Notes
                </p>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {branch.notes}
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <SectionHeader
                title="Branch Details"
                sub="Information about your current branch"
              />
              {isLoading && (
                <Loader2 size={15} className="animate-spin text-gray-300" />
              )}
              {isError && (
                <span className="text-xs text-red-400 font-semibold">
                  ⚠ Failed to load
                </span>
              )}
            </div>

            {!branchId && !isLoading && (
              <div className="flex flex-col items-center justify-center py-14 border border-dashed border-gray-200 rounded-xl text-center">
                <Building2 size={40} className="text-gray-200 mb-3" />
                <p className="text-sm font-semibold text-gray-400">
                  No branch selected
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  Select a branch from the top bar and open profile again
                </p>
              </div>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[72px]" />
                ))}
              </div>
            )}

            {!isLoading && branch && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCell
                  icon={<Building2 size={15} />}
                  label="Branch Name"
                  value={branch.name ?? "-"}
                  highlight
                />
                <InfoCell
                  icon={<Hash size={15} />}
                  label="Branch ID"
                  value={branch.branchId ? `#${branch.branchId}` : "-"}
                />
                <InfoCell
                  icon={<MapPin size={15} />}
                  label="Address"
                  value={
                    <span>
                      {branch.address?.street ?? "-"}
                      <br />
                      <span className="text-gray-500 font-normal text-xs">
                        {cityText}
                      </span>
                    </span>
                  }
                />
                <InfoCell
                  icon={<Phone size={15} />}
                  label="Phone"
                  value={branch.phone ?? "-"}
                />
                <InfoCell
                  icon={<Mail size={15} />}
                  label="Email"
                  value={
                    branch.email ? (
                      <a
                        href={`mailto:${branch.email}`}
                        className="hover:text-blue-600 transition-colors break-all"
                      >
                        {branch.email}
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
                <InfoCell
                  icon={
                    branch.isActive ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <XCircle size={15} />
                    )
                  }
                  label="Status"
                  value={
                    <span
                      className={`inline-flex items-center gap-1.5 ${
                        branch.isActive ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          branch.isActive ? "bg-green-500" : "bg-red-400"
                        }`}
                      />
                      {branch.isActive ? "Active" : "Inactive"}
                    </span>
                  }
                />
                <InfoCell
                  icon={<User2 size={15} />}
                  label="Created By"
                  value={branch.createdBy ?? "-"}
                />
                <InfoCell
                  icon={<CalendarDays size={15} />}
                  label="Created At"
                  value={fmtDate(branch.createdAt)}
                />

                {branch.notes && (
                  <div className="sm:col-span-2">
                    <InfoCell
                      icon={<FileText size={15} />}
                      label="Notes"
                      value={
                        <span className="font-normal text-gray-600 leading-relaxed">
                          {branch.notes}
                        </span>
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}