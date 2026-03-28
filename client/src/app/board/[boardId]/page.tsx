"use client";

import { useEffect, useState } from "react";
import { useKanbanStore } from "@/store/useKanbanStore";
import { useParams, useRouter } from "next/navigation";
import { Settings, Search, Filter, MoreHorizontal, Trash2, Menu } from "lucide-react";
import BoardArea from "@/components/board/BoardArea";
import CardDetailModal from "@/components/board/CardDetailModal";
import FilterBar from "@/components/board/FilterBar";

export default function BoardPage() {
  const { boardId } = useParams();
  const router = useRouter();
  const { currentBoard, boards, fetchBoards, setCurrentBoard, updateBoard, deleteBoard, filters, setFilters } = useKanbanStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#0079bf','#d04444','#4bce97','#f5cd47','#fea362','#9f8fef'];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  useEffect(() => {
    if (boards.length === 0) {
      fetchBoards();
    }
  }, [boards.length, fetchBoards]);

  useEffect(() => {
    if (boards.length > 0) {
      const board = boards.find((b) => String(b.id) === boardId);
      if (board) {
        setCurrentBoard(board);
        setBoardTitle(board.title);
      }
    }
  }, [boardId, boards, setCurrentBoard]);

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500 animate-pulse">
        Loading Board...
      </div>
    );
  }

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (boardTitle.trim() !== currentBoard.title) {
      updateBoard(currentBoard.id, boardTitle);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this board?")) {
      deleteBoard(currentBoard.id);
      router.push("/");
    }
  };

  return (
    <div
      className="h-screen w-full flex flex-col relative transition-colors duration-500"
      style={{
        background: currentBoard.background.startsWith("#")
          ? currentBoard.background
          : "var(--board-bg)",
      }}
    >
      <header className="px-4 py-3 md:px-6 h-auto md:h-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 backdrop-blur-md bg-black/10 text-white z-10 border-b border-white/10">
        <div className="flex items-center space-x-4 w-full md:w-auto overflow-hidden">
          <button 
            className="lg:hidden block text-white/80 hover:text-white"
            onClick={() => window.dispatchEvent(new CustomEvent('toggleSidebar'))}
          >
            <Menu size={20} />
          </button>
          {isEditingTitle ? (
            <input 
              autoFocus
              className="text-xl md:text-2xl font-bold tracking-tight bg-white/20 text-white px-2 py-1 rounded outline-none w-full"
              value={boardTitle}
              onChange={e => setBoardTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={e => e.key === 'Enter' && handleTitleSubmit()}
            />
          ) : (
            <h1 
              onClick={() => setIsEditingTitle(true)}
              className="text-xl md:text-2xl font-bold tracking-tight drop-shadow-md cursor-pointer hover:bg-white/10 px-2 py-1 rounded truncate max-w-[150px] sm:max-w-xs md:max-w-none w-auto"
            >
              {currentBoard.title}
            </h1>
          )}
        </div>

        <div className="flex items-center justify-between md:justify-end space-x-3 w-full md:w-auto">
          <div className="hidden sm:flex relative group items-center">
            <Search className="absolute left-3 md:text-white/70 text-white md:transform-none" size={18} />
            <input
              type="text"
              value={filters?.search || ""}
              onChange={e => setFilters({ search: e.target.value })}
              placeholder="Search..."
              className="pl-10 pr-4 py-1.5 md:py-2 rounded-full bg-white/20 focus:bg-white/30 text-white placeholder-white/70 outline-none backdrop-blur-sm transition-all shadow-inner w-10 focus:w-48 md:w-48 md:focus:w-64 cursor-pointer focus:cursor-text text-sm h-10 md:h-auto"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 md:py-1.5 min-h-[44px] md:min-h-0 rounded-md transition-colors text-sm font-medium ${showFilters ? 'bg-white/30' : 'hover:bg-white/20'}`}
          >
            <Filter size={18} />
            <span className="hidden sm:inline">Filter</span>
          </button>
          
          <div className="hidden md:flex flex-row items-center space-x-2 -ml-2">
            <div className="w-px h-6 bg-white/20 mx-2" />
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 border-2 border-transparent flex items-center justify-center text-xs font-bold ring-2 ring-white/20">A</div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 border-2 border-transparent flex items-center justify-center text-xs font-bold ring-2 ring-white/20">B</div>
            </div>
          </div>
          
          <button onClick={handleDelete} className="p-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 hover:bg-red-500/80 rounded-md transition-colors text-white flex justify-center items-center" title="Delete Board">
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      {showFilters && <FilterBar />}

      <main className="flex-1 overflow-y-auto overflow-x-hidden lg:overflow-x-auto lg:overflow-y-hidden custom-scroll p-3 lg:p-4 pb-4 flex flex-col lg:flex-row">
        <div className="flex flex-col lg:flex-row w-full lg:w-fit gap-3 lg:gap-4">
          <BoardArea board={currentBoard} />
        </div>
      </main>
      <CardDetailModal />
    </div>
  );
}
