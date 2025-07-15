import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Star, Info } from 'lucide-react';
import { toast } from 'sonner';

interface GenreInfo {
  genre: string;
  total_books: number;
  avg_rating: number;
  keywords: string[];
  sample_books: string[];
}

export default function GenreExplorer() {
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [genreInfo, setGenreInfo] = useState<GenreInfo | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);

  // Fetch genres on component mount
  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const res = await fetch('http://localhost:8000/genres');
      const data = await res.json();
      setGenres(data.genres || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
      toast.error('Failed to load genres');
    }
  };

  const fetchGenreInfo = async (genre: string) => {
    setInfoLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/genre/${genre}/info`);
      const data = await res.json();
      setGenreInfo(data);
    } catch (error) {
      console.error('Error fetching genre info:', error);
      toast.error('Failed to load genre information');
    }
    setInfoLoading(false);
  };

  const fetchRecommendations = async (genre: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/recommend?genre=${genre}`);
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
      setRecommendations([]);
    }
    setLoading(false);
  };

  const handleGenreSelect = async (genre: string) => {
    setSelectedGenre(genre);
    setGenreInfo(null);
    setRecommendations([]);
    
    // Fetch both info and recommendations in parallel
    await Promise.all([
      fetchGenreInfo(genre),
      fetchRecommendations(genre)
    ]);
  };

  const getGenreEmoji = (genre: string) => {
    const emojiMap: Record<string, string> = {
      fantasy: '🧙‍♂️',
      romance: '💕',
      mystery: '🔍',
      science_fiction: '🚀',
      horror: '👻',
      adventure: '🗺️',
      biography: '👤',
      history: '📚',
      philosophy: '🤔',
      self_help: '💪'
    };
    return emojiMap[genre] || '📖';
  };

  const getGenreColor = (genre: string) => {
    const colorMap: Record<string, string> = {
      fantasy: 'from-purple-500 to-pink-500',
      romance: 'from-pink-500 to-rose-500',
      mystery: 'from-gray-600 to-gray-800',
      science_fiction: 'from-blue-500 to-cyan-500',
      horror: 'from-red-600 to-orange-600',
      adventure: 'from-green-500 to-emerald-500',
      biography: 'from-amber-500 to-yellow-500',
      history: 'from-brown-500 to-amber-600',
      philosophy: 'from-indigo-500 to-purple-500',
      self_help: 'from-teal-500 to-green-500'
    };
    return colorMap[genre] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Genre Explorer
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover books across different genres. Click on any genre to explore detailed insights and get personalized recommendations.
        </p>
      </motion.div>

      {/* Genre Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {genres.map((genre, index) => (
          <motion.button
            key={genre}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            onClick={() => handleGenreSelect(genre)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedGenre === genre
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 bg-white dark:bg-slate-800'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-3xl mb-2">{getGenreEmoji(genre)}</div>
            <div className="text-sm font-medium capitalize text-gray-800 dark:text-gray-200">
              {genre.replace('_', ' ')}
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Selected Genre Information */}
      {selectedGenre && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-2 gap-8"
        >
          {/* Genre Info Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getGenreColor(selectedGenre)} flex items-center justify-center text-2xl`}>
                {getGenreEmoji(selectedGenre)}
              </div>
              <div>
                <h2 className="text-2xl font-bold capitalize text-gray-800 dark:text-gray-200">
                  {selectedGenre.replace('_', ' ')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Genre Overview</p>
              </div>
            </div>

            {infoLoading ? (
              <div className="space-y-4">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded"></div>
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2"></div>
              </div>
            ) : genreInfo ? (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Books</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {genreInfo.total_books.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {genreInfo.avg_rating ? genreInfo.avg_rating.toFixed(1) : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                {genreInfo.keywords && genreInfo.keywords.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                      Related Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {genreInfo.keywords.slice(0, 8).map((keyword, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample Books */}
                {genreInfo.sample_books && genreInfo.sample_books.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                      Popular Books in This Genre
                    </h3>
                    <div className="space-y-2">
                      {genreInfo.sample_books.slice(0, 3).map((book, i) => (
                        <div
                          key={i}
                          className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                        >
                          {book}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Recommendations Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Recommended Books
              </h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 h-12 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((book, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 dark:text-gray-200 font-medium">
                          {book}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a genre to see recommendations</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Help Text */}
      {!selectedGenre && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-12"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
            <Info className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Choose a Genre to Explore
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Click on any genre above to discover detailed information, statistics, 
              and personalized book recommendations tailored to your interests.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
} 