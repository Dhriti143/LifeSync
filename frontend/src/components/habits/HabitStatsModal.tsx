import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getHabitStats } from "../../apis/habits";
import type { HabitStats } from "../../types/habit";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  habitId: number | null;
  habitName: string;
}

const HabitStatsModal = ({ isOpen, onClose, habitId, habitName }: Props) => {
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !habitId) return;
    setLoading(true);
    getHabitStats(habitId)
      .then((res) => { if (res.success) setStats(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, habitId]);

  if (!isOpen) return null;

  // Build a set of completed date strings for fast lookup
  const completedSet = new Set(stats?.history ?? []);

  // Build last 30 days for the calendar grid
  const today = new Date();
  const days: Date[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  const toKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-7 py-5 text-white">
          <div>
            <h2 className="text-lg font-bold">{habitName}</h2>
            <p className="text-xs text-white/70">Completion history — last 30 days</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 transition hover:bg-white/20">
            <X size={20} />
          </button>
        </div>

        <div className="p-7">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            </div>
          ) : (
            <>
              {/* Streak cards */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-2xl bg-orange-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-xl">
                    🔥
                  </div>
                  <div>
                    <p className="text-xs font-medium text-orange-500 uppercase tracking-wide">Current</p>
                    <p className="text-2xl font-black text-orange-600">{stats?.current_streak ?? 0}
                      <span className="text-sm font-semibold ml-1">days</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-violet-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-xl">
                    🏆
                  </div>
                  <div>
                    <p className="text-xs font-medium text-violet-500 uppercase tracking-wide">Longest</p>
                    <p className="text-2xl font-black text-violet-600">{stats?.longest_streak ?? 0}
                      <span className="text-sm font-semibold ml-1">days</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Calendar grid — last 30 days */}
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Last 30 days</p>
              <div className="grid grid-cols-10 gap-1.5">
                {days.map((d) => {
                  const key = toKey(d);
                  const done = completedSet.has(key);
                  const isToday = key === toKey(today);
                  return (
                    <div
                      key={key}
                      title={key}
                      className={`aspect-square rounded-lg transition-all ${
                        done
                          ? "bg-violet-500 shadow-sm shadow-violet-300"
                          : isToday
                          ? "border-2 border-violet-300 bg-violet-50"
                          : "bg-gray-100"
                      }`}
                    />
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-end gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-gray-100" />Miss</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-violet-500" />Done</span>
              </div>

              {/* Total count */}
              <p className="mt-5 text-center text-sm text-gray-500">
                <span className="font-bold text-violet-600">{stats?.history.length ?? 0}</span> total completions
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitStatsModal;
