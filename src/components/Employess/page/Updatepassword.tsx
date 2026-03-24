import { useState } from "react";

interface UpdatePasswordProps {
  onClose?: () => void;
}

export default function UpdatePassword({ onClose }: UpdatePasswordProps) {
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
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
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
          <h2 className="text-xl font-bold text-gray-900">Update Password</h2>
          <p className="text-sm text-gray-400 mt-1">Secure your account with a strong password.</p>
        </div>

        <div className="border-t border-gray-100 mb-6" />

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
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
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
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
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
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
            <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg font-medium">✓ Password updated successfully!</p>
          )}
        </div>

        <div className="flex gap-3 justify-end mt-7">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}