import { useState } from "react";
import { useTranslation } from "react-i18next";

interface UpdatePasswordProps {
  onClose?: () => void;
}

export default function UpdatePassword({ onClose }: UpdatePasswordProps) {
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    setError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t("allFieldsAreRequired"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("newPasswordsDoNotMatch"));
      return;
    }
    if (newPassword.length < 8) {
      setError(t("passwordMustBeAtLeast8Characters"));
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose?.();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="bg-white rounded-2xl shadow-xl w-96 p-7">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{t("updatePassword")}</h2>
          <p className="text-sm text-gray-400 mt-1">{t("secureYourAccountWithStrongPassword")}</p>
        </div>

        <div className="border-t border-gray-100 mb-6" />

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("currentPassword")}</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder={t("enterCurrentPassword")}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("newPassword")}</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder={t("enterNewPassword")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t("confirmNewPassword")}</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder={t("confirmNewPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
          {success && (
            <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg font-medium">✓ {t("passwordUpdatedSuccessfully")}</p>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-7">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            {t("updatePassword")}
          </button>
        </div>
      </div>
    </div>
  );
}