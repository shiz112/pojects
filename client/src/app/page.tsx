"use client";

import { useEffect, useState } from "react";
import { useKanbanStore } from "@/store/useKanbanStore";
import { Plus, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function BoardGallery() {
  const { boards, fetchBoards, createBoard } = useKanbanStore();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetchBoards();
    // Self-heal labels
    api.post('/seed-labels').catch(() => {});
  }, [fetchBoards]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const board = await createBoard(newTitle, "linear-gradient(135deg, #667eea 0%, #764ba2 100%)");
    if (board) {
      router.push(`/board/${board.id}`);
    }
  };

  return (
    <div 
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}
    >
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Your Boards
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1">Manage your projects</p>
          </div>
          <button 
            className="lg:hidden block text-white/80 hover:text-white bg-white/10 p-2 rounded-md"
            onClick={() => window.dispatchEvent(new CustomEvent('toggleSidebar'))}
          >
            <Menu size={24} />
          </button>
        </header>

        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
            {boards.map((board: any) => (
              <Link
                href={`/board/${board.id}`}
                key={board.id}
                className="group relative h-[120px] w-full lg:w-[200px] rounded-[12px] overflow-hidden transition-all duration-200 block"
                style={{
                  background: board.background.startsWith("#") ? board.background : board.background || "var(--board-bg)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.filter = "brightness(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.filter = "brightness(1)";
                }}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-200" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <h2 className="text-white font-bold drop-shadow-md truncate text-base">
                    {board.title}
                  </h2>
                </div>
              </Link>
            ))}

            {isCreating ? (
              <form onSubmit={handleCreate} className="h-[120px] w-full lg:w-[200px] p-4 rounded-[12px] shadow-sm bg-white/10 border-2 border-blue-500 border-dashed flex flex-col justify-between">
                <input 
                  autoFocus
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Board title..."
                  className="w-full text-sm outline-none font-bold bg-transparent text-white placeholder:text-slate-300"
                />
                <div className="flex space-x-2 mt-auto justify-end">
                  <button type="button" onClick={() => setIsCreating(false)} className="px-2 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 rounded">Cancel</button>
                  <button type="submit" className="px-2 py-1 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700">Create</button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setIsCreating(true)} 
                className="h-[120px] min-h-[44px] w-full lg:w-[200px] flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-200 text-white group"
              >
                <div className="flex items-center space-x-2">
                  <Plus size={20} className="group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-semibold text-sm">Create new board</span>
                </div>
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
