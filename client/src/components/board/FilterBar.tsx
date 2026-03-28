import { useKanbanStore } from "@/store/useKanbanStore";

const GLOBAL_LABELS = [
  { id: 1, name: "Bug", color: "#ef4444" },
  { id: 2, name: "Feature", color: "#3b82f6" },
  { id: 3, name: "High Priority", color: "#eab308" },
  { id: 4, name: "Design", color: "#a855f7" },
  { id: 5, name: "Backend", color: "#22c55e" },
  { id: 6, name: "Frontend", color: "#f97316" }
];

export default function FilterBar() {
  const { filters, setFilters } = useKanbanStore();

  const toggleLabel = (labelId: number) => {
    const newLabels = filters.labels.includes(labelId)
      ? filters.labels.filter(id => id !== labelId)
      : [...filters.labels, labelId];
    setFilters({ labels: newLabels });
  };

  const clearAll = () => {
    setFilters({ search: '', labels: [], members: [], due: null });
  };

  return (
    <div className="bg-black/20 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start gap-4 sm:gap-8 text-sm text-slate-200 z-10 relative shadow-sm">
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-white/80">Labels</span>
        <div className="flex flex-wrap gap-2">
          {GLOBAL_LABELS.map(gl => {
            const isSelected = filters.labels.includes(gl.id);
            return (
              <button 
                key={gl.id}
                onClick={() => toggleLabel(gl.id)}
                className={`px-3 py-1 rounded-full text-white font-semibold transition-all shadow-sm ${isSelected ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                style={{ background: gl.color }}
              >
                {gl.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-semibold text-white/80">Due Date</span>
        <select 
          value={filters.due || ""} 
          onChange={(e) => setFilters({ due: e.target.value || null })}
          className="bg-white/10 text-white rounded-lg px-3 py-1.5 outline-none border border-white/20 focus:border-blue-400 font-medium appearance-none cursor-pointer hover:bg-white/20 transition-colors"
        >
          <option value="" className="text-slate-800">Any Due Date</option>
          <option value="overdue" className="text-slate-800 text-red-600 font-semibold">Overdue</option>
          <option value="due_soon" className="text-slate-800 text-yellow-600 font-semibold">Due Soon</option>
          <option value="no_date" className="text-slate-800">No Date</option>
        </select>
      </div>

      <div className="sm:ml-auto w-full sm:w-auto flex items-end mt-2 sm:mt-0">
        <button 
          onClick={clearAll}
          className="w-full sm:w-auto px-4 py-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors shadow-sm"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}
