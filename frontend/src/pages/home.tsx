/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import DashboardMoodTracker from "../components/DashboardMoodTracker";
import { useAuth } from "../context/authContext";
import { getJournals } from "../apis/journals";
import { getHabits } from "../apis/habits";
import { getMoodLogs } from "../apis/moods";
import { getTodayQuote } from "../apis/quotes";
import { calculateStreaksFromDates, type StreakStats } from "../utils/streakCalc";
import type { Journal } from "../types/journal";
import type { Habit } from "../types/habit";
import { BookOpen, Sparkles, Flame, Trophy, Activity, CheckCircle, ArrowRight } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  const [recentJournals, setRecentJournals] = useState<Journal[]>([]);
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  
  // Streaks
  const [journalStreak, setJournalStreak] = useState<StreakStats>({ currentStreak: 0, longestStreak: 0, completionPercent: 0 });
  const [moodStreak, setMoodStreak] = useState<StreakStats>({ currentStreak: 0, longestStreak: 0, completionPercent: 0 });
  const [topHabit, setTopHabit] = useState<Habit | null>(null);
  
  // Habit Summary
  const [habitSummary, setHabitSummary] = useState({ completed: 0, total: 0 });

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [journalRes, habitRes, moodRes, quoteRes] = await Promise.all([
        getJournals(0, 100), // fetch enough to calculate streak
        getHabits(),
        getMoodLogs(undefined, undefined, 0, 100),
        getTodayQuote(),
      ]);

      if (quoteRes.success && quoteRes.data) setQuote(quoteRes.data);

      if (journalRes.success) {
        setRecentJournals(journalRes.data.slice(0, 3));
        const dates = journalRes.data.map((j) => j.created_at.slice(0, 10));
        setJournalStreak(calculateStreaksFromDates(dates, 30));
      }

      if (moodRes.success) {
        const dates = moodRes.data.map((m) => m.logged_date);
        setMoodStreak(calculateStreaksFromDates(dates, 30));
      }

      if (habitRes.success) {
        const habits = habitRes.data;
        const active = habits.filter(h => h.is_active);
        
        setHabitSummary({
          completed: active.filter(h => h.is_completed_today).length,
          total: active.length
        });

        if (active.length > 0) {
          const top = active.reduce((prev, current) => 
            (current.current_streak > prev.current_streak) ? current : prev
          );
          setTopHabit(top);
        }
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const renderStreakCard = (title: string, icon: React.ReactNode, streak: StreakStats | Habit | null, type: 'calculated' | 'habit') => {
    let current = 0;
    let longest = 0;
    let percent = 0;
    let subtitle = "";

    if (type === 'calculated' && streak) {
      const s = streak as StreakStats;
      current = s.currentStreak;
      longest = s.longestStreak;
      percent = s.completionPercent;
      subtitle = "Last 30 days";
    } else if (type === 'habit' && streak) {
      const h = streak as Habit;
      current = h.current_streak;
      longest = h.longest_streak;
      percent = 100; // For habit we don't fetch full history here, so we skip percent or mock it
      subtitle = h.name;
    }

    return (
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 truncate max-w-[120px]">{subtitle}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="bg-orange-50 rounded-2xl p-3 text-center">
            <p className="text-xs font-semibold text-orange-500 uppercase">Current</p>
            <p className="text-xl font-black text-orange-600 flex items-center justify-center gap-1">
              <Flame size={16} /> {current}
            </p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-3 text-center">
            <p className="text-xs font-semibold text-blue-500 uppercase">Longest</p>
            <p className="text-xl font-black text-blue-600 flex items-center justify-center gap-1">
              <Trophy size={16} /> {longest}
            </p>
          </div>
        </div>
        {type === 'calculated' && (
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Completion (30d)</span>
            <span className="text-indigo-600 font-bold">{percent}%</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* HERO */}
        <section className="relative mb-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 sm:p-12 shadow-2xl">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-pink-300/20 blur-3xl" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                <Sparkles size={16} /> Welcome to your summary
              </div>
              <h1 className="mb-4 text-4xl font-black text-white sm:text-5xl">
                Hello, <span className="capitalize">{user?.name || "User"}</span>
              </h1>
              <p className="text-lg text-white/80">
                Here's a quick overview of your well-being, habits, and reflections.
              </p>
            </div>

            <div className="w-full xl:max-w-sm rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <p className="mb-4 text-xs uppercase tracking-widest text-white/60">Quote of the Day</p>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 rounded bg-white/20" />
                  <div className="h-4 w-5/6 rounded bg-white/20" />
                </div>
              ) : (
                <>
                  <p className="mb-4 text-xl italic text-white leading-relaxed">
                    "{quote?.text || "Write for your soul and heal your mind."}"
                  </p>
                  <p className="font-medium text-white/80">— {quote?.author || "Unknown"}</p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* SUMMARY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COL: Streaks & Habit Summary */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Habit Completion Progress */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="text-emerald-500" /> Daily Habits
                </h2>
                <p className="text-gray-500 mt-1 text-sm">Your progress for today.</p>
                <div className="mt-5">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-gray-700">Completion</span>
                    <span className="text-emerald-600">{habitSummary.completed} / {habitSummary.total}</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-700 rounded-full"
                      style={{ width: habitSummary.total > 0 ? `${(habitSummary.completed / habitSummary.total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
              <Link to="/habits" className="hidden sm:flex shrink-0 w-14 h-14 bg-emerald-50 items-center justify-center rounded-2xl text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                <ArrowRight size={24} />
              </Link>
            </div>

            {/* Streaks Row */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 px-2">Your Streaks</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderStreakCard("Top Habit", <Activity />, topHabit, 'habit')}
                {renderStreakCard("Journaling", <BookOpen />, journalStreak, 'calculated')}
                {renderStreakCard("Mood Tracking", <Sparkles />, moodStreak, 'calculated')}
              </div>
            </div>

            {/* Recent Journals */}
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="text-indigo-500" /> Recent Journals
                </h2>
                <Link to="/journals" className="text-sm font-semibold text-indigo-600 hover:underline">View All</Link>
              </div>
              
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-16 bg-gray-100 rounded-2xl" />
                  <div className="h-16 bg-gray-100 rounded-2xl" />
                </div>
              ) : recentJournals.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No journal entries yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentJournals.map(journal => (
                    <Link key={journal.id} to="/journals" className="block group">
                      <div className="p-4 rounded-2xl border border-gray-50 bg-gray-50 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-indigo-900">{journal.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{new Date(journal.created_at).toLocaleDateString()}</p>
                        </div>
                        <ArrowRight size={16} className="text-gray-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COL: Mood Tracker */}
          <div className="lg:col-span-1">
            <DashboardMoodTracker />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;