import { useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Home() {
  const [genre, setGenre] = useState("");
  const [books, setBooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    if (!genre.trim()) {
      toast.error("Please enter a genre");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/recommend?genre=${genre}`);
      const data = await res.json();
      setBooks(data.recommendations);
    } catch (err) {
      toast.error("Error fetching books");
      setBooks(["Something went wrong"]);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-sky-50 via-white to-emerald-50 dark:from-black dark:to-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl transition duration-300 hover:shadow-indigo-400/40"
      >
        <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent mb-6 flex justify-center items-center gap-2">
          <BookOpen className="w-8 h-8" />
          Book Recommender
        </h1>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Enter genre (e.g. fantasy)"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="flex-grow border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-gray-900"
          />
          <button
            onClick={fetchRecommendations}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? "Loading..." : "Go"}
          </button>
        </div>

        {books.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-indigo-100/60 dark:bg-gray-700/50 rounded-xl p-4 space-y-3 transition hover:ring-2 hover:ring-indigo-400"
          >
            {books.map((book, i) => (
              <motion.li
                key={i}
                className="text-lg px-3 py-1 rounded-lg transition hover:bg-indigo-200 dark:hover:bg-indigo-800"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {book}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </motion.div>
    </main>
  );
}
