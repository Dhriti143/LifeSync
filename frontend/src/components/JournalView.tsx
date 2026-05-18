import { X, Calendar, Heart } from "lucide-react";
import type { Journal } from "../types/journal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  journal: Journal | null;
}

const JournalViewModal = ({
  isOpen,
  onClose,
  journal,
}: Props) => {
  if (!isOpen || !journal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

      <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl md:h-[92vh] md:max-w-4xl md:rounded-3xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-5 text-white">

          <div>
            <h2 className="text-2xl font-bold">
              Journal Entry
            </h2>

            <p className="mt-1 text-sm text-white/80">
              Your thoughts and memories
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-white/20"
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-8 py-8">

          {/* MOOD + DATE */}
          <div className="mb-6 flex flex-wrap items-center gap-4">

            <div className="inline-flex items-center rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">

              <Heart
                size={16}
                className="mr-2"
              />

              {journal.mood || "No Mood"}
            </div>

            <div className="flex items-center text-sm text-gray-400">

              <Calendar
                size={16}
                className="mr-2"
              />

              {new Date(
                journal.created_at
              ).toLocaleString()}
            </div>
          </div>

          {/* TITLE */}
          <h1 className="mb-8 text-4xl font-black leading-tight text-gray-900">

            {journal.title}
          </h1>

          {/* CONTENT */}
          <div className="prose prose-lg max-w-none">

            <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700">

              {journal.content}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end border-t border-gray-100 px-8 py-5">

          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalViewModal;