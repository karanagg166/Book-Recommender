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
    <main className="min-h-screen bg-gradient-to-tr from-sky-50 via-white to-emerald-50 dark:from-black dark:to-gray-900 text-gray-900 dark:text-gray-100 p-6 font-sans transition-all">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl"
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
          <ul className="list-disc list-inside space-y-2 text-gray-800 dark:text-gray-200">
            {books.map((book, i) => (
              <li key={i} className="text-lg">{book}</li>
            ))}
          </ul>
        )}
      </motion.div>
    </main>
  );
}
