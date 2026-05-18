import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { createJournal, updateJournal } from "../apis/journals";
import type { Journal } from "../types/journal";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingJournal?: Journal | null;
}

const moods = ["Happy", "Sad", "Calm", "Anxious", "Grateful", "Productive"];
const JournalFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    editingJournal,
}: Props) => {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        mood: "",
    });

    useEffect(() => {
        if (editingJournal) { setFormData({
                title: editingJournal.title,
                content: editingJournal.content,
                mood: editingJournal.mood || "",
            });
        } else {
            setFormData({
                title: "",
                content: "",
                mood: "",
            });
        }
    }, [editingJournal, isOpen]);

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (editingJournal) {
                await updateJournal(editingJournal.id, {
                    title: formData.title,
                    content: formData.content,
                    mood: formData.mood,
                });
            } else {
                await createJournal(formData);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to save journal:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl md:h-[92vh] md:max-w-4xl md:rounded-3xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-5 text-white">

                    <div>
                        <h2 className="text-2xl font-bold">
                            {editingJournal
                                ? "Edit Journal"
                                : "New Journal"}
                        </h2>

                        <p className="mt-1 text-sm text-white/80">
                            {editingJournal
                                ? "Continue refining your thoughts"
                                : "Capture your thoughts beautifully"}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 transition hover:bg-white/20"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-1 flex-col overflow-y-auto px-8 py-6"
                >

                    {/* Title */}
                    <input
                        type="text"
                        required
                        placeholder="Journal title..."
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                title: e.target.value,
                            })
                        }
                        className="mb-6 border-none text-4xl font-bold text-gray-900 outline-none placeholder:text-gray-300"
                    />

                    {/* Mood + Date */}
                    <div className="mb-6 flex flex-wrap items-center gap-4">

                        <select
                            value={formData.mood}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    mood: e.target.value,
                                })
                            }
                            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">
                                Select Mood
                            </option>

                            {moods.map((mood) => (
                                <option key={mood} value={mood}>
                                    {mood}
                                </option>
                            ))}
                        </select>

                        {editingJournal && (
                            <div className="flex items-center text-sm text-gray-400">
                                <Calendar
                                    size={16}
                                    className="mr-2"
                                />

                                {new Date(
                                    editingJournal.created_at
                                ).toLocaleString()}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <textarea
                        required
                        rows={18}
                        placeholder="Start writing your thoughts..."
                        value={formData.content}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                content: e.target.value,
                            })
                        }
                        className="flex-1 w-full resize-none border-none text-lg leading-relaxed text-gray-700 outline-none placeholder:text-gray-300"
                    />

                    {/* Footer */}
                    <div className="mt-6 flex items-center justify-end gap-4 border-t border-gray-100 pt-6">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading
                                ? "Saving..."
                                : editingJournal
                                    ? "Update Journal"
                                    : "Create Journal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JournalFormModal;
