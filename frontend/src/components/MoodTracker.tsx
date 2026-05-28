/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { Trash2, StickyNote, TrendingUp } from "lucide-react";
import { createMoodLog, getMoodLogs, getMoodStats, deleteMoodLog } from "../apis/moods";
import type { MoodLog } from "../types/mood";

const MOODS = [
  { label: "Happy",      emoji: "😊", color: "bg-yellow-400", light: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-300" },
  { label: "Sad",        emoji: "😢", color: "bg-blue-400",   light: "bg-blue-50",   text: "text-blue-700",   ring: "ring-blue-300"   },
  { label: "Calm",       emoji: "😌", color: "bg-teal-400",   light: "bg-teal-50",   text: "text-teal-700",   ring: "ring-teal-300"   },
  { label: "Anxious",    emoji: "😰", color: "bg-orange-400", light: "bg-orange-50", text: "text-orange-700", ring: "ring-orange-300" },
  { label: "Grateful",   emoji: "🙏", color: "bg-pink-400",   light: "bg-pink-50",   text: "text-pink-700",   ring: "ring-pink-300"   },
  { label: "Productive", emoji: "🧠", color: "bg-violet-400", light: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-300" },
];

const moodMeta = Object.fromEntries(MOODS.map((m) => [m.label, m]));

const MoodTracker = () => {
  const [logs, setLogs]         = useState<MoodLog[]>([]);
  const [stats, setStats]       = useState<Record<string, number>>({});
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [noteOpen, setNoteOpen]         = useState(false);
  const [note, setNote]                 = useState("");

  const fetchAll = useCallback(async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([getMoodLogs(), getMoodStats()]);
      if (logsRes.success)  setLogs(logsRes.data);
      if (statsRes.success) setStats(statsRes.data.stats ?? {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLog = async () => {
    if (!selectedMood || submitting) return;
    setSubmitting(true);
    try {
      await createMoodLog({ mood: selectedMood, notes: note.trim() || undefined });
      setSelectedMood(null);
      setNote("");
      setNoteOpen(false);
      await fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMoodLog(id);
      await fetchAll();
    } catch (e) { console.error(e); }
  };

  const d = new Date();
  const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const todayLogs = logs.filter((l) => l.logged_date === todayKey);
  const totalLogged = Object.values(stats).reduce((a, b) => a + b, 0);

  // Generate days for current month
  const todayDate = new Date();
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(year, month, i));

  const logsMap = new Map();
  logs.forEach(l => logsMap.set(l.logged_date, l));

  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-lg">
          🌸
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Mood Tracker</h2>
          <p className="text-xs text-gray-400">How are you feeling today?</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Mood Picker */}
        <div className="grid grid-cols-3 gap-2">
          {MOODS.map((m) => {
            const active = selectedMood === m.label;
            return (
              <button
                key={m.label}
                onClick={() => {
                  setSelectedMood(active ? null : m.label);
                  if (active) setNoteOpen(false);
                }}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3 text-xs font-semibold transition-all duration-200 ${
                  active
                    ? `border-transparent ${m.light} ${m.text} ring-2 ${m.ring} scale-105 shadow-sm`
                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-white hover:scale-105"
                }`}
              >
                <span className="text-2xl leading-none">{m.emoji}</span>
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Note toggle + Log button */}
        {selectedMood && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => setNoteOpen(!noteOpen)}
              className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition"
            >
              <StickyNote size={13} />
              {noteOpen ? "Hide note" : "Add a note (optional)"}
            </button>

            {noteOpen && (
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition"
              />
            )}

            <button
              onClick={handleLog}
              disabled={submitting}
              className={`w-full rounded-xl py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 ${
                moodMeta[selectedMood]?.color ?? "bg-pink-500"
              }`}
            >
              {submitting ? "Logging…" : `Log ${selectedMood} ${moodMeta[selectedMood]?.emoji}`}
            </button>
          </div>
        )}

        {/* Today's moods */}
        {todayLogs.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Today</p>
            <div className="space-y-1.5">
              {todayLogs.map((log) => {
                const meta = moodMeta[log.mood];
                return (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 ${meta?.light ?? "bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{meta?.emoji ?? "😶"}</span>
                      <div>
                        <p className={`text-xs font-bold ${meta?.text ?? "text-gray-700"}`}>{log.mood}</p>
                        {log.notes && <p className="text-xs text-gray-400 truncate max-w-[140px]">{log.notes}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="rounded-lg p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Monthly Calendar */}
        {!loading && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">This Month</p>
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-gray-400 font-semibold pb-1">{d}</div>)}
              {calendarDays.map((d, i) => {
                if (!d) return <div key={`empty-${i}`} className="p-2" />;
                
                // Adjust for timezone differences to ensure correct YYYY-MM-DD
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                const dateStr = `${yyyy}-${mm}-${dd}`;
                
                const log = logsMap.get(dateStr);
                const meta = log ? moodMeta[log.mood] : null;
                const isToday = dateStr === todayKey;

                return (
                  <div
                    key={dateStr}
                    title={log ? `${log.mood}${log.notes ? ` - ${log.notes}` : ''}` : ''}
                    className={`aspect-square flex items-center justify-center rounded-lg transition-all ${
                      meta ? meta.light : isToday ? 'border border-gray-200 bg-gray-50' : 'bg-transparent text-gray-400'
                    } ${meta ? 'cursor-help hover:scale-110 shadow-sm' : ''}`}
                  >
                    {meta ? (
                      <span className="text-lg leading-none">{meta.emoji}</span>
                    ) : (
                      <span>{d.getDate()}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats bar chart */}
        {totalLogged > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <TrendingUp size={13} className="text-gray-400" />
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Distribution</p>
            </div>
            <div className="space-y-2">
              {Object.entries(stats)
                .sort(([, a], [, b]) => b - a)
                .map(([mood, count]) => {
                  const meta = moodMeta[mood];
                  const pct = Math.round((count / totalLogged) * 100);
                  return (
                    <div key={mood} className="flex items-center gap-2">
                      <span className="text-sm w-5 text-center">{meta?.emoji ?? "😶"}</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${meta?.color ?? "bg-gray-400"} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-400 w-7 text-right">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && logs.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">
            Select a mood above to start tracking 💡
          </p>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
