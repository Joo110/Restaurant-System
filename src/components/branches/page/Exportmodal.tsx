import { useState } from "react";
import { X, Upload } from "lucide-react";

type ExportType = "PDF" | "Excel" | "CSV";

interface ExportModalProps {
  onClose: () => void;
  period?: string;
}

export default function ExportModal({ onClose, period = "November 01 - November 30, 2026" }: ExportModalProps) {
  const [selected, setSelected] = useState<ExportType>("PDF");

  const options: { type: ExportType; icon: string; label: string }[] = [
    { type: "PDF", icon: "📄", label: "PDF" },
    { type: "Excel", icon: "📊", label: "Excel" },
    { type: "CSV", icon: "📋", label: "CSV" },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-[#f0f5ff] rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-sm p-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-gray-900">Export Type</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="border-t border-gray-200 mt-3 mb-5" />

        {/* Period */}
        <div className="flex items-center gap-3 bg-white rounded-2xl p-4 mb-5 shadow-sm">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-blue-500 text-lg">📅</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700">Report Period</p>
            <p className="text-sm text-gray-600 font-medium">{period}</p>
          </div>
        </div>

        {/* Format options */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {options.map((opt) => (
            <button
              key={opt.type}
              onClick={() => setSelected(opt.type)}
              className={`relative rounded-2xl p-4 flex flex-col items-center gap-2 border-2 transition-all duration-200 ${
                selected === opt.type
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-blue-200"
              }`}
            >
              {selected === opt.type && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
              )}
              <span className="text-3xl">{opt.icon}</span>
              <span className={`text-sm font-semibold ${selected === opt.type ? "text-blue-600" : "text-gray-500"}`}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
            <Upload size={14} /> Export
          </button>
        </div>
      </div>
    </div>
  );
}