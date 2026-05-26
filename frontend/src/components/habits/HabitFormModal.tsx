import { useState, useEffect } from "react";
import { X, Zap } from "lucide-react";
import { createHabit, updateHabit } from "../../apis/habits";
import type { Habit, HabitCreateRequest } from "../../types/habit";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingHabit?: Habit | null;
}

const frequencies = ["daily", "weekly"];

const HabitFormModal = ({ isOpen, onClose, onSuccess, editingHabit }: Props) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<HabitCreateRequest>({
    name: "",
    description: "",
    frequency: "daily",
  });

  useEffect(() => {
    if (editingHabit) {
      setForm({
        name: editingHabit.name,
        description: editingHabit.description ?? "",
        frequency: editingHabit.frequency,
      });
    } else {
      setForm({ name: "", description: "", frequency: "daily" });
    }
  }, [editingHabit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, form);
      } else {
        await createHabit(form);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-7 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Zap size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold">{editingHabit ? "Edit Habit" : "New Habit"}</h2>
              <p className="text-xs text-white/70">{editingHabit ? "Update your habit" : "Build a new daily habit"}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 transition hover:bg-white/20">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Habit Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Read 10 pages"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Description</label>
            <input
              type="text"
              placeholder="Optional description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Frequency</label>
            <div className="flex gap-3">
              {frequencies.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setForm({ ...form, frequency: f })}
                  className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold capitalize transition ${
                    form.frequency === f
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:shadow-xl hover:scale-[1.02] disabled:opacity-60"
            >
              {loading ? "Saving…" : editingHabit ? "Update Habit" : "Create Habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitFormModal;
