// src/components/profile/UpdatePasswordModal.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, X, Lock } from "lucide-react";

interface UpdatePasswordModalProps {
  onClose:   () => void;
  onSubmit?: (current: string, newPass: string) => Promise<void>;
}
interface FormState  { current: string; newPass: string; confirm: string }
interface FormErrors { current?: string; newPass?: string; confirm?: string }

export default function UpdatePasswordModal({ onClose, onSubmit }: UpdatePasswordModalProps) {
  const { t } = useTranslation();

  function validate(f: FormState): FormErrors {
    const e: FormErrors = {};
    const k = "updatePassword.errors";
    if (!f.current.trim())            e.current = t(`${k}.currentRequired`);
    if (!f.newPass.trim())            e.newPass = t(`${k}.newRequired`);
    else if (f.newPass.length < 8)    e.newPass = t(`${k}.newTooShort`);
    if (!f.confirm.trim())            e.confirm = t(`${k}.confirmRequired`);
    else if (f.confirm !== f.newPass) e.confirm = t(`${k}.confirmMismatch`);
    return e;
  }

  function strengthLevel(p: string): { level: number; label: string; color: string } {
    if (!p)         return { level: 0, label: "", color: "" };
    if (p.length < 6) return { level: 1, label: t("updatePassword.strength.weak"),   color: "bg-red-400"    };
    if (p.length < 10) return { level: 2, label: t("updatePassword.strength.medium"), color: "bg-amber-400"  };
    return               { level: 3, label: t("updatePassword.strength.strong"), color: "bg-emerald-500" };
  }

  const [form,     setForm]   = useState<FormState>({ current: "", newPass: "", confirm: "" });
  const [errors,   setErrors] = useState<FormErrors>({});
  const [show,     setShow]   = useState({ current: false, newPass: false, confirm: false });
  const [loading,  setLoading] = useState(false);
  const [apiError, setApiErr] = useState<string | null>(null);

  const setField = (k: keyof FormState, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: undefined }));
    setApiErr(null);
  };

  const toggleShow = (k: keyof typeof show) => setShow(p => ({ ...p, [k]: !p[k] }));

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiErr(null);
    try {
      await onSubmit?.(form.current, form.newPass);
      onClose();
    } catch (err: any) {
      setApiErr(err?.response?.data?.message ?? err?.message ?? t("updatePassword.errors.failed"));
    } finally {
      setLoading(false);
    }
  };

  const strength = strengthLevel(form.newPass);

  const fields: { id: keyof FormState; label: string; ph: string }[] = [
    { id: "current", label: t("updatePassword.currentPassword"), ph: t("updatePassword.currentPlaceholder") },
    { id: "newPass", label: t("updatePassword.newPassword"),     ph: t("updatePassword.newPlaceholder")     },
    { id: "confirm", label: t("updatePassword.confirmPassword"), ph: t("updatePassword.confirmPlaceholder") },
  ];

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
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">{t("updatePassword.title")}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t("updatePassword.subtitle")}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition flex-shrink-0 ml-2">
            <X size={15} />
          </button>
        </div>

        <div className="border-t border-gray-100 mx-5 sm:mx-6" />

        <div className="p-5 sm:p-6 pt-4 space-y-4">
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{apiError}</div>
          )}

          {fields.map(({ id, label, ph }) => (
            <div key={id}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <div className={`flex items-center border rounded-xl px-3 py-2.5 bg-white transition focus-within:ring-2 ${
                errors[id] ? "border-red-300 focus-within:ring-red-100" : "border-gray-200 focus-within:ring-blue-100 focus-within:border-blue-400"
              }`}>
                <input
                  type={show[id] ? "text" : "password"}
                  placeholder={ph}
                  value={form[id]}
                  onChange={e => setField(id, e.target.value)}
                  className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none min-w-0"
                />
                <button type="button" onClick={() => toggleShow(id)} className="text-gray-400 hover:text-gray-600 transition ml-2 flex-shrink-0 p-0.5">
                  {show[id] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors[id] && <p className="text-xs text-red-500 mt-1">{errors[id]}</p>}
            </div>
          ))}

          {/* Strength bar */}
          {form.newPass && (
            <div className="flex items-center gap-1.5 mb-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= strength.level ? strength.color : "bg-gray-100"}`} />
              ))}
              <span className="text-xs text-gray-400 ml-1 whitespace-nowrap">{strength.label}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 pt-1">
            <button onClick={onClose} disabled={loading}
              className="px-4 sm:px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
              {t("updatePassword.cancel")}
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-60 flex items-center gap-2 whitespace-nowrap">
              {loading && (
                <svg className="animate-spin w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              )}
              {loading ? t("updatePassword.updating") : t("updatePassword.updateBtn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}