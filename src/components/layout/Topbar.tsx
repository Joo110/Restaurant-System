import React from "react";
import { Bell, Calendar, ChevronDown, RefreshCw, User } from "lucide-react";

const Topbar: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-gray-800 whitespace-nowrap">
          Store Overview
        </h1>
        <button className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-blue-400 hover:text-blue-600 transition-all bg-white">
          <span className="text-sm">🏢</span>
          <span className="whitespace-nowrap">Mansoura Branch</span>
          <ChevronDown size={13} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
          <Calendar size={13} />
          <span>Feb 15, 2026</span>
        </button>

        <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white">
          <RefreshCw size={15} />
        </button>

        <div className="relative">
          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white">
            <Bell size={15} />
          </button>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </div>

        <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white">
          <User size={15} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;