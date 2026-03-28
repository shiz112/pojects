import { useState, useMemo } from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CardItem from "./CardItem";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useKanbanStore } from "@/store/useKanbanStore";

export default function ListContainer({ list, isOverlay = false }: { list: any; isOverlay?: boolean }) {
  const { addCard, updateList, deleteList, getFilteredCards } = useKanbanStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: "List", list },
  });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (listTitle.trim() !== list.title) {
      updateList(list.id, listTitle);
    }
  };

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      addCard(list.id, newCardTitle);
      setNewCardTitle("");
      setIsAddingCard(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this list?")) {
      deleteList(list.id);
    }
  };

  const filteredCards = getFilteredCards(list.id);

  const cardIds = useMemo(() => filteredCards.map((c: any) => String(c.id)), [filteredCards]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full lg:w-[272px] flex-shrink-0 glass-list rounded-xl shadow-lg border border-black/10 lg:border-white/40 flex flex-col max-h-none lg:max-h-[calc(100vh-180px)] ${isOverlay ? "ring-2 ring-blue-500 rotate-2" : ""}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="p-3 font-semibold text-slate-800 border-b border-black/5 flex justify-between items-center bg-white/80 lg:bg-white/50 backdrop-blur-sm cursor-grab active:cursor-grabbing rounded-t-xl relative group z-10"
      >
        {isEditingTitle ? (
          <input 
            autoFocus
            className="flex-1 bg-white/70 px-2 py-0.5 rounded outline-none w-full mr-2"
            value={listTitle}
            onChange={e => setListTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={e => e.key === 'Enter' && handleTitleSubmit()}
          />
        ) : (
          <div onClick={() => setIsEditingTitle(true)} className="flex-1 cursor-text truncate overflow-hidden">
            {list.title}
          </div>
        )}
        
        <div className="relative pointer-events-auto">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-black/10 rounded-md text-slate-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
            <MoreHorizontal size={16} />
          </button>
          
          {showMenu && (
            <div className="absolute top-8 right-0 bg-white shadow-xl border rounded-lg w-32 py-1 z-50">
              <button onClick={handleDelete} className="w-full text-left px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                <Trash2 size={14} /> Delete List
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-3 flex-1 overflow-y-auto custom-scroll flex flex-col gap-2 min-h-[60px]">
        {filteredCards.length > 0 ? (
          <SortableContext items={cardIds}>
            {filteredCards.map((card: any) => (
              <CardItem key={card.id} card={{...card, listId: list.id}} />
            ))}
          </SortableContext>
        ) : (
          <div className="text-sm text-slate-400 text-center py-2 h-full border-2 border-dashed border-slate-300 rounded bg-black/5 flex items-center justify-center">
            {list.cards?.length > 0 ? "No matching cards" : "Drop cards here"}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-black/5 bg-white/30 backdrop-blur-sm rounded-b-xl z-10">
        {isAddingCard ? (
          <div className="bg-white rounded-lg shadow-sm w-full p-2 border border-blue-400 pointer-events-auto flex flex-col">
            <textarea 
              autoFocus
              className="w-full resize-none text-sm outline-none placeholder:text-slate-400 min-h-[60px]"
              placeholder="Enter a title for this card..."
              value={newCardTitle}
              onChange={e => setNewCardTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCard();
                }
              }}
            />
            <div className="flex gap-2 mt-2 justify-end">
              <button onClick={() => setIsAddingCard(false)} className="px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
              <button onClick={handleAddCard} className="px-2 py-1 text-xs font-semibold bg-blue-600 text-white rounded shadow hover:bg-blue-700">Add card</button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsAddingCard(true)}
            className="flex items-center justify-center md:justify-start gap-2 text-slate-600 w-full hover:bg-black/5 px-2 rounded-md text-sm font-semibold transition-colors pointer-events-auto min-h-[44px]"
          >
            <Plus size={16} /> Add a card
          </button>
        )}
      </div>
    </div>
  );
}
