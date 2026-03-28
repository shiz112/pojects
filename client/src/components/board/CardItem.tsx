import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useKanbanStore } from "@/store/useKanbanStore";
import { MessageSquare, CheckSquare } from "lucide-react";
import { format } from 'date-fns';

const getAvatarColor = (name: string) => {
  const colors = ['#0079bf','#d04444','#4bce97','#f5cd47','#fea362','#9f8fef'];
  const index = name?.charCodeAt(0) % colors.length || 0;
  return colors[index];
};

const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export default function CardItem({ card, isOverlay = false }: { card: any; isOverlay?: boolean }) {
  const { setActiveCardModalId } = useKanbanStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "Card", card, listId: card.listId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      setActiveCardModalId(card.id);
    }
  };

  // derived mock metrics for UI fidelity
  const totalComments = card.comments?.length || 0;
  const totalChecklists = card.checklists?.reduce((acc: number, cl: any) => acc + (cl.items?.length || 0), 0) || 0;
  const completedChecklists = card.checklists?.reduce((acc: number, cl: any) => acc + (cl.items?.filter((i:any) => i.isCompleted)?.length || 0), 0) || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={`bg-white rounded-lg shadow-sm text-sm text-slate-700 hover:ring-2 hover:ring-blue-400 cursor-grab active:cursor-grabbing transition-shadow transform group overflow-hidden ${isOverlay ? "ring-2 ring-blue-500 shadow-xl rotate-3" : ""}`}
      {...attributes}
      {...listeners}
    >
      {/* Cover Color Strip */}
      {card.coverColor && (
        <div className="h-8 w-full" style={{ backgroundColor: card.coverColor }} />
      )}
      
      <div className="p-3 flex flex-col gap-2 relative">
        {card.labels && card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.labels.map((cl: any) => (
              <span key={cl.label.id} className="h-2 w-8 rounded-full" style={{ background: cl.label.color }} title={cl.label.name} />
            ))}
          </div>
        )}
        
        <div className="font-semibold text-slate-800 break-words leading-tight">{card.title}</div>
        
        {/* Badges Row */}
        {(totalComments > 0 || totalChecklists > 0 || card.dueDate || card.members?.length > 0) && (
          <div className="flex flex-wrap items-center gap-3 text-slate-500 text-xs font-semibold mt-1">
            {card.dueDate && (() => {
              const now = new Date();
              const due = new Date(card.dueDate);
              const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

              let chipColor = 'bg-gray-100 text-gray-600';
              if (totalChecklists > 0 && completedChecklists === totalChecklists) chipColor = 'bg-green-100 text-green-700';
              else if (hoursUntilDue < 0) chipColor = 'bg-red-100 text-red-700';
              else if (hoursUntilDue <= 24) chipColor = 'bg-yellow-100 text-yellow-700';

              return (
                <div className={`flex items-center gap-1 rounded px-1.5 py-0.5 ${chipColor}`}>
                  🕒 <span>{format(due, 'MMM d')}</span>
                </div>
              );
            })()}

            {totalComments > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare size={12} /> <span>{totalComments}</span>
              </div>
            )}
            {totalChecklists > 0 && (
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${completedChecklists === totalChecklists ? 'bg-green-100 text-green-700' : ''}`}>
                <CheckSquare size={12} /> <span>{completedChecklists}/{totalChecklists}</span>
              </div>
            )}
            {card.members && card.members.length > 0 && (
              <div className="flex -space-x-1 ml-auto">
                {card.members.map((cm: any) => {
                  const name = cm.user?.name || cm.userId?.toString() || "U";
                  return (
                    <div 
                      key={cm.userId} 
                      className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[10px] text-white shadow-sm" 
                      style={{ backgroundColor: getAvatarColor(name) }}
                      title={name}
                    >
                      {getInitials(name)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
