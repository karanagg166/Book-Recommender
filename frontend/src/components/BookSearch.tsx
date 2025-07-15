import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Users, BookOpen, X } from 'lucide-react';
import { toast } from 'sonner';

interface BookResult {
  title: string;
  author: string;
  rating: number;
  ratings_count: number;
}

export default function BookSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [debouncedQuery]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      const res = await fetch(`http://localhost:8000/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResults(data.books || []);
    } catch (error) {
      console.error('Error searching books:', error);
      toast.error('Failed to search books');
      setResults([]);
    }
    
    setLoading(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const getStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-4 h-4">
          <Star className="w-4 h-4 text-gray-300 absolute" />
          <div className="overflow-hidden w-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 absolute" />
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
          Smart Book Search
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Search through our vast collection of over 11,000 books. Find your next great read by title, author, or keywords.
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-3xl mx-auto"
      >
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for books, authors, or keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 shadow-lg"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Search Stats */}
          {hasSearched && (
            <div className="flex items-center justify-between mt-3 text-sm text-gray-600 dark:text-gray-400">
              <span>
                {loading ? 'Searching...' : `${results.length} results found`}
              </span>
              {debouncedQuery && (
                <span>for &quot;{debouncedQuery}&quot;</span>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Search Suggestions */}
      {!hasSearched && !query && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Popular Searches
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {searchSuggestions.map((suggestion, i) => (
              <motion.button
                key={suggestion}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                onClick={() => setQuery(suggestion)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-gray-700 dark:text-gray-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

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
                          {getStarRating(book.rating)}
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {book.rating.toFixed(1)}
                        </span>
                      </div>
                      
                      {/* Ratings Count */}
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{formatNumber(book.ratings_count)} ratings</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    <button
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                      onClick={() => toast.info('Book details feature coming soon!')}
                    >
                      View Details
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
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <Search className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Smart Search
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Search by book titles, author names, or keywords. Our system will find the most relevant matches.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <BookOpen className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Instant Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Get real-time search results as you type. No need to press enter - just start typing!
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <Star className="w-8 h-8 text-yellow-500 mb-3" />
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Detailed Info
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              See ratings, review counts, and author information to help you choose your next read.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
} 