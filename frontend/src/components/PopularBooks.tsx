import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Users, Crown, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '../utils/api';

/**
 * Book object returned by /books/popular endpoint.
 * `year` is computed client-side from publication date if provided;
 * if unavailable, books are sorted without the "recent" criterion.
 */
interface Book {
  title: string;
  author: string;
  rating: number;
  ratingsCount: number;
  language?: string; // used as a surrogate category filter
  year?: number;     // optional – not guaranteed by API
}

export default function PopularBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'popularity' | 'recent'>('popularity');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  /**
   * Fetch popular books once on mount. The backend already returns
   * books sorted by rating – front-end re-sorts as needed.
   */
  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        const res = await fetch(`${API_BASE}/books/popular?limit=50&min_ratings=1000`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();

        // Normalise keys for UI
        const hydrated: Book[] = (data.books || []).map((b: Record<string, unknown>) => ({
          title: b.title,
          author: b.author,
          rating: b.rating,
          ratingsCount: b.ratings_count,
          language: b.language,
          year: (b.publication_year as number | undefined) ?? undefined,
        }));

        setBooks(hydrated);
        setFilteredBooks(hydrated);
      } catch (err) {
        console.error('Error loading popular books', err);
        toast.error('Failed to load popular books');
      }
    };

    fetchPopularBooks();
  }, []);

  /**
   * Compute language list from current books (memoised for perf).
   */
  const languages = useMemo(() => {
    const langs = new Set<string>();
    books.forEach((b) => b.language && langs.add(b.language.toLowerCase()));
    return ['all', ...Array.from(langs)];
  }, [books]);

  /**
   * Whenever sort or language filter changes, recompute view list.
   */
  useEffect(() => {
    if (!books.length) return;

    let view = books;

    if (filterLanguage !== 'all') {
      view = view.filter((b) => (b.language || 'unknown').toLowerCase() === filterLanguage);
    }

    view = [...view].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return b.ratingsCount - a.ratingsCount;
        case 'recent':
          return (b.year ?? 0) - (a.year ?? 0);
        default:
          return 0;
      }
    });

    setFilteredBooks(view);
  }, [books, sortBy, filterLanguage]);

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

  const getLanguageColor = (lang: string) => {
    // Simple deterministic colour palette based on first letter for variety
    const letter = lang[0]?.toLowerCase() || 'x';
    const palette: Record<string, string> = {
      a: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      b: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      c: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
      d: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
      e: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      f: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
      g: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      h: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      i: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
      j: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      k: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      l: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      m: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      n: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
      o: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
      p: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return palette[letter] || palette.default;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          Popular Books
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover the most loved books by readers worldwide. From timeless classics to modern bestsellers.
        </p>
      </motion.div>

      {/* Filters and Sorting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Sort by
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'popularity', label: 'Most Popular', icon: Users },
                { id: 'rating', label: 'Highest Rated', icon: Star },
                { id: 'recent', label: 'Most Recent', icon: Calendar }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSortBy(id as 'rating' | 'popularity' | 'recent')}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    sortBy === id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Category
            </label>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {lang === 'all' ? 'All Languages' : lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredBooks.length} books
            {filterLanguage !== 'all' && ` in ${filterLanguage}`}
            {sortBy === 'popularity' && ' sorted by popularity'}
            {sortBy === 'rating' && ' sorted by rating'}
            {sortBy === 'recent' && ' sorted by publication year'}
          </p>
        </div>
      </motion.div>

      {/* Books Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredBooks.map((book, i) => (
          <motion.div
            key={`${book.title}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            {/* Rank Badge */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {i + 1}
                </div>
                {i < 3 && <Crown className="w-5 h-5 text-yellow-500" />}
              </div>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(book.language || 'unknown')}`}>
                {(book.language || 'unk').toUpperCase()}
              </span>
            </div>

            {/* Book Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 line-clamp-2">
                {book.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400">
                by <span className="font-medium">{book.author}</span>
              </p>
              
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Published {book.year}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {getStarRating(book.rating)}
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {book.rating.toFixed(2)}
                </span>
              </div>

              {/* Popularity */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{formatNumber(book.ratingsCount)} ratings</span>
              </div>
            </div>

            {/* Action */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => toast.info('Book details feature coming soon!')}
                className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
              >
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid md:grid-cols-3 gap-6"
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-3" />
          <h3 className="text-2xl font-bold mb-1">
            {formatNumber(filteredBooks.reduce((sum, book) => sum + book.ratingsCount, 0))}
          </h3>
          <p className="opacity-90">Total Ratings</p>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
          <Star className="w-8 h-8 mb-3" />
          <h3 className="text-2xl font-bold mb-1">
            {(filteredBooks.reduce((sum, book) => sum + book.rating, 0) / filteredBooks.length).toFixed(1)}
          </h3>
          <p className="opacity-90">Average Rating</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <Crown className="w-8 h-8 mb-3" />
          <h3 className="text-2xl font-bold mb-1">
            {Math.max(...filteredBooks.map(book => book.year ?? 0))}
          </h3>
          <p className="opacity-90">Latest Publication</p>
        </div>
      </motion.div>
    </div>
  );
} 