import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, TrendingUp, Compass, BarChart3, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

// Centralised API base; falls back to localhost during dev
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

interface HomePageProps {
  onPageChange: (page: string) => void;
}

interface GenreInfo {
  genre: string;
  total_books: number;
  avg_rating: number;
  keywords: string[];
  sample_books: string[];
}

export default function HomePage({ onPageChange }: HomePageProps) {
  const [quickGenre, setQuickGenre] = useState('');
  const [quickBooks, setQuickBooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [featuredGenres, setFeaturedGenres] = useState<GenreInfo[]>([]);

  // Fetch initial data
  useEffect(() => {
    fetchGenres();
    fetchFeaturedGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const res = await fetch(`${API_BASE}/genres`);
      const data = await res.json();
      setGenres(data.genres || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchFeaturedGenres = async () => {
    try {
      const featuredList = ['fantasy', 'romance', 'mystery', 'science_fiction'];
      const promises = featuredList.map(async (genre) => {
        const res = await fetch(`${API_BASE}/genre/${genre}/info`);
        return await res.json();
      });
      const results = await Promise.all(promises);
      setFeaturedGenres(results);
    } catch (error) {
      console.error('Error fetching featured genres:', error);
    }
  };

  const fetchQuickRecommendations = async () => {
    if (!quickGenre.trim()) {
      toast.error('Please enter a genre');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recommend?genre=${quickGenre}`);
      const data = await res.json();
      setQuickBooks(data.recommendations || []);
    } catch (error) {
      toast.error(`Error fetching recommendations: ${error}`);
      setQuickBooks(['Something went wrong']);
    }
    setLoading(false);
  };

  const features = [
    {
      id: 'genres',
      title: 'Genre Explorer',
      description: 'Discover books across 10+ genres with detailed insights',
      icon: Compass,
      color: 'from-purple-500 to-pink-500',
      stats: `${genres.length} genres available`
    },
    {
      id: 'search',
      title: 'Smart Search',
      description: 'Find books by title, author, or keywords with instant results',
      icon: Search,
      color: 'from-blue-500 to-cyan-500',
      stats: '11,000+ books searchable'
    },
    {
      id: 'popular',
      title: 'Popular Books',
      description: 'Trending and highly-rated books across all categories',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      stats: 'Updated daily'
    },
    {
      id: 'analytics',
      title: 'Book Analytics',
      description: 'Explore reading trends, ratings, and genre statistics',
      icon: BarChart3,
      color: 'from-orange-500 to-red-500',
      stats: 'Real-time insights'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Discover Your Next Great Read
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Powered by AI recommendations, explore over 11,000 books across multiple genres. 
            Find your perfect book match with personalized suggestions.
          </p>
        </motion.div>

        {/* Quick Recommendation Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Quick Genre Recommendation
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter genre (e.g. fantasy, romance, mystery)"
                value={quickGenre}
                onChange={(e) => setQuickGenre(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchQuickRecommendations()}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              />
              <motion.button
                onClick={fetchQuickRecommendations}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.button>
            </div>

            {quickBooks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-2"
              >
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Recommendations:</h4>
                <div className="grid gap-2">
                  {quickBooks.slice(0, 3).map((book, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                    >
                      {book}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Feature Cards */}
      <section>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200"
        >
          Explore All Features
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                onClick={() => onPageChange(feature.id)}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group"
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                  {feature.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-500">{feature.stats}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Featured Genres */}
      <section>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200"
        >
          Popular Genres
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredGenres.map((genre, index) => (
            <motion.div
              key={genre.genre}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
              onClick={() => onPageChange('genres')}
              className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold capitalize text-gray-800 dark:text-gray-200">
                  {genre.genre.replace('_', ' ')}
                </h3>
                <span className="text-2xl">
                  {genre.genre === 'fantasy' ? '🧙‍♂️' : 
                   genre.genre === 'romance' ? '💕' :
                   genre.genre === 'mystery' ? '🔍' : '🚀'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Books:</span>
                  <span className="font-medium">{genre.total_books}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Rating:</span>
                  <span className="font-medium">{genre.avg_rating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
              
              {genre.sample_books && genre.sample_books.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
                    Popular: {genre.sample_books[0]}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Favorite Book?</h2>
          <p className="text-xl opacity-90 mb-6">
            Join thousands of readers discovering amazing books with our AI-powered recommendations
          </p>
          <motion.button
            onClick={() => onPageChange('search')}
            className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Exploring Books
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
} 