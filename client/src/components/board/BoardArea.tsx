import { useEffect, useState, useMemo, useCallback } from "react";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import ListContainer from "./ListContainer";
import CardItem from "./CardItem";
import { useKanbanStore } from "@/store/useKanbanStore";
import toast from "react-hot-toast";

export default function BoardArea({ board }: { board: any }) {
  const { reorderLists, reorderCards, addList } = useKanbanStore();
  const [lists, setLists] = useState(board?.lists || []);
  const [activeCard, setActiveCard] = useState<any | null>(null);
  const [activeList, setActiveList] = useState<any | null>(null);

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  useEffect(() => {
    setLists(board?.lists || []);
  }, [board?.lists]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const isList = active.data.current?.type === "List";
    const isCard = active.data.current?.type === "Card";

    if (isList) {
      const list = lists.find((l: any) => String(l.id) === String(active.id));
      setActiveList(list);
    }
    if (isCard) {
      for (const list of lists) {
        const card = list.cards?.find((c: any) => String(c.id) === String(active.id));
        if (card) {
          setActiveCard({ ...card, listId: list.id });
          return;
        }
      }
    }
  };

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || String(active.id) === String(over.id)) return;

    const isActiveCard = active.data.current?.type === "Card";
    if (!isActiveCard) return;

    const isOverCard = over.data.current?.type === "Card";

    setLists((prev: any) => {
      const activeListIndex = prev.findIndex((l: any) => String(l.id) === String(active.data.current?.listId));
      const overListIndex = isOverCard 
        ? prev.findIndex((l: any) => String(l.id) === String(over.data.current?.listId))
        : prev.findIndex((l: any) => String(l.id) === String(over.id));

      if (activeListIndex === -1 || overListIndex === -1) return prev;
      if (activeListIndex === overListIndex) return prev; // Only handle cross-list moves here
      
      const newLists = [...prev];
      const activeCardIndex = newLists[activeListIndex].cards.findIndex((c: any) => String(c.id) === String(active.id));
      if (activeCardIndex === -1) return prev;

      const [movedCard] = newLists[activeListIndex].cards.splice(activeCardIndex, 1);
      movedCard.listId = newLists[overListIndex].id;
      
      const overCardIndex = isOverCard ? newLists[overListIndex].cards.findIndex((c: any) => String(c.id) === String(over.id)) : newLists[overListIndex].cards.length;
      newLists[overListIndex].cards.splice(overCardIndex, 0, movedCard);
      
      return newLists;
    });
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveCard(null);
    setActiveList(null);
    const { active, over } = event;
    if (!over || String(active.id) === String(over.id)) return;

    const snapshot = board.lists;

    try {
      const isActiveList = active.data.current?.type === "List";
      if (isActiveList) {
        const activeIndex = lists.findIndex((l: any) => String(l.id) === String(active.id));
        const overIndex = lists.findIndex((l: any) => String(l.id) === String(over.id));
        if (activeIndex === -1 || overIndex === -1) return;
        
        if (activeIndex !== overIndex) {
          const newLists = arrayMove(lists, activeIndex, overIndex);
          setLists(newLists);
          await reorderLists(board.id, newLists);
        }
        return;
      }

      const isActiveCard = active.data.current?.type === "Card";
      if (isActiveCard) {
        const activeListIndex = lists.findIndex((l: any) => String(l.id) === String(active.data.current?.listId));
        const isOverCard = over.data.current?.type === "Card";
        const overListIndex = isOverCard 
          ? lists.findIndex((l: any) => String(l.id) === String(over.data.current?.listId))
          : lists.findIndex((l: any) => String(l.id) === String(over.id));

        if (activeListIndex === -1 || overListIndex === -1) return;

        let newLists = [...lists];

        if (activeListIndex === overListIndex) {
          // Same-list reorder
          const activeCardIndex = lists[activeListIndex].cards.findIndex((c: any) => String(c.id) === String(active.id));
          const overCardIndex = lists[overListIndex].cards.findIndex((c: any) => String(c.id) === String(over.id));
          if (activeCardIndex === -1) return;
          
          if (activeCardIndex !== overCardIndex && overCardIndex !== -1) {
            newLists[activeListIndex] = {
              ...newLists[activeListIndex],
              cards: arrayMove(newLists[activeListIndex].cards, activeCardIndex, overCardIndex)
            };
            setLists(newLists);
            await reorderCards(newLists);
          }
        } else {
          // Cross-list move was handled in DOM by handleDragOver, just sync backend
          await reorderCards(lists);
        }
      }
    } catch {
      setLists(snapshot);
      toast.error('Failed to save. Changes reverted.');
    }
  }, [lists, board, reorderLists, reorderCards]);

  const submitList = () => {
    if (newListTitle.trim()) {
      addList(board.id, newListTitle);
      setNewListTitle("");
      setIsAddingList(false);
    }
  };

  const listIds = useMemo(() => lists.map((l: any) => String(l.id)), [lists]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-start pb-4 w-full lg:w-auto">
        <SortableContext items={listIds}>
          {lists.map((list: any) => (
            <ListContainer key={list.id} list={list} />
          ))}
        </SortableContext>
        
        {isAddingList ? (
          <div className="w-full lg:w-[272px] flex-shrink-0 bg-white shadow-xl rounded-xl p-3 flex flex-col gap-2 border border-blue-500">
            <input 
              autoFocus
              className="px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
              value={newListTitle}
              onChange={e => setNewListTitle(e.target.value)}
              placeholder="Enter list title..."
              onKeyDown={e => e.key === 'Enter' && submitList()}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsAddingList(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded font-semibold transition-colors">Cancel</button>
              <button onClick={submitList} className="px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded font-semibold transition-colors">Add List</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAddingList(true)} className="w-full lg:w-[272px] flex-shrink-0 bg-black/10 hover:bg-black/20 lg:bg-white/20 lg:hover:bg-white/30 backdrop-blur-sm text-slate-800 lg:text-white font-medium p-3 rounded-xl flex items-center justify-center lg:justify-start transition-colors shadow-sm border border-slate-300 lg:border-transparent">
            <span className="mr-2 font-bold text-lg">+</span> Add another list
          </button>
        )}
      </div>

      <DragOverlay>
        {activeList && <ListContainer list={activeList} isOverlay />}
        {activeCard && <CardItem card={activeCard} isOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
