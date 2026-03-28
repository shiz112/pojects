"use client";

import { useKanbanStore } from "@/store/useKanbanStore";
import { ChevronLeft, ChevronRight, LayoutDashboard, Settings, Users, Star, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const { boards } = useKanbanStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setMobileOpen(o => !o);
    window.addEventListener("toggleSidebar", fn);
    return () => window.removeEventListener("toggleSidebar", fn);
  }, []);

  return (
    <>
      {/* Mobile Dark Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`bg-slate-800 text-slate-300 transition-all duration-300 flex flex-col z-50 
        ${mobileOpen ? "fixed top-0 left-0 h-full shadow-2xl translate-x-0" : "fixed lg:relative top-0 left-0 h-full -translate-x-full lg:translate-x-0"}
        w-[260px] flex-shrink-0
      `}>

      {/* Header */}
      <div className="p-4 flex items-center border-b border-slate-700/50 space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-blue-500/20">
          K
        </div>
        <span className="font-bold text-lg text-white tracking-wide">KanbanPro</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scroll py-4 flex flex-col gap-1">
        
        <div className="px-3 pb-2">
          <Link href="/" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors group">
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">Boards</span>
          </Link>
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors group">
            <Users size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">Members</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors group">
            <Settings size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">Settings</span>
          </button>
        </div>

        <div className="px-6 py-2 mt-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            Your Boards <PlusIcon />
          </h3>
          <div className="space-y-1">
            {boards.map(b => (
              <Link key={b.id} href={`/board/${b.id}`} className="flex items-center space-x-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors group">
                <div className="w-4 h-4 rounded-sm flex-shrink-0" style={{ background: b.background }} />
                <span className="truncate">{b.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </aside>
    </>
  );
}

function PlusIcon() {
  return <span className="cursor-pointer hover:bg-slate-700 p-1 rounded transition-colors">+</span>;
}
