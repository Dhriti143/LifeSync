import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, TrendingUp } from "lucide-react";
import Navbar from "../components/Navbar";
import { getMoodLogs, getMoodStats } from "../apis/moods";
import type { MoodLog } from "../types/mood";
import { moodMeta } from "../components/DashboardMoodTracker";

const MoodsPage = () => {
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  
  // Modal state
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch 100 logs to ensure we cover the month.
      const [logsRes, statsRes] = await Promise.all([
        getMoodLogs(undefined, undefined, 0, 100),
        getMoodStats()
      ]);
      if (logsRes.success) {
        // Sort chronologically (oldest to newest)
        const sorted = logsRes.data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setLogs(sorted);
      }
      if (statsRes.success) setStats(statsRes.data.stats ?? {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrev = () => {
    setAnchorDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNext = () => {
    setAnchorDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleToday = () => {
    setAnchorDate(new Date());
  };

  const toKey = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Group logs by date
  const logsByDate = useMemo(() => {
    const map = new Map<string, MoodLog[]>();
    logs.forEach(l => {
      const existing = map.get(l.logged_date) || [];
      existing.push(l);
      map.set(l.logged_date, existing);
    });
    return map;
  }, [logs]);

  // Generate calendar grid (including padding days for the month)
  const calendarDays = useMemo(() => {
    const year = anchorDate.getFullYear();
    const month = anchorDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    
    // pad end of month to complete grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 0; i < remaining; i++) days.push(null);

    return days;
  }, [anchorDate]);

  const todayKey = toKey(new Date());
  const totalLogged = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Mood Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">View how your feelings change over time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Calendar View */}
          <div className="md:col-span-2 bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800">
                {anchorDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToday}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:text-gray-900 transition"
                >
                  Today
                </button>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <button onClick={handlePrev} className="p-1.5 text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="w-px h-5 bg-gray-200" />
                  <button onClick={handleNext} className="p-1.5 text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-3 text-center">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                    <div key={i} className="text-gray-400 font-bold text-xs uppercase tracking-widest pb-2">{d}</div>
                  ))}
                  
                  {calendarDays.map((d, i) => {
                    if (!d) return <div key={`empty-${i}`} className="aspect-square" />;
                    
                    const dateStr = toKey(d);
                    const dayLogs = logsByDate.get(dateStr) || [];
                    const isToday = dateStr === todayKey;
                    
                    // Multi-mood UI logic:
                    // Latest mood is the last item in the array (since we sorted oldest to newest)
                    const latestLog = dayLogs[dayLogs.length - 1];
                    const meta = latestLog ? moodMeta[latestLog.mood] : null;
                    const additionalCount = dayLogs.length > 1 ? dayLogs.length - 1 : 0;

                    return (
                      <button
                        key={dateStr}
                        disabled={dayLogs.length === 0}
                        onClick={() => setSelectedDay(dateStr)}
                        className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl transition-all ${
                          meta ? meta.light : isToday ? 'border-2 border-gray-200 bg-gray-50' : 'bg-gray-50 border border-transparent'
                        } ${dayLogs.length > 0 ? 'cursor-pointer hover:scale-105 hover:shadow-md' : 'cursor-default opacity-60'}`}
                      >
                        <span className={`absolute top-2 left-2 text-[10px] font-bold ${isToday ? 'text-pink-500' : 'text-gray-400'}`}>
                          {d.getDate()}
                        </span>
                        
                        {meta && (
                          <div className="mt-3 flex flex-col items-center">
                            <span className="text-3xl leading-none drop-shadow-sm">{meta.emoji}</span>
                            {additionalCount > 0 && (
                              <span className={`mt-1 text-[10px] font-black rounded-full px-2 py-0.5 ${meta.color} text-white`}>
                                +{additionalCount}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-pink-500" /> Distribution
            </h2>
            
            {totalLogged === 0 ? (
              <p className="text-gray-400 text-sm italic">No moods logged yet.</p>
            ) : (
              <div className="space-y-4 flex-1">
                {Object.entries(stats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([mood, count]) => {
                    const meta = moodMeta[mood];
                    const pct = Math.round((count / totalLogged) * 100);
                    return (
                      <div key={mood}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            {meta?.emoji} {mood}
                          </span>
                          <span className="text-xs font-semibold text-gray-400">{count} times</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${meta?.color ?? "bg-gray-400"} transition-all duration-1000`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Day Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {new Date(selectedDay + "T00:00:00").toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Daily Mood Timeline</p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
                {(logsByDate.get(selectedDay) || []).map((log, idx) => {
                  const meta = moodMeta[log.mood];
                  const timeString = new Date(log.created_at + (log.created_at.endsWith("Z") ? "" : "Z")).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={log.id} className="relative pl-6">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[17px] top-1 h-8 w-8 rounded-full border-4 border-white flex items-center justify-center text-sm shadow-sm ${meta?.color ?? 'bg-gray-400'} text-white`}>
                        {meta?.emoji}
                      </div>
                      
                      <div className={`p-4 rounded-2xl ${meta?.light ?? 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-bold ${meta?.text ?? 'text-gray-700'}`}>{log.mood}</h4>
                          <span className="text-xs font-bold text-gray-400">{timeString}</span>
                        </div>
                        {log.notes ? (
                          <p className="text-sm text-gray-600">{log.notes}</p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No notes added.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodsPage;
