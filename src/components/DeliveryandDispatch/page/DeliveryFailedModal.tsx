import { useState } from "react";

interface DeliveryFailedModalProps {
  orderId?: string;
  onBack?: () => void;
  onMarkFailed?: (reason: string, notes: string) => void;
}

const failureReasons = [
  "Customer unavailable",
  "Wrong address",
  "Customer refused delivery",
  "Item damaged",
  "Weather conditions",
  "Vehicle breakdown",
  "Other",
];

export default function DeliveryFailedModal({
  orderId = "121",
  onBack,
  onMarkFailed,
}: DeliveryFailedModalProps) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!reason) return;
    onMarkFailed?.(reason, notes);
  };

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#f0f7ff] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        {/* Title */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Delivery Failed</h2>
            <p className="text-sm text-gray-500">Report an issue with order #{orderId}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 my-5" />

        {/* Reason Dropdown */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Failure</label>
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className={`w-full bg-white border rounded-2xl px-4 py-3 text-sm text-left flex items-center justify-between shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                reason ? "border-blue-300 text-gray-800" : "border-gray-200 text-gray-400"
              }`}
            >
              {reason || "Select a reason"}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                {failureReasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setReason(r); setOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition ${reason === r ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
          <textarea
            placeholder="Provide more details about the failed delivery attempt....."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-2xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason}
            className={`px-6 py-2.5 rounded-2xl text-white text-sm font-semibold transition shadow-md ${
              reason ? "bg-red-500 hover:bg-red-600" : "bg-red-300 cursor-not-allowed"
            }`}
          >
            Mark as Failed
          </button>
        </div>
      </div>
    </div>
  );
}