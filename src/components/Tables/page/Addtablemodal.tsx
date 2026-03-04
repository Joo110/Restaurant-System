// src/components/Tables/AddTableModal.tsx
import React, { useState } from "react";

interface AddTableModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  onAdd:    (table: { tableNumber: string; seats: number; area: string }) => void;
}

const AREAS = ["Indoor Hall", "Outdoor", "VIP", "Terrace", "Bar"];

export default function AddTableModal({ isOpen, onClose, onAdd }: AddTableModalProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [seats,       setSeats]       = useState("");
  const [area,        setArea]        = useState("Indoor Hall");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!tableNumber.trim() || !seats.trim()) return;
    onAdd({ tableNumber: tableNumber.trim(), seats: parseInt(seats), area });
    setTableNumber(""); setSeats(""); setArea("Indoor Hall");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-blue-50 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">

        <h2 className="text-xl font-bold text-slate-900">Add New Table</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">Configure details for the new unit</p>

        <div className="h-px bg-slate-200 mb-6" />

        {/* Table Number + Seats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Table Number</label>
            <input
              type="text"
              placeholder="Add table Number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Seats</label>
            <input
              type="number"
              placeholder="Add number of seats"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Area</label>
          <div className="relative">
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            >
              {AREAS.map((a) => <option key={a}>{a}</option>)}
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
            onClick={handleSubmit}
            disabled={!tableNumber || !seats}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Create Table
          </button>
        </div>
      </div>
    </div>
  );
}