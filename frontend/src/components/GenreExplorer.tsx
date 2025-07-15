import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Star, Info, Users, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

interface GenreInfo {
  genre: string;
  total_books: number;
  avg_rating: number;
  keywords: string[];
  sample_books: string[];
}

interface SimilarBook {
  title: string;
  author: string;
  rating?: number;
  similarity?: number;
  ratings_count?: number;
}

export default function GenreExplorer() {
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [genreInfo, setGenreInfo] = useState<GenreInfo | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);

  // Similar books state
  const [similarBooks, setSimilarBooks] = useState<SimilarBook[]>([]);
  const [similarBooksLoading, setSimilarBooksLoading] = useState(false);
  const [selectedBookTitle, setSelectedBookTitle] = useState<string>('');
  const [showSimilarBooks, setShowSimilarBooks] = useState(false);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const res = await fetch(`${API_BASE}/genres`);
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
      const res = await fetch(`${API_BASE}/genre/${genre}/info`);
      const data = await res.json();
      setGenreInfo(data);
    } catch (error) {
      console.error('Error fetching genre info:', error);
      toast.error('Failed to load genre information');
    } finally {
      setInfoLoading(false);
    }
  };

  const fetchRecommendations = async (genre: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recommend?genre=${genre}`);
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarBooks = async (bookTitle: string) => {
    setSimilarBooksLoading(true);
    setSelectedBookTitle(bookTitle);
    setShowSimilarBooks(true);
    try {
      const res = await fetch(`${API_BASE}/books/similar?title=${encodeURIComponent(bookTitle)}&limit=6`);
      const data = await res.json();
      setSimilarBooks(data.similar_books || []);
      if (data.similar_books && data.similar_books.length > 0) {
        toast.success(`Found ${data.similar_books.length} similar books!`);
      } else {
        toast.success('No similar books found for this title.');
      }
    } catch (error) {
      console.error('Error fetching similar books:', error);
      toast.error('Failed to find similar books. Please try again.');
      setSimilarBooks([]);
    } finally {
      setSimilarBooksLoading(false);
    }
  };

  const closeSimilarBooks = () => {
    setShowSimilarBooks(false);
    setSimilarBooks([]);
    setSelectedBookTitle('');
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    fetchGenreInfo(genre);
    fetchRecommendations(genre);
  };

  const getGenreEmoji = (genre: string) => {
    const emojiMap: { [key: string]: string } = {
      fantasy: '🧙‍♂️',
      romance: '💕',
      mystery: '🔍',
      science_fiction: '🚀',
      horror: '👻',
      adventure: '⚔️',
      biography: '👤',
      history: '📚',
      thriller: '😱',
      fiction: '📖',
      non_fiction: '📝',
      young_adult: '🌟',
      children: '🧸',
      poetry: '✍️',
      drama: '🎭'
    };
    return emojiMap[genre] || '📚';
  };

  const getGenreColor = (genre: string) => {
    const colorMap: { [key: string]: string } = {
      fantasy: 'from-purple-500 to-indigo-500',
      romance: 'from-pink-500 to-red-500',
      mystery: 'from-gray-500 to-slate-600',
      science_fiction: 'from-blue-500 to-cyan-500',
      horror: 'from-gray-800 to-red-900',
      adventure: 'from-orange-500 to-yellow-500',
      biography: 'from-green-500 to-emerald-500',
      history: 'from-amber-600 to-orange-600',
      thriller: 'from-red-600 to-pink-600',
      fiction: 'from-indigo-500 to-purple-500',
      non_fiction: 'from-teal-500 to-green-500',
      young_adult: 'from-violet-500 to-purple-500',
      children: 'from-yellow-400 to-orange-400',
      poetry: 'from-rose-500 to-pink-500',
      drama: 'from-indigo-600 to-blue-600'
    };
    return colorMap[genre] || 'from-gray-500 to-gray-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const getStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-current" />
      );
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
          </div>
        </div>
      );
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }
    
    return stars;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Genre Explorer
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Dive deep into different genres and discover books that match your interests and reading preferences.
        </p>
      </motion.div>

      {/* Genre Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        {genres.map((genre, i) => (
          <motion.button
            key={genre}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            onClick={() => handleGenreSelect(genre)}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-center hover:shadow-lg ${
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

      {/* Similar Books Modal */}
      <AnimatePresence>
        {showSimilarBooks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeSimilarBooks}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-4xl max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Books Similar to &quot;{selectedBookTitle}&quot;
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Based on content similarity and user preferences</span>
                  </div>
                </div>
                <button
                  onClick={closeSimilarBooks}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              {similarBooksLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-start space-x-4 p-4 bg-gray-100 dark:bg-slate-700 rounded-xl">
                        <div className="w-12 h-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {similarBooks.length > 0 ? (
                    similarBooks.map((book, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                      >
                        <div className="w-12 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1 line-clamp-1">
                            {book.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            by {book.author}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              {getStarRating(book.rating || 0)}
                              <span className="text-gray-700 dark:text-gray-300 ml-1">
                                {(book.rating || 0).toFixed(1)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <Users className="w-3 h-3" />
                              <span>{formatNumber(book.ratings_count || 0)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                              <Heart className="w-3 h-3" />
                              <span>{Math.round((book.similarity || 0) * 100)}% match</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => fetchSimilarBooks(book.title)}
                          className="px-3 py-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                        >
                          More Like This
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No similar books found for this title.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
                      Related Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {genreInfo.keywords.slice(0, 12).map((keyword, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium"
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
                    <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
                      Popular Books in This Genre
                    </h3>
                    <div className="space-y-2">
                      {genreInfo.sample_books.map((book, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {i + 1}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 font-medium">
                              {book}
                            </p>
                          </div>
                          <button
                            onClick={() => fetchSimilarBooks(book)}
                            className="px-3 py-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Similar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Failed to load genre information</p>
              </div>
            )}
          </div>

          {/* Recommendations */}
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
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 dark:text-gray-200 font-medium">
                            {book}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => fetchSimilarBooks(book)}
                        className="px-3 py-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Similar
                      </button>
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