import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Users, Crown, Calendar } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for popular books since we don't have the endpoint yet
const mockPopularBooks = [
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    rating: 4.47,
    ratingsCount: 8234567,
    category: "Fantasy",
    year: 1997
  },
  {
    title: "To Kill a Mockingbird", 
    author: "Harper Lee",
    rating: 4.25,
    ratingsCount: 5234567,
    category: "Classic",
    year: 1960
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald", 
    rating: 3.93,
    ratingsCount: 4567890,
    category: "Classic",
    year: 1925
  },
  {
    title: "1984",
    author: "George Orwell",
    rating: 4.19,
    ratingsCount: 3456789,
    category: "Dystopian",
    year: 1949
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    rating: 4.27,
    ratingsCount: 3234567,
    category: "Romance", 
    year: 1813
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    rating: 3.80,
    ratingsCount: 2876543,
    category: "Classic",
    year: 1951
  }
];

interface Book {
  title: string;
  author: string;
  rating: number;
  ratingsCount: number;
  category: string;
  year: number;
}

export default function PopularBooks() {
  const [books] = useState<Book[]>(mockPopularBooks);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(mockPopularBooks);
  const [sortBy, setSortBy] = useState<'rating' | 'popularity' | 'recent'>('popularity');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(books.map(book => book.category.toLowerCase())))];

  useEffect(() => {
    filterAndSortBooks();
  }, [sortBy, filterCategory, books]);

  const filterAndSortBooks = () => {
    let filtered = books;

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = books.filter(book => 
        book.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return b.ratingsCount - a.ratingsCount;
        case 'recent':
          return b.year - a.year;
        default:
          return 0;
      }
    });

    setFilteredBooks(sorted);
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'fantasy': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'classic': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      'romance': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      'dystopian': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      'mystery': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
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
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredBooks.length} books
            {filterCategory !== 'all' && ` in ${filterCategory}`}
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
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(book.category)}`}>
                {book.category}
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
            {Math.max(...filteredBooks.map(book => book.year))}
          </h3>
          <p className="opacity-90">Latest Publication</p>
        </div>
      </motion.div>
    </div>
  );
} 