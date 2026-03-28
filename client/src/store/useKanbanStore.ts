import { create } from 'zustand';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface StoreState {
  boards: any[];
  currentBoard: any | null;
  activeCardModalId: string | number | null;
  filters: { search: string; labels: number[]; members: number[]; due: string | null };
  setFilters: (filters: Partial<{ search: string; labels: number[]; members: number[]; due: string | null }>) => void;
  getFilteredCards: (listId: number) => any[];
  fetchBoards: () => Promise<void>;
  setCurrentBoard: (board: any) => void;
  setActiveCardModalId: (id: string | number | null) => void;

  createBoard: (title: string, background: string) => Promise<any>;
  deleteBoard: (id: number) => Promise<void>;
  updateBoard: (id: number, title: string) => Promise<void>;

  addList: (boardId: number, title: string) => Promise<void>;
  deleteList: (listId: number) => Promise<void>;
  updateList: (listId: number, title: string) => Promise<void>;

  addCard: (listId: number, title: string) => Promise<void>;
  updateCard: (cardId: number, updates: any) => Promise<void>;
  deleteCard: (cardId: number) => Promise<void>;

  reorderLists: (boardId: number, newLists: any[]) => Promise<void>;
  reorderCards: (newLists: any[]) => Promise<void>;

  handleLabelToggle: (cardId: number, labelId: number, hasLabel: boolean, labelData: any) => Promise<void>;
  
  toggleMember: (cardId: number, userId: number, isAssigned: boolean, user: any) => Promise<void>;
  addChecklist: (cardId: number, title: string) => Promise<void>;
  deleteChecklist: (clId: number, cardId: number) => Promise<void>;
  addChecklistItem: (clId: number, cardId: number, text: string) => Promise<void>;
  toggleChecklistItem: (itemId: number, cardId: number, isCompleted: boolean) => Promise<void>;
  deleteChecklistItem: (itemId: number, cardId: number) => Promise<void>;
}

export const useKanbanStore = create<StoreState>((set, get) => ({
  boards: [],
  currentBoard: null,
  activeCardModalId: null,
  filters: { search: '', labels: [], members: [], due: null },

  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),

  getFilteredCards: (listId) => {
    const state = get();
    if (!state.currentBoard) return [];
    
    const list = state.currentBoard.lists.find((l: any) => l.id === listId);
    if (!list || !list.cards) return [];

    const { search, labels, members, due } = state.filters;

    return list.cards.filter((card: any) => {
      // Search logic
      if (search && !card.title.toLowerCase().includes(search.toLowerCase())) return false;
      
      // Labels logic
      if (labels.length > 0) {
        const cardLabelIds = card.labels?.map((l: any) => l.labelId) || [];
        if (!labels.every(id => cardLabelIds.includes(id))) return false;
      }
      
      // Members logic
      if (members.length > 0) {
        const cardMemberIds = card.members?.map((m: any) => m.userId) || [];
        if (!members.some((id: number) => cardMemberIds.includes(id))) return false;
      }
      
      // Due Date logic
      if (due) {
        if (due === 'no_date' && card.dueDate !== null) return false;
        if (card.dueDate) {
          const dueTime = new Date(card.dueDate).getTime();
          const now = Date.now();
          if (due === 'overdue' && dueTime >= now) return false;
          if (due === 'due_soon' && (dueTime < now || dueTime > now + 86400000)) return false;
        } else if (due === 'overdue' || due === 'due_soon') {
          return false;
        }
      }

      return true;
    });
  },

  fetchBoards: async () => {
    try {
      const { data } = await api.get('/boards');
      set({ boards: data });
      const current = get().currentBoard;
      if (current) {
        set({ currentBoard: data.find((b: any) => b.id === current.id) });
      }
    } catch (error) {
      toast.error('Failed to load boards');
    }
  },

  setCurrentBoard: (board) => set({ currentBoard: board }),
  setActiveCardModalId: (id) => set({ activeCardModalId: id }),

  createBoard: async (title, background) => {
    try {
      const { data } = await api.post('/boards', { title, background });
      set((state) => ({ boards: [data, ...state.boards] }));
      return data;
    } catch {
      toast.error('Failed to create board');
    }
  },

  deleteBoard: async (id) => {
    try {
      await api.delete(`/boards/${id}`);
      set((state) => ({ boards: state.boards.filter(b => b.id !== id) }));
      toast.success('Board deleted');
    } catch {
      toast.error('Failed to delete board');
    }
  },

  updateBoard: async (id, title) => {
    try {
      await api.put(`/boards/${id}`, { title });
      get().fetchBoards();
    } catch {
      toast.error('Failed to rename board');
    }
  },

  addList: async (boardId, title) => {
    try {
      const { data } = await api.post(`/boards/${boardId}/lists`, { title, position: Date.now() });
      set((state) => {
        if (!state.currentBoard) return state;
        return {
          currentBoard: {
            ...state.currentBoard,
            lists: [...state.currentBoard.lists, { ...data, cards: [] }]
          }
        };
      });
      toast.success('List added');
    } catch {
      toast.error('Failed to add list');
    }
  },

  updateList: async (listId, title) => {
    try {
      await api.put(`/lists/${listId}`, { title });
      set((state) => {
        if (!state.currentBoard) return state;
        const lists = state.currentBoard.lists.map((l: any) => l.id === listId ? { ...l, title } : l);
        return { currentBoard: { ...state.currentBoard, lists } };
      });
    } catch {
      toast.error('Failed to rename list');
    }
  },

  deleteList: async (listId) => {
    try {
      await api.delete(`/lists/${listId}`);
      set((state) => {
        if (!state.currentBoard) return state;
        const lists = state.currentBoard.lists.filter((l: any) => l.id !== listId);
        return { currentBoard: { ...state.currentBoard, lists } };
      });
      toast.success('List deleted');
    } catch {
      toast.error('Failed to delete list');
    }
  },

  addCard: async (listId, title) => {
    try {
      const { data } = await api.post(`/lists/${listId}/cards`, { title, position: Date.now() });
      set((state) => {
        if (!state.currentBoard) return state;
        const lists = state.currentBoard.lists.map((l: any) => {
          if (l.id === listId) {
            return { ...l, cards: [...l.cards, data] };
          }
          return l;
        });
        return { currentBoard: { ...state.currentBoard, lists } };
      });
    } catch {
      toast.error('Failed to add card');
    }
  },

  updateCard: async (cardId, updates) => {
    try {
      const { data } = await api.put(`/cards/${cardId}`, updates);
      set((state) => {
        if (!state.currentBoard) return state;
        const lists = state.currentBoard.lists.map((l: any) => ({
          ...l,
          cards: l.cards.map((c: any) => (c.id === cardId ? { ...c, ...data } : c)),
        }));
        return { currentBoard: { ...state.currentBoard, lists } };
      });
    } catch {
      toast.error('Failed to update card');
      throw new Error('Update failed');
    }
  },

  deleteCard: async (cardId) => {
    try {
      await api.delete(`/cards/${cardId}`);
      get().fetchBoards();
      set({ activeCardModalId: null });
      toast.success('Card deleted');
    } catch {
      toast.error('Failed to delete card');
    }
  },

  reorderLists: async (boardId, newLists) => {
    const previousBoard = get().currentBoard;
    set({ currentBoard: { ...previousBoard, lists: newLists } });
    try {
      const items = newLists.map((l: any, idx: number) => ({ id: l.id, position: idx * 1000 }));
      await api.patch('/lists/reorder', { items });
    } catch {
      set({ currentBoard: previousBoard });
      throw new Error('Failed to sync list order');
    }
  },

  reorderCards: async (newLists) => {
    const previousBoard = get().currentBoard;
    set({ currentBoard: { ...previousBoard, lists: newLists } });
    try {
      const items = newLists.flatMap((l: any) => l.cards.map((c: any, idx: number) => ({
        id: c.id, position: idx * 1000, listId: l.id
      })));
      await api.patch('/cards/reorder', { items });
    } catch {
      set({ currentBoard: previousBoard });
      throw new Error('Failed to sync card order');
    }
  },

  handleLabelToggle: async (cardId, labelId, hasLabel, labelData) => {
    try {
      if (hasLabel) {
        await api.delete(`/cards/${cardId}/labels/${labelId}`);
      } else {
        await api.post(`/cards/${cardId}/labels/${labelId}`, {});
      }
      get().fetchBoards();
    } catch {
      toast.error('Failed to toggle label');
    }
  },

  toggleMember: async (cardId, userId, isAssigned, user) => {
    set((state) => {
      if (!state.currentBoard) return state;
      const lists = state.currentBoard.lists.map((l: any) => ({
        ...l,
        cards: l.cards.map((c: any) => {
          if (c.id === cardId) {
            const members = isAssigned 
              ? c.members.filter((m: any) => m.userId !== userId)
              : [...c.members, { cardId, userId, user }];
            return { ...c, members };
          }
          return c;
        })
      }));
      return { currentBoard: { ...state.currentBoard, lists } };
    });
    try {
      if (isAssigned) await api.delete(`/cards/${cardId}/members/${userId}`);
      else await api.post(`/cards/${cardId}/members/${userId}`, {});
    } catch {
      toast.error('Failed to assign member');
      get().fetchBoards();
    }
  },

  addChecklist: async (cardId, title) => {
    try {
      const { data } = await api.post(`/cards/${cardId}/checklists`, { title });
      set((state) => {
        if (!state.currentBoard) return state;
        const lists = state.currentBoard.lists.map((l: any) => ({
          ...l, cards: l.cards.map((c: any) => c.id === cardId ? { ...c, checklists: [...(c.checklists||[]), { ...data, items: [] }] } : c)
        }));
        return { currentBoard: { ...state.currentBoard, lists } };
      });
    } catch { toast.error('Failed to add checklist'); }
  },

  deleteChecklist: async (clId, cardId) => {
    set((state) => {
      if (!state.currentBoard) return state;
      const lists = state.currentBoard.lists.map((l: any) => ({
        ...l, cards: l.cards.map((c: any) => c.id === cardId ? { ...c, checklists: c.checklists.filter((ck: any) => ck.id !== clId) } : c)
      }));
      return { currentBoard: { ...state.currentBoard, lists } };
    });
    try {
      await api.delete(`/checklists/${clId}`);
    } catch {
      toast.error('Failed to delete checklist');
      get().fetchBoards();
    }
  },

  addChecklistItem: async (clId, cardId, text) => {
    try {
      const { data } = await api.post(`/checklists/${clId}/items`, { text });
      set((state) => {
        if (!state.currentBoard) return state;
        const lists = state.currentBoard.lists.map((l: any) => ({
          ...l, cards: l.cards.map((c: any) => c.id === cardId ? { 
            ...c, checklists: c.checklists.map((ck: any) => ck.id === clId ? { ...ck, items: [...ck.items, data] } : ck) 
          } : c)
        }));
        return { currentBoard: { ...state.currentBoard, lists } };
      });
    } catch { toast.error('Failed to add checklist item'); }
  },

  toggleChecklistItem: async (itemId, cardId, isCompleted) => {
    set((state) => {
      if (!state.currentBoard) return state;
      const lists = state.currentBoard.lists.map((l: any) => ({
        ...l, cards: l.cards.map((c: any) => c.id === cardId ? { 
          ...c, checklists: c.checklists.map((ck: any) => ({ 
            ...ck, items: ck.items.map((i: any) => i.id === itemId ? { ...i, isCompleted } : i) 
          })) 
        } : c)
      }));
      return { currentBoard: { ...state.currentBoard, lists } };
    });
    try {
      await api.put(`/checklist-items/${itemId}`, { isCompleted });
    } catch {
      toast.error('Failed to toggle item');
      get().fetchBoards();
    }
  },

  deleteChecklistItem: async (itemId, cardId) => {
    set((state) => {
      if (!state.currentBoard) return state;
      const lists = state.currentBoard.lists.map((l: any) => ({
        ...l, cards: l.cards.map((c: any) => c.id === cardId ? { 
          ...c, checklists: c.checklists.map((ck: any) => ({ 
            ...ck, items: ck.items.filter((i: any) => i.id !== itemId) 
          })) 
        } : c)
      }));
      return { currentBoard: { ...state.currentBoard, lists } };
    });
    try {
      await api.delete(`/checklist-items/${itemId}`);
    } catch {
      toast.error('Failed to delete item');
      get().fetchBoards();
    }
  }

}));
