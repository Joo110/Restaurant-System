// src/components/profile/UpdatePasswordModal.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, X, Lock } from "lucide-react";

interface UpdatePasswordModalProps {
  onClose: () => void;
  onSubmit?: (current: string, newPass: string) => Promise<void>;
}

interface FormState { current: string; newPass: string; confirm: string }
interface FormErrors { current?: string; newPass?: string; confirm?: string }

function validate(f: FormState, t: (key: string) => string): FormErrors {
  const e: FormErrors = {};
  if (!f.current.trim()) e.current = t("profile.updatePasswordModal.validation.currentRequired");
  if (!f.newPass.trim()) e.newPass = t("profile.updatePasswordModal.validation.newRequired");
  else if (f.newPass.length < 8) e.newPass = t("profile.updatePasswordModal.validation.minLength");
  if (!f.confirm.trim()) e.confirm = t("profile.updatePasswordModal.validation.confirmRequired");
  else if (f.confirm !== f.newPass) e.confirm = t("profile.updatePasswordModal.validation.passwordsDoNotMatch");
  return e;
}

function strengthLevel(
  p: string,
  t: (key: string) => string
): { level: number; label: string; color: string } {
  if (!p) return { level: 0, label: "", color: "" };
  if (p.length < 6) return { level: 1, label: t("profile.updatePasswordModal.strength.weak"), color: "bg-red-400" };
  if (p.length < 10) return { level: 2, label: t("profile.updatePasswordModal.strength.medium"), color: "bg-amber-400" };
  return { level: 3, label: t("profile.updatePasswordModal.strength.strong"), color: "bg-emerald-500" };
}

export default function UpdatePasswordModal({ onClose, onSubmit }: UpdatePasswordModalProps) {
  const { t } = useTranslation();

  const [form, setForm] = useState<FormState>({ current: "", newPass: "", confirm: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiErr] = useState<string | null>(null);

  const setField = (k: keyof FormState, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
    setApiErr(null);
  };

  const toggleShow = (k: keyof typeof show) => setShow((p) => ({ ...p, [k]: !p[k] }));

  const handleSubmit = async () => {
    const errs = validate(form, t);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiErr(null);
    try {
      await onSubmit?.(form.current, form.newPass);
      onClose();
    } catch (err: any) {
      setApiErr(err?.response?.data?.message ?? err?.message ?? t("profile.updatePasswordModal.failed"));
    } finally {
      setLoading(false);
    }
  };

  const strength = strengthLevel(form.newPass, t);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lock size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                {t("profile.updatePasswordModal.title")}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {t("profile.updatePasswordModal.subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition flex-shrink-0 ml-2"
          >
            <X size={15} />
          </button>
        </div>

        <div className="border-t border-gray-100 mx-5 sm:mx-6" />

        <div className="p-5 sm:p-6 pt-4 space-y-4">

          {/* API error */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {apiError}
            </div>
          )}

          {/* Fields */}
          {[
            { id: "current" as const, label: t("profile.updatePasswordModal.fields.current"), ph: t("profile.updatePasswordModal.placeholders.current") },
            { id: "newPass" as const, label: t("profile.updatePasswordModal.fields.new"), ph: t("profile.updatePasswordModal.placeholders.new") },
            { id: "confirm" as const, label: t("profile.updatePasswordModal.fields.confirm"), ph: t("profile.updatePasswordModal.placeholders.confirm") },
          ].map(({ id, label, ph }) => (
            <div key={id}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <div className={`flex items-center border rounded-xl px-3 py-2.5 bg-white transition focus-within:ring-2 ${
                errors[id]
                  ? "border-red-300 focus-within:ring-red-100"
                  : "border-gray-200 focus-within:ring-blue-100 focus-within:border-blue-400"
              }`}>
                <input
                  type={show[id] ? "text" : "password"}
                  placeholder={ph}
                  value={form[id]}
                  onChange={(e) => setField(id, e.target.value)}
                  className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none min-w-0"
                />
                <button
                  type="button"
                  onClick={() => toggleShow(id)}
                  className="text-gray-400 hover:text-gray-600 transition ml-2 flex-shrink-0 p-0.5"
                >
                  {show[id] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors[id] && <p className="text-xs text-red-500 mt-1">{errors[id]}</p>}
            </div>
          ))}

          {/* Strength bar */}
          {form.newPass && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full transition-colors ${
                      i <= strength.level ? strength.color : "bg-gray-100"
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-1 whitespace-nowrap">{strength.label}</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 sm:px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
            >
              {loading && (
                <svg className="animate-spin w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              )}
              {loading ? t("profile.updatePasswordModal.updating") : t("profile.updatePasswordModal.updatePassword")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}