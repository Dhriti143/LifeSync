/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { Trash2, StickyNote } from "lucide-react";
import { createMoodLog, getMoodLogs, deleteMoodLog } from "../apis/moods";
import type { MoodLog } from "../types/mood";

const MOODS = [
  { label: "Happy",      emoji: "😊", color: "bg-yellow-400", light: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-300" },
  { label: "Sad",        emoji: "😢", color: "bg-blue-400",   light: "bg-blue-50",   text: "text-blue-700",   ring: "ring-blue-300"   },
  { label: "Calm",       emoji: "😌", color: "bg-teal-400",   light: "bg-teal-50",   text: "text-teal-700",   ring: "ring-teal-300"   },
  { label: "Anxious",    emoji: "😰", color: "bg-orange-400", light: "bg-orange-50", text: "text-orange-700", ring: "ring-orange-300" },
  { label: "Grateful",   emoji: "🙏", color: "bg-pink-400",   light: "bg-pink-50",   text: "text-pink-700",   ring: "ring-pink-300"   },
  { label: "Productive", emoji: "🧠", color: "bg-violet-400", light: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-300" },
];

export const moodMeta = Object.fromEntries(MOODS.map((m) => [m.label, m]));

const DashboardMoodTracker = () => {
  const [logs, setLogs]         = useState<MoodLog[]>([]);
  const [, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [noteOpen, setNoteOpen]         = useState(false);
  const [note, setNote]                 = useState("");

  const fetchTodayLogs = useCallback(async () => {
    try {
      const d = new Date();
      const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const res = await getMoodLogs(todayKey, todayKey);
      if (res.success) {
        // Sort chronologically (oldest to newest) for timeline, 
        // or newest to oldest. Let's do newest to oldest so recent is at top.
        const sorted = res.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setLogs(sorted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTodayLogs(); }, [fetchTodayLogs]);

  const handleLog = async () => {
    if (!selectedMood || submitting) return;
    setSubmitting(true);
    try {
      await createMoodLog({ mood: selectedMood, notes: note.trim() || undefined });
      setSelectedMood(null);
      setNote("");
      setNoteOpen(false);
      await fetchTodayLogs();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMoodLog(id);
      await fetchTodayLogs();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-lg">
          🌸
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Log Your Mood</h2>
          <p className="text-xs text-gray-400">How are you feeling right now?</p>
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

        {/* Today's Timeline */}
        {logs.length > 0 && (
          <div className="pt-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Today's Timeline</p>
            <div className="space-y-3">
              {logs.map((log) => {
                const meta = moodMeta[log.mood];
                // Try parsing created_at as local time, fallback to GMT if it's missing Z.
                const timeString = new Date(log.created_at + (log.created_at.endsWith("Z") ? "" : "Z")).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div
                    key={log.id}
                    className={`relative flex gap-3 rounded-xl p-3 ${meta?.light ?? "bg-gray-50"}`}
                  >
                    <div className="flex flex-col items-center gap-1 min-w-[48px]">
                      <span className="text-2xl leading-none">{meta?.emoji ?? "😶"}</span>
                      <span className="text-[10px] font-bold text-gray-500">{timeString}</span>
                    </div>
                    
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${meta?.text ?? "text-gray-700"}`}>{log.mood}</p>
                      {log.notes && <p className="text-xs text-gray-600 mt-1">{log.notes}</p>}
                    </div>

                    <button
                      onClick={() => handleDelete(log.id)}
                      className="absolute top-2 right-2 rounded-lg p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 transition"
                      title="Delete entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardMoodTracker;
