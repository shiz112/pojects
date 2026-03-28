import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useKanbanStore } from "@/store/useKanbanStore";
import { X, AlignLeft, CheckSquare, MessageSquare, UserPlus, Tag, Clock, Trash2, Archive, Palette } from "lucide-react";
import toast from 'react-hot-toast';

const COVER_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "transparent"];

export default function CardDetailModal() {
  const { currentBoard, activeCardModalId, setActiveCardModalId, updateCard, deleteCard, handleLabelToggle, toggleMember, addChecklist, deleteChecklist, addChecklistItem, toggleChecklistItem, deleteChecklistItem } = useKanbanStore();

  const [descOriginal, setDescOriginal] = useState("");
  const [desc, setDesc] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  
  const [titleOriginal, setTitleOriginal] = useState("");
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [showLabelsMenu, setShowLabelsMenu] = useState(false);
  const [showCoverMenu, setShowCoverMenu] = useState(false);

  const [dueDate, setDueDate] = useState<string>('');
  const [savingDate, setSavingDate] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [showMembersMenu, setShowMembersMenu] = useState(false);
  
  const [showChecklistMenu, setShowChecklistMenu] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newItemText, setNewItemText] = useState<{ [key: number]: string }>({});

  let card: any = null;
  let listName = "";
  if (currentBoard?.lists) {
    for (const list of currentBoard.lists) {
      const found = list.cards?.find((c: any) => c.id === activeCardModalId);
      if (found) {
        card = found;
        listName = list.title;
        break;
      }
    }
  }

  // Effect to sync local state when the modal opens or card changes remotely
  useEffect(() => {
    if (activeCardModalId && currentBoard && users.length === 0) {
      api.get(`/users`).then(res => setUsers(res.data)).catch(console.error);
    }
    if (card) {
      setTitleOriginal(card.title || "");
      setTitle(card.title || "");
      setDescOriginal(card.description || "");
      setDesc(card.description || "");
      setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 16) : '');
    }
  }, [card?.id, card?.title, card?.description, card?.dueDate, activeCardModalId, users.length]);

  if (!activeCardModalId || !currentBoard || !card) return null;

  const saveTitle = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== titleOriginal) {
      updateCard(card.id, { title });
    } else {
      setTitle(titleOriginal);
    }
  };

  const saveDesc = () => {
    setIsEditingDesc(false);
    if (desc !== descOriginal) {
      updateCard(card.id, { description: desc });
    }
  };

  const handleDelete = () => {
    if (confirm("Permanently delete this card? This cannot be undone.")) {
      deleteCard(card.id);
    }
  };

  const setCover = (color: string) => {
    updateCard(card.id, { coverColor: color === "transparent" ? null : color });
    setShowCoverMenu(false);
  };

  const handleSaveDueDate = async () => {
    setSavingDate(true);
    try {
      await updateCard(card.id, { dueDate: dueDate ? new Date(dueDate).toISOString() : null });
      toast.success('Due date saved');
    } catch {
      toast.error('Failed to save due date');
    } finally {
      setSavingDate(false);
    }
  };

  const handleRemoveDueDate = async () => {
    setSavingDate(true);
    try {
      await updateCard(card.id, { dueDate: null });
      setDueDate('');
      toast.success('Due date removed');
    } catch {
      toast.error('Failed to remove due date');
    } finally {
      setSavingDate(false);
    }
  };

  // Mock global labels for the dropdown array representation
  const GLOBAL_LABELS = [
    { id: 1, name: "Bug", color: "#ef4444" },
    { id: 2, name: "Feature", color: "#3b82f6" },
    { id: 3, name: "High Priority", color: "#eab308" },
    { id: 4, name: "Design", color: "#a855f7" },
    { id: 5, name: "Backend", color: "#22c55e" },
    { id: 6, name: "Frontend", color: "#f97316" }
  ];

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

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setActiveCardModalId(null)}>
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-[#f1f2f4] dark:bg-slate-800 w-full h-full md:h-auto md:max-w-2xl lg:max-w-3xl md:max-h-[90vh] rounded-none md:rounded-xl shadow-2xl overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in duration-200"
      >
        
        {card.coverColor && (
          <div className="h-24 w-full" style={{ backgroundColor: card.coverColor }} />
        )}

        <button 
          onClick={() => setActiveCardModalId(null)}
          className="fixed top-4 right-4 md:absolute p-2 min-h-[44px] min-w-[44px] rounded-full hover:bg-black/10 transition-colors bg-white/50 backdrop-blur-md z-10 flex items-center justify-center shadow-lg md:shadow-none"
        >
          <X size={20} />
        </button>

        <div className="flex-1 overflow-y-auto custom-scroll p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
          
          <div className="flex-1 w-full md:w-3/5 lg:w-3/4 space-y-8 order-1">
            <div>
              {isEditingTitle ? (
                <input 
                  autoFocus
                  className="w-full text-2xl font-bold bg-white text-slate-800 rounded px-2 py-1 outline-none border-2 border-blue-500"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={e => e.key === 'Enter' && saveTitle()}
                />
              ) : (
                <h2 
                  onClick={() => setIsEditingTitle(true)}
                  className="text-2xl font-bold text-slate-800 dark:text-slate-100 cursor-pointer hover:bg-white/50 rounded px-2 py-1 -ml-2 transition-colors"
                >
                  {card.title}
                </h2>
              )}
              <p className="text-sm text-slate-500 mt-1 ml-2">in list <span className="font-semibold underline">{listName}</span></p>
            </div>

            {card.members && card.members.length > 0 && (
              <div className="ml-2 mt-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Members</h3>
                <div className="flex flex-wrap gap-2">
                  {card.members.map((cm: any) => {
                    const name = cm.user?.name || cm.userId?.toString() || "U";
                    return (
                      <div 
                        key={cm.userId} 
                        className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-xs text-white shadow-sm" 
                        style={{ backgroundColor: getAvatarColor(name) }}
                        title={name}
                      >
                        {getInitials(name)}
                      </div>
                    );
                  })}
                  <button onClick={() => setShowMembersMenu(!showMembersMenu)} className="w-8 h-8 bg-slate-200/50 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors shadow-sm">+</button>
                </div>
              </div>
            )}

            {card.labels && card.labels.length > 0 && (
              <div className="ml-2 mt-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Labels</h3>
                <div className="flex flex-wrap gap-2">
                  {card.labels.map((cl: any) => (
                    <span key={cl.label.id} className="px-3 py-1 rounded-md text-sm font-medium text-white shadow-sm" style={{ background: cl.label.color }}>
                      {cl.label.name}
                    </span>
                  ))}
                  <button onClick={() => setShowLabelsMenu(!showLabelsMenu)} className="w-8 h-7 bg-slate-200/50 hover:bg-slate-200 rounded flex items-center justify-center text-slate-600 transition-colors">+</button>
                </div>
              </div>
            )}

            <div className="space-y-3 ml-2">
              <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-semibold text-lg">
                <AlignLeft size={20} />
                <h3>Description</h3>
              </div>
              
              {isEditingDesc ? (
                <div className="flex flex-col gap-2">
                  <textarea 
                    autoFocus
                    className="w-full min-h-[120px] p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-inner outline-none resize-none transition-all text-sm text-slate-700"
                    placeholder="Add a more detailed description..."
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={saveDesc} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700">Save</button>
                    <button onClick={() => { setIsEditingDesc(false); setDesc(descOriginal); }} className="px-4 py-2 text-slate-600 bg-slate-200 text-sm font-semibold rounded hover:bg-slate-300">Cancel</button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingDesc(true)}
                  className={`w-full min-h-[60px] p-4 rounded-xl cursor-pointer transition-all ${descOriginal ? 'bg-transparent text-slate-700' : 'bg-slate-200/50 hover:bg-slate-200 text-slate-500'} dark:text-slate-300 text-sm`}
                >
                  {descOriginal || "Add a more detailed description..."}
                </div>
              )}
            </div>

            {card.checklists?.map((ck: any) => {
              const totalItems = ck.items?.length || 0;
              const completedItems = ck.items?.filter((i: any) => i.isCompleted).length || 0;
              const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
              const progressColor = progress === 100 ? 'bg-green-500' : 'bg-blue-500';

              return (
                <div key={ck.id} className="space-y-3 ml-2 mt-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-semibold text-lg">
                      <CheckSquare size={20} />
                      <h3>{ck.title}</h3>
                    </div>
                    <button 
                      onClick={() => deleteChecklist(ck.id, card.id)}
                      className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500 w-8">{progress}%</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${progressColor} transition-all duration-300`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    {ck.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 group">
                        <input 
                          type="checkbox"
                          checked={item.isCompleted}
                          onChange={(e) => toggleChecklistItem(item.id, card.id, e.target.checked)}
                          className="w-4 h-4 cursor-pointer accent-blue-600"
                        />
                        <span className={`text-sm flex-1 ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.text}</span>
                        <button 
                          onClick={() => deleteChecklistItem(item.id, card.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="mt-2 pl-7 flex gap-2">
                      <input 
                        value={newItemText[ck.id] || ""}
                        onChange={e => setNewItemText(prev => ({ ...prev, [ck.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newItemText[ck.id]?.trim()) {
                            addChecklistItem(ck.id, card.id, newItemText[ck.id]);
                            setNewItemText(prev => ({ ...prev, [ck.id]: "" }));
                          }
                        }}
                        placeholder="Add an item..."
                        className="text-sm p-2 rounded bg-slate-100 focus:bg-white border-transparent focus:border-blue-500 border outline-none w-full transition-colors"
                      />
                      <button 
                        onClick={() => {
                          if (newItemText[ck.id]?.trim()) {
                            addChecklistItem(ck.id, card.id, newItemText[ck.id]);
                            setNewItemText(prev => ({ ...prev, [ck.id]: "" }));
                          }
                        }}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-3 text-sm rounded transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="space-y-3 ml-2 mt-8">
              <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-semibold text-lg border-t border-slate-200 dark:border-slate-700 pt-6">
                <MessageSquare size={20} />
                <h3>Activity</h3>
              </div>
              <div className="flex items-start space-x-4 mt-4">
                <div className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center text-white font-bold shadow-sm" style={{ backgroundColor: getAvatarColor(users[0]?.name || 'U') }}>
                  {getInitials(users[0]?.name || 'U')}
                </div>
                <div className="flex-1">
                  <textarea 
                    className="w-full min-h-[60px] p-3 rounded-xl bg-white dark:bg-slate-900 border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm placeholder:text-slate-400"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button className="mt-2 text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow">Save</button>
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                {card.comments && card.comments.map((comment: any) => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: getAvatarColor(comment.user?.name || 'U') }}>
                      {getInitials(comment.user?.name || 'U')}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{comment.user?.name}</span>
                        <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 inline-block w-full">
                        {comment.text}
                      </div>
                      <button className="text-xs text-slate-400 hover:text-red-500 mt-1 font-medium transition-colors">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/5 lg:w-1/4 space-y-6 relative order-2 mt-4 md:mt-0 pb-16 md:pb-0">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Dates</h3>
              <div className="flex flex-col gap-2">
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDueDate}
                    disabled={savingDate}
                    className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingDate ? 'Saving...' : 'Save'}
                  </button>
                  {dueDate && (
                    <button
                      onClick={handleRemoveDueDate}
                      disabled={savingDate}
                      className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Add to card</h3>
              <div className="flex flex-col space-y-2">
                
                <div className="relative">
                  <button onClick={() => setShowMembersMenu(!showMembersMenu)} className="flex items-center space-x-2 w-full p-2 rounded-lg bg-slate-200/70 hover:bg-slate-300/80 transition-colors text-slate-700 text-sm font-semibold shadow-sm">
                    <UserPlus size={16} /><span>Members</span>
                  </button>
                  {showMembersMenu && (
                    <div className="absolute top-10 right-0 w-64 bg-white shadow-2xl rounded-xl p-3 z-50 border">
                      <h4 className="text-xs font-bold text-slate-500 text-center border-b pb-2 mb-2">Members</h4>

                      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scroll pr-1">
                        {users.map((u: any) => {
                          const isAssigned = card.members?.some((m: any) => m.userId === u.id);
                          return (
                            <div 
                              key={u.id}
                              onClick={() => toggleMember(card.id, u.id, isAssigned, u)}
                              className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: getAvatarColor(u.name) }}>
                                {getInitials(u.name)}
                              </div>
                              <span className="text-sm text-slate-700 flex-1">{u.name}</span>
                              {isAssigned && <CheckSquare size={14} className="text-blue-600" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button onClick={() => setShowLabelsMenu(!showLabelsMenu)} className="flex items-center space-x-2 w-full p-2 rounded-lg bg-slate-200/70 hover:bg-slate-300/80 transition-colors text-slate-700 text-sm font-semibold shadow-sm">
                    <Tag size={16} /><span>Labels</span>
                  </button>
                  {showLabelsMenu && (
                    <div className="absolute top-10 right-0 w-64 bg-white shadow-2xl rounded-xl p-3 z-50 border">
                      <h4 className="text-xs font-bold text-slate-500 text-center border-b pb-2 mb-2">Labels</h4>
                      <div className="flex flex-col gap-2">
                        {GLOBAL_LABELS.map(gl => {
                          const hasLabel = card.labels?.some((cl: any) => cl.labelId === gl.id);
                          return (
                            <div 
                              key={gl.id} 
                              onClick={() => handleLabelToggle(card.id, gl.id, hasLabel, gl)}
                              className="px-3 py-1.5 rounded text-white text-sm font-semibold cursor-pointer flex justify-between items-center hover:opacity-90 transition-opacity"
                              style={{ background: gl.color }}
                            >
                              <span>{gl.name}</span>
                              {hasLabel && <CheckSquare size={14} />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button onClick={() => setShowCoverMenu(!showCoverMenu)} className="flex items-center space-x-2 w-full p-2 rounded-lg bg-slate-200/70 hover:bg-slate-300/80 transition-colors text-slate-700 text-sm font-semibold shadow-sm">
                    <Palette size={16} /><span>Cover</span>
                  </button>
                  {showCoverMenu && (
                    <div className="absolute top-10 right-0 w-64 bg-white shadow-2xl rounded-xl p-3 z-50 border">
                      <h4 className="text-xs font-bold text-slate-500 text-center border-b pb-2 mb-2">Colors</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {COVER_COLORS.map(color => (
                          <div 
                            key={color} 
                            onClick={() => setCover(color)}
                            className={`h-10 rounded cursor-pointer ${color === 'transparent' ? 'border-2 border-dashed border-slate-300 bg-slate-50' : ''}`}
                            style={color !== "transparent" ? { backgroundColor: color } : {}}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button onClick={() => setShowChecklistMenu(!showChecklistMenu)} className="flex items-center space-x-2 w-full p-2 rounded-lg bg-slate-200/70 hover:bg-slate-300/80 transition-colors text-slate-700 text-sm font-semibold shadow-sm">
                    <CheckSquare size={16} /><span>Checklist</span>
                  </button>
                  {showChecklistMenu && (
                    <div className="absolute top-10 right-0 w-64 bg-white shadow-2xl rounded-xl p-3 z-50 border">
                      <h4 className="text-xs font-bold text-slate-500 text-center border-b pb-2 mb-2">Add Checklist</h4>
                      <input 
                        className="w-full text-sm p-2 bg-slate-100 rounded border border-slate-200 outline-none focus:border-blue-500 transition-colors mb-2"
                        value={newChecklistTitle}
                        onChange={e => setNewChecklistTitle(e.target.value)}
                        placeholder="Checklist title"
                        autoFocus
                      />
                      <button 
                        onClick={() => {
                          if (newChecklistTitle.trim()) {
                            addChecklist(card.id, newChecklistTitle);
                            setShowChecklistMenu(false);
                            setNewChecklistTitle("");
                          }
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 rounded text-sm transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Actions</h3>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={handleDelete}
                  className="flex items-center space-x-2 w-full p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold transition-colors shadow-sm"
                >
                  <Trash2 size={16} /><span>Delete</span>
                </button>
                <button className="flex items-center space-x-2 w-full p-2 rounded-lg bg-slate-200/70 hover:bg-slate-300/80 transition-colors text-slate-700 text-sm font-semibold shadow-sm">
                  <Archive size={16} /><span>Archive</span>
                </button>
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
