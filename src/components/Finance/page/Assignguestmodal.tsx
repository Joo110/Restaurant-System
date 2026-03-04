// src/components/Tables/AssignGuestModal.tsx
import { useState } from "react";

interface AssignGuestModalProps {
  isOpen:       boolean;
  tableId:      string;
  onClose:      () => void;
  onConfirm:    (data: { guestName: string; guests: number; waiterId: string }) => void;
}

const WAITERS = ["Mohamed Morsy", "Ahmed Hassan", "Sara Ali", "Omar Khaled"];
const GUEST_COUNT = [1,2,3,4,5,6,7,8];

export default function AssignGuestModal({ isOpen, tableId, onClose, onConfirm }: AssignGuestModalProps) {
  const [guestName, setGuestName] = useState("");
  const [guests,    setGuests]    = useState(1);
  const [waiterId,  setWaiterId]  = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!guestName.trim()) return;
    onConfirm({ guestName: guestName.trim(), guests, waiterId });
    setGuestName(""); setGuests(1); setWaiterId("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-blue-50 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">

        <h2 className="text-xl font-bold text-slate-900">Assign Guest</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">Assign a New Guest to {tableId}</p>

        <div className="h-px bg-slate-200 mb-6" />

        {/* Guest Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Guest Name</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter guest name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▾</span>
          </div>
        </div>

        {/* Number of Guests */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Number of Guests</label>
          <div className="relative">
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            >
              {GUEST_COUNT.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▾</span>
          </div>
        </div>

        {/* Assign Waiter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign Waiter</label>
          <div className="relative">
            <select
              value={waiterId}
              onChange={(e) => setWaiterId(e.target.value)}
              className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            >
              <option value="">Select a waiter</option>
              {WAITERS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▾</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!guestName.trim()}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
}