import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import JournalFormModal from "../components/JournalForm";
import JournalViewModal from "../components/JournalView";
import { useAuth } from "../context/authContext";
import { getJournals } from "../apis/journals";
import { getTodayQuote } from "../apis/quotes";
import type { Journal } from "../types/journal";
import {BookOpen,ArrowRight,Plus,Sparkles,Calendar} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  const [journals, setJournals] =
    useState<Journal[]>([]);

  const [quote, setQuote] = useState<{
    text: string;
    author: string;
  } | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [viewJournal, setViewJournal] =
    useState<Journal | null>(null);

  const [isViewOpen, setIsViewOpen] =
    useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [journalRes, quoteRes] =
        await Promise.all([
          getJournals(0, 4),

          getTodayQuote(),
        ]);

      if (journalRes.success) {
        setJournals(journalRes.data);
      }

      if (
        quoteRes.success &&
        quoteRes.data
      ) {
        setQuote(quoteRes.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Navbar />

      {/* MOBILE FAB */}
      <button
        onClick={() =>
          setIsModalOpen(true)
        }
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-2xl transition hover:scale-110 hover:bg-indigo-700 md:hidden"
      >
        <Plus size={28} />
      </button>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">

        {/* HERO */}
        <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 shadow-2xl sm:mb-12 sm:p-10 md:p-14">

          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>

          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-pink-300/20 blur-3xl"></div>

          <div className="relative z-10 flex flex-col gap-10 xl:flex-row xl:items-center xl:justify-between">

            <div className="max-w-3xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs text-white/90 backdrop-blur-md sm:text-sm">

                <Sparkles size={16} />

                Your safe journaling sanctuary
              </div>

              <h1 className="mb-4 text-3xl font-black leading-tight text-white sm:text-5xl">

                Welcome back,
                <br />

                <span className="capitalize">
                  {user?.name ||
                    "User"}
                </span>
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">

                Reflect on your thoughts,
                emotions, and experiences
                beautifully every day.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">

                <button
                  onClick={() =>
                    setIsModalOpen(true)
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-indigo-600 shadow-lg transition hover:scale-105 hover:bg-gray-100"
                >
                  <Plus size={18} />

                  New Journal
                </button>

                <Link
                  to="/journals"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  <BookOpen size={18} />

                  View Journals
                </Link>
              </div>
            </div>

            {/* QUOTE */}
            <div className="w-full xl:max-w-sm">

              <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">

                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/60">

                  Quote of the Day
                </p>

                {loading ? (
                  <div className="animate-pulse space-y-3">

                    <div className="h-4 rounded bg-white/20"></div>

                    <div className="h-4 w-5/6 rounded bg-white/20"></div>

                    <div className="h-4 w-4/6 rounded bg-white/20"></div>
                  </div>
                ) : (
                  <>
                    <p className="mb-6 text-xl italic leading-relaxed text-white sm:text-2xl">

                      "
                      {quote?.text ||
                        "Write for your soul and heal your mind."}
                      "
                    </p>

                    <p className="font-medium text-white/80">

                      —{" "}
                      {quote?.author ||
                        "Unknown"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* RECENT JOURNALS */}
        <section>

          <div className="mb-8 flex items-center justify-between">

            <div>
              <h2 className="text-3xl font-black text-gray-900">

                Recent Journals
              </h2>

              <p className="mt-1 text-gray-500">

                Your latest reflections
                and memories.
              </p>
            </div>

            <Link
              to="/journals"
              className="inline-flex items-center gap-2 font-semibold text-indigo-600 transition hover:gap-3"
            >
              View all

              <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-3xl border bg-white p-6"
                >

                  <div className="mb-4 h-5 w-1/2 rounded bg-gray-200"></div>

                  <div className="mb-2 h-4 rounded bg-gray-100"></div>

                  <div className="mb-6 h-4 w-4/6 rounded bg-gray-100"></div>
                </div>
              ))}
            </div>
          ) : journals.length ===
            0 ? (

            <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-10 text-center sm:p-16">

              <h3 className="mb-3 text-2xl font-bold text-gray-900">

                No journal entries yet
              </h3>

              <button
                onClick={() =>
                  setIsModalOpen(true)
                }
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus size={18} />

                Create First Entry
              </button>
            </div>
          ) : (

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              {journals.map((journal) => (
                <div
                  key={journal.id}
                  className="group rounded-[2rem] border border-white bg-white/80 p-6 shadow-md backdrop-blur-md transition hover:-translate-y-1 hover:shadow-2xl"
                >

                  <div className="mb-5 flex items-start justify-between gap-4">

                    <span className="rounded-xl bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">

                      {journal.mood ||
                        "No Mood"}
                    </span>

                    <button
                      onClick={() =>
                        handleViewJournal(
                          journal
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
                    >
                      <BookOpen size={18} />
                    </button>
                  </div>

                  <h3 className="mb-3 line-clamp-1 text-2xl font-bold text-gray-900">

                    {journal.title}
                  </h3>

                  <p className="mb-6 line-clamp-4 leading-relaxed text-gray-600">

                    {journal.content}
                  </p>

                  <div className="flex items-center justify-between">

                    <div className="flex items-center text-sm text-gray-400">

                      <Calendar
                        size={15}
                        className="mr-2"
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
              ))}
            </div>
          )}
        </section>
      </main>

      {/* CREATE */}
      <JournalFormModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        onSuccess={
          fetchDashboardData
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

export default Dashboard;