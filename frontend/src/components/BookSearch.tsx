import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Star, Users, Heart, Sparkles, Smile, Frown } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Centralised API base; falls back to localhost during dev
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

interface Book {
  title: string;
  author: string;
  rating?: number;
  ratings_count?: number;
}

interface SimilarBook {
  title: string;
  author: string;
  rating?: number;
  similarity?: number;
  ratings_count?: number;
}

export default function BookSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Similar books state
  const [similarBooks, setSimilarBooks] = useState<SimilarBook[]>([]);
  const [similarBooksLoading, setSimilarBooksLoading] = useState(false);
  const [selectedBookTitle, setSelectedBookTitle] = useState<string>('');
  const [showSimilarBooks, setShowSimilarBooks] = useState(false);

  // Sentiment state
  const [reviewText, setReviewText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [sentimentResult, setSentimentResult] = useState<{ sentiment: string; score: number; confidence: number } | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchBooks = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(debouncedQuery)}`);
      const data = await res.json();
      setResults(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to search books. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch search results
  useEffect(() => {
    if (debouncedQuery.trim()) {
      fetchBooks();
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [debouncedQuery]);

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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const searchSuggestions = [
    'Harry Potter',
    'Stephen King',
    'Agatha Christie',
    'Lord of the Rings',
    'Jane Austen',
    'Game of Thrones',
    'The Alchemist',
    'To Kill a Mockingbird'
  ];

  // Sentiment fetcher
  const analyzeSentiment = async () => {
    if (!reviewText.trim()) {
      toast.error('Please enter some text first');
      return;
    }
    setAnalyzing(true);
    setSentimentResult(null);
    try {
      const res = await fetch(`${API_BASE}/sentiment?text=${encodeURIComponent(reviewText)}`);
      const data = await res.json();
      if (res.ok) {
        setSentimentResult({ sentiment: data.sentiment, score: data.score, confidence: data.confidence });
      } else {
        throw new Error(data.detail || 'Error');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to analyze sentiment');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Book Search
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discover your next favorite book by searching through our extensive collection of literature.
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for books by title or author..."
            className="w-full pl-12 pr-4 py-4 text-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-lg"
          />
        </div>
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
                        <div className="w-12 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
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
                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <Heart className="w-3 h-3" />
                              <span>{Math.round((book.similarity || 0) * 100)}% match</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => fetchSimilarBooks(book.title)}
                          className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Search Results */}
      {!loading && hasSearched && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {results.length > 0 ? (
            results.map((book, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start space-x-4">
                  {/* Book Cover Placeholder */}
                  <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Book Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
                      {book.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      by <span className="font-medium">{book.author}</span>
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {getStarRating(book.rating || 0)}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {(book.rating || 0).toFixed(1)}
                        </span>
                      </div>
                      
                      {/* Ratings Count */}
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{formatNumber(book.ratings_count || 0)} ratings</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex gap-2">
                    <button
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                      onClick={() => toast.success('Book details feature coming soon!')}
                    >
                      View Details
                    </button>
                    <button
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                      onClick={() => fetchSimilarBooks(book.title)}
                    >
                      <Sparkles className="w-4 h-4" />
                      More Like This
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  No Books Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We couldn&apos;t find any books matching &quot;{debouncedQuery}&quot;.
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
                  <p>Try searching for:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Different keywords or spelling</li>
                    <li>Author names</li>
                    <li>Book series names</li>
                    <li>Broader search terms</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Help Section */}
      {!hasSearched && !query && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Popular Searches
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started with these popular book searches:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {searchSuggestions.map((suggestion, i) => (
              <motion.button
                key={suggestion}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                onClick={() => setQuery(suggestion)}
                className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800/40 dark:hover:to-purple-800/40 rounded-xl border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-medium transition-all text-sm hover:shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sentiment Analyzer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 space-y-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-500" /> Sentiment Analyzer
        </h2>
        <textarea
          rows={3}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Paste a review or any text to see its sentiment..."
          className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex items-center gap-4">
          <button
            onClick={analyzeSentiment}
            disabled={analyzing}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            Analyze
          </button>
          {sentimentResult && (
            <div className="flex items-center gap-2 text-lg font-medium">
              {sentimentResult.sentiment === 'positive' ? (
                <Smile className="w-6 h-6 text-green-500" />
              ) : (
                <Frown className="w-6 h-6 text-red-500" />
              )}
              <span className="text-gray-800 dark:text-gray-200 capitalize">{sentimentResult.sentiment}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">({Math.round(sentimentResult.score * 100)}% positive)</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 