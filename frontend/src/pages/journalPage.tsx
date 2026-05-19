import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import JournalFormModal from "../components/JournalForm";
import JournalViewModal from "../components/JournalView";

import {
  getJournals,
  deleteJournal,
} from "../apis/journals";

import type { Journal } from "../types/journal";

import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  BookOpen,
} from "lucide-react";

const JournalPage = () => {
  const [journals, setJournals] = useState<
    Journal[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [filterMood, setFilterMood] =
    useState("All");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingJournal, setEditingJournal] =
    useState<Journal | null>(null);

  const [viewJournal, setViewJournal] =
    useState<Journal | null>(null);

  const [isViewOpen, setIsViewOpen] =
    useState(false);

  const moods = [
    "Happy",
    "Sad",
    "Calm",
    "Anxious",
    "Grateful",
    "Productive",
  ];

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const response = await getJournals();

      if (response.success) {
        setJournals(response.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch journals:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (
    journal: Journal | null = null
  ) => {
    setEditingJournal(journal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingJournal(null);
    setIsModalOpen(false);
  };

  const handleViewJournal = (
    journal: Journal
  ) => {
    setViewJournal(journal);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setViewJournal(null);
    setIsViewOpen(false);
  };

  const handleDelete = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this journal entry?"
    );

    if (!confirmed) return;

    try {
      await deleteJournal(id);

      setJournals((prev) =>
        prev.filter(
          (journal) => journal.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Error deleting journal:",
        error
      );
    }
  };

  const filteredJournals = journals.filter(
    (journal) => {
      const matchesSearch =
        journal.title
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        journal.content
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const matchesMood =
        filterMood === "All" ||
        journal.mood === filterMood;

      return (
        matchesSearch && matchesMood
      );
    }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Journal Entries
            </h1>

            <p className="text-gray-600">
              Document your thoughts and
              track your journey.
            </p>
          </div>

          <button
            onClick={() =>
              handleOpenModal()
            }
            className="flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-5 py-3 text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={20} />

            <span>New Entry</span>
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row">

          <div className="relative flex-1">

            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />

            <input
              type="text"
              placeholder="Search journals..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />
          </div>

          <div className="relative w-full md:w-56">

            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />

            <select
              value={filterMood}
              onChange={(e) =>
                setFilterMood(
                  e.target.value
                )
              }
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">
                All Moods
              </option>

              {moods.map((mood) => (
                <option
                  key={mood}
                  value={mood}
                >
                  {mood}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="py-20 text-center">

            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>

            <p className="mt-4 text-gray-600">
              Loading your entries...
            </p>
          </div>
        ) : filteredJournals.length ===
          0 ? (

          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">

            <p className="text-lg text-gray-500">
              No journal entries found.
            </p>

            <button
              onClick={() =>
                handleOpenModal()
              }
              className="mt-4 font-medium text-indigo-600 hover:underline"
            >
              Start by creating your
              first entry
            </button>
          </div>
        ) : (

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

            {filteredJournals.map(
              (journal) => (
                <div
                  key={journal.id}
                  className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
                >

                  {/* TOP */}
                  <div className="mb-4 flex items-start justify-between">

                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-medium ${
                        journal.mood
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {journal.mood ||
                        "No Mood"}
                    </span>

                    <div className="flex space-x-2 opacity-0 transition-opacity group-hover:opacity-100">

                      <button
                        onClick={() =>
                          handleViewJournal(
                            journal
                          )
                        }
                        className="text-gray-400 hover:text-indigo-600"
                      >
                        <BookOpen
                          size={18}
                        />
                      </button>

                      <button
                        onClick={() =>
                          handleOpenModal(
                            journal
                          )
                        }
                        className="text-gray-400 hover:text-indigo-600"
                      >
                        <Edit2
                          size={18}
                        />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            journal.id
                          )
                        }
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2
                          size={18}
                        />
                      </button>
                    </div>
                  </div>

                  {/* TITLE */}
                  <h3 className="mb-2 truncate text-xl font-semibold text-gray-900">

                    {journal.title}
                  </h3>

                  {/* CONTENT */}
                  <p className="mb-5 line-clamp-4 text-gray-600">

                    {journal.content}
                  </p>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between">

                    <div className="flex items-center text-xs text-gray-400">

                      <Calendar
                        size={14}
                        className="mr-1"
                      />

                      {new Date(
                        journal.created_at
                      ).toLocaleDateString()}
                    </div>

                    <button
                      onClick={() =>
                        handleViewJournal(
                          journal
                        )
                      }
                      className="text-sm font-medium text-indigo-600 hover:underline"
                    >
                      Read More
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>

      {/* CREATE / EDIT */}
      <JournalFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchJournals}
        editingJournal={
          editingJournal
        }
      />

      {/* VIEW */}
      <JournalViewModal
        isOpen={isViewOpen}
        onClose={handleCloseView}
        journal={viewJournal}
      />
    </div>
  );
};

export default JournalPage;
