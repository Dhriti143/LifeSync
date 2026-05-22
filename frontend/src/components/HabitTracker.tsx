import { useState, useEffect, useCallback } from "react";
import { Plus, BarChart2, Edit2, Trash2, Check, Flame, Zap } from "lucide-react";
import { getHabits, logHabit, undoHabit, deleteHabit } from "../apis/habits";
import HabitFormModal from "./HabitFormModal";
import HabitStatsModal from "./HabitStatsModal";
import type { Habit } from "../types/habit";

const HabitTracker = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<number>>(new Set());

  // Form modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Stats modal
  const [statsOpen, setStatsOpen] = useState(false);
  const [statsHabit, setStatsHabit] = useState<{ id: number; name: string } | null>(null);

  const fetchHabits = useCallback(async () => {
    try {
      const res = await getHabits();
      if (res.success) setHabits(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const handleToggle = async (habit: Habit) => {
    if (toggling.has(habit.id)) return;
    setToggling((prev) => new Set(prev).add(habit.id));
    try {
      if (habit.is_completed_today) {
        await undoHabit(habit.id);
      } else {
        await logHabit(habit.id);
      }
      await fetchHabits();
    } catch (e) {
      console.error(e);
    } finally {
      setToggling((prev) => { const s = new Set(prev); s.delete(habit.id); return s; });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this habit?")) return;
    try {
      await deleteHabit(id);
      await fetchHabits();
    } catch (e) { console.error(e); }
  };

  const openCreate = () => { setEditingHabit(null); setFormOpen(true); };
  const openEdit = (h: Habit) => { setEditingHabit(h); setFormOpen(true); };
  const openStats = (h: Habit) => { setStatsHabit({ id: h.id, name: h.name }); setStatsOpen(true); };

  const completedCount = habits.filter((h) => h.is_completed_today).length;

  return (
    <>
      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
              <Zap size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Daily Habits</h2>
              {!loading && habits.length > 0 && (
                <p className="text-xs text-gray-400">
                  {completedCount}/{habits.length} done today
                </p>
              )}
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 hover:scale-105"
          >
            <Plus size={14} /> New
          </button>
        </div>

        {/* Progress bar */}
        {!loading && habits.length > 0 && (
          <div className="px-6 pt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${(completedCount / habits.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* List */}
        <div className="divide-y divide-gray-50 px-2 py-2">
          {loading ? (
            <div className="space-y-3 px-4 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-1/2 rounded bg-gray-100" />
                    <div className="h-2.5 w-1/3 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : habits.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-2xl mb-2">🎯</p>
              <p className="text-sm font-medium text-gray-500">No habits yet</p>
              <button
                onClick={openCreate}
                className="mt-3 text-xs font-semibold text-violet-600 hover:underline"
              >
                Create your first habit
              </button>
            </div>
          ) : (
            habits.map((habit) => {
              const isToggling = toggling.has(habit.id);
              const done = habit.is_completed_today;
              return (
                <div
                  key={habit.id}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all ${
                    done ? "bg-violet-50/60" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Toggle button */}
                  <button
                    onClick={() => handleToggle(habit)}
                    disabled={isToggling}
                    className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      done
                        ? "border-violet-500 bg-violet-500 text-white shadow-md shadow-violet-200"
                        : "border-gray-300 bg-white hover:border-violet-400"
                    } ${isToggling ? "scale-90 opacity-60" : "hover:scale-110"}`}
                  >
                    {isToggling ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : done ? (
                      <Check size={14} strokeWidth={3} />
                    ) : null}
                  </button>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate transition-colors ${done ? "text-violet-700 line-through decoration-violet-300" : "text-gray-800"}`}>
                      {habit.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-3">
                      {habit.current_streak > 0 && (
                        <span className="flex items-center gap-0.5 text-xs font-semibold text-orange-500">
                          🔥 {habit.current_streak}d
                        </span>
                      )}
                      {habit.longest_streak > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-gray-400">
                          🏆 {habit.longest_streak}d
                        </span>
                      )}
                      <span className="text-xs capitalize text-gray-300">{habit.frequency}</span>
                    </div>
                  </div>

                  {/* Actions — visible on hover */}
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openStats(habit)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-600 transition"
                    >
                      <BarChart2 size={15} />
                    </button>
                    <button
                      onClick={() => openEdit(habit)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <HabitFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchHabits}
        editingHabit={editingHabit}
      />
      <HabitStatsModal
        isOpen={statsOpen}
        onClose={() => setStatsOpen(false)}
        habitId={statsHabit?.id ?? null}
        habitName={statsHabit?.name ?? ""}
      />
    </>
  );
};

export default HabitTracker;
