import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import Navbar from "../components/Navbar";
import HabitTracker from "../components/HabitTracker";
import { getHabits, getHabitStats, logHabit, undoHabit } from "../apis/habits";
import type { Habit } from "../types/habit";

type ViewMode = "weekly" | "monthly";

const HabitsPage = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [statsMap, setStatsMap] = useState<Record<number, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("weekly");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  
  // Track which (habitId, date) pairs are currently being toggled
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const habitsRes = await getHabits();
      if (habitsRes.success) {
        setHabits(habitsRes.data);
        const newStatsMap: Record<number, Set<string>> = {};
        
        // Fetch stats for all habits concurrently
        const statsPromises = habitsRes.data.map(async (habit) => {
          try {
            const statsRes = await getHabitStats(habit.id);
            if (statsRes.success) {
              newStatsMap[habit.id] = new Set(statsRes.data.history);
            }
          } catch (e) {
            console.error(`Failed to fetch stats for ${habit.id}`, e);
          }
        });

        await Promise.all(statsPromises);
        setStatsMap(newStatsMap);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toKey = (d: Date) => {
    // Return YYYY-MM-DD in local time
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Generate days based on view and anchorDate
  const days = useMemo(() => {
    const arr: Date[] = [];
    const base = new Date(anchorDate);
    base.setHours(0, 0, 0, 0);

    if (view === "weekly") {
      // Find the Monday of the current week
      const day = base.getDay();
      const diff = base.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(base.setDate(diff));
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        arr.push(d);
      }
    } else {
      // Monthly view: all days in the current month
      const endOfMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      
      for (let i = 1; i <= endOfMonth.getDate(); i++) {
        const d = new Date(base.getFullYear(), base.getMonth(), i);
        arr.push(d);
      }
    }
    return arr;
  }, [view, anchorDate]);

  const handlePrev = () => {
    setAnchorDate((prev) => {
      const d = new Date(prev);
      if (view === "weekly") d.setDate(d.getDate() - 7);
      else d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNext = () => {
    setAnchorDate((prev) => {
      const d = new Date(prev);
      if (view === "weekly") d.setDate(d.getDate() + 7);
      else d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleToday = () => {
    setAnchorDate(new Date());
  };

  const handleToggle = async (habitId: number, dateKey: string) => {
    const toggleKey = `${habitId}-${dateKey}`;
    if (toggling.has(toggleKey)) return;

    // Optimistically update
    const isCompleted = statsMap[habitId]?.has(dateKey);
    
    setStatsMap((prev) => {
      const next = { ...prev };
      if (!next[habitId]) next[habitId] = new Set();
      const nextSet = new Set(next[habitId]);
      
      if (isCompleted) {
        nextSet.delete(dateKey);
      } else {
        nextSet.add(dateKey);
      }
      next[habitId] = nextSet;
      return next;
    });

    setToggling((prev) => new Set(prev).add(toggleKey));

    try {
      if (isCompleted) {
        await undoHabit(habitId, dateKey);
      } else {
        await logHabit(habitId, dateKey);
      }
    } catch (e) {
      console.error("Failed to toggle habit", e);
      // Revert on failure
      setStatsMap((prev) => {
        const next = { ...prev };
        const nextSet = new Set(next[habitId]);
        if (isCompleted) nextSet.add(dateKey);
        else nextSet.delete(dateKey);
        next[habitId] = nextSet;
        return next;
      });
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(toggleKey);
        return next;
      });
    }
  };

  const formatPeriodLabel = () => {
    if (view === "weekly") {
      if (days.length === 0) return "";
      const start = days[0];
      const end = days[days.length - 1];
      const monthStart = start.toLocaleString("default", { month: "short" });
      const monthEnd = end.toLocaleString("default", { month: "short" });
      if (monthStart === monthEnd) {
        return `${monthStart} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${monthStart} ${start.getDate()} - ${monthEnd} ${end.getDate()}, ${end.getFullYear()}`;
    } else {
      return anchorDate.toLocaleString("default", { month: "long", year: "numeric" });
    }
  };

  const todayKey = toKey(new Date());

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Habit Calendar</h1>
            <p className="mt-1 text-sm text-gray-500">Track your progress over time.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            <button
              onClick={() => setView("weekly")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                view === "weekly" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setView("monthly")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                view === "monthly" ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* HabitTracker List View */}
        <div className="mb-10">
          <HabitTracker />
        </div>

        {/* Calendar Grid View */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Controls */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800">{formatPeriodLabel()}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:text-gray-900 transition"
              >
                Today
              </button>
              <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={handlePrev}
                  className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="w-px h-5 bg-gray-200" />
                <button
                  onClick={handleNext}
                  className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                <p className="mt-4 text-sm font-medium text-gray-500">Loading your habits...</p>
              </div>
            ) : habits.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-4xl mb-3">🌱</p>
                <h3 className="text-xl font-bold text-gray-900">No habits found</h3>
                <p className="mt-1 text-gray-500">Head to the Dashboard to create your first habit.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-r border-gray-100 font-bold text-gray-900 min-w-[200px] shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
                      Habit
                    </th>
                    {days.map((d) => {
                      const dateKey = toKey(d);
                      const isToday = dateKey === todayKey;
                      return (
                        <th
                          key={dateKey}
                          className={`px-3 py-4 border-b border-gray-100 text-center min-w-[50px] ${
                            isToday ? "bg-indigo-50/50" : ""
                          }`}
                        >
                          <div className={`text-xs font-semibold mb-1 ${isToday ? "text-indigo-600" : "text-gray-500"}`}>
                            {d.toLocaleString("default", { weekday: "short" })}
                          </div>
                          <div className={`text-sm font-bold ${
                            isToday
                              ? "inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white shadow-md"
                              : "text-gray-900"
                          }`}>
                            {d.getDate()}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {habits.map((habit) => (
                    <tr key={habit.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="sticky left-0 z-10 bg-white px-6 py-4 border-r border-gray-100 shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
                        <div className="font-semibold text-gray-900 truncate max-w-[200px]" title={habit.name}>
                          {habit.name}
                        </div>
                        <div className="text-xs text-gray-400 capitalize mt-0.5">
                          {habit.frequency}
                        </div>
                      </td>
                      {days.map((d) => {
                        const dateKey = toKey(d);
                        const isToday = dateKey === todayKey;
                        const isCompleted = statsMap[habit.id]?.has(dateKey);
                        const isToggling = toggling.has(`${habit.id}-${dateKey}`);
                        // Future date check
                        const isFuture = d > new Date() && dateKey !== todayKey;

                        return (
                          <td
                            key={dateKey}
                            className={`px-1 py-2 text-center ${isToday ? "bg-indigo-50/30" : ""}`}
                          >
                            <button
                              onClick={() => !isFuture && handleToggle(habit.id, dateKey)}
                              disabled={isFuture || isToggling}
                              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
                                isFuture
                                  ? "opacity-30 cursor-not-allowed bg-gray-50 border-gray-100"
                                  : isToggling
                                  ? "opacity-50 scale-95"
                                  : isCompleted
                                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-200 hover:bg-indigo-600 hover:scale-110"
                                  : "bg-white border-2 border-gray-200 text-transparent hover:border-indigo-300 hover:bg-indigo-50 hover:scale-110"
                              }`}
                            >
                              {isToggling ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <Check size={16} strokeWidth={isCompleted ? 3 : 2} className={isCompleted ? "opacity-100" : "opacity-0"} />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HabitsPage;
