// src/components/layout/Topbar.tsx
import React from "react";
import { Bell, Calendar, ChevronDown, RefreshCw, User, Menu } from "lucide-react";

interface TopbarProps {
  onMenuClick?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-100 px-3 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4 flex-shrink-0">

      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburger — visible on mobile/tablet */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <Menu size={18} />
          </button>
        )}

        <h1 className="text-sm sm:text-base font-bold text-gray-800 whitespace-nowrap">
          Store Overview
        </h1>

        {/* Branch selector — hidden on xs */}
        <button className="hidden sm:flex items-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-blue-400 hover:text-blue-600 transition-all bg-white">
          <span className="text-sm">🏢</span>
          <span className="whitespace-nowrap">Mansoura Branch</span>
          <ChevronDown size={13} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Date — hidden on xs */}
        <button className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
          <Calendar size={13} />
          <span>Feb 15, 2026</span>
        </button>

        {/* Refresh — hidden on xs */}
        <button className="hidden sm:flex p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white">
          <RefreshCw size={15} />
        </button>

        {/* Bell */}
        <div className="relative">
          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white">
            <Bell size={15} />
          </button>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </div>

        {/* User */}
        <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all bg-white">
          <User size={15} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;