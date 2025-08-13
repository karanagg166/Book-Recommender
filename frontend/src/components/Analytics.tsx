import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, BookOpen, Users, Star, TrendingUp, Globe, Award } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Data shape returned by /analytics endpoint.
 */
interface AnalyticsData {
  total_books: number;
  total_authors: number;
  avg_rating: number;
  total_ratings: number;
  genre_distribution: { name: string; count: number; percentage: number }[];
  top_languages: { language: string; count: number; percentage: number }[];
  rating_distribution: { range: string; count: number; percentage: number }[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'genres' | 'languages' | 'ratings'>('overview');

  // Fetch analytics on mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        setData(json as AnalyticsData);
      } catch (err) {
        console.error('Failed loading analytics', err);
        toast.error('Failed to load analytics');
      }
    };
    fetchAnalytics();
  }, []);

  const placeholder: AnalyticsData = {
    total_books: 0,
    total_authors: 0,
    avg_rating: 0,
    total_ratings: 0,
    genre_distribution: [],
    top_languages: [],
    rating_distribution: [],
  };

  const analytics = data ?? placeholder;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: { title: string, value: string, icon: React.ElementType, color: string, subtitle: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const DistributionChart = ({ data: chartData, title, colorClass }: { data: { name?: string, language?: string, range?: string, count: number, percentage: number }[], title: string, colorClass: string }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      <div className="space-y-3">
        {chartData.map((item: { name?: string, language?: string, range?: string, count: number, percentage: number }, i: number) => (
          <motion.div
            key={item.name || item.language || item.range}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="w-20 text-sm text-gray-600 dark:text-gray-400">
              {item.name || item.language || item.range}
            </div>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${colorClass}`}
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
              />
            </div>
            <div className="w-16 text-sm text-gray-700 dark:text-gray-300 text-right">
              {item.percentage.toFixed(1)}%
            </div>
            <div className="w-20 text-sm text-gray-600 dark:text-gray-400 text-right">
              {formatNumber(item.count)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
          Book Analytics
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Explore comprehensive insights and statistics about our book collection, ratings, and reading trends.
        </p>
      </motion.div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Books"
          value={formatNumber(analytics.total_books)}
          icon={BookOpen}
          color="from-blue-500 to-cyan-500"
          subtitle="Available in catalog"
        />
        <StatCard
          title="Authors"
          value={formatNumber(analytics.total_authors)}
          icon={Users}
          color="from-green-500 to-emerald-500"
          subtitle="Unique writers"
        />
        <StatCard
          title="Average Rating"
          value={analytics.avg_rating.toFixed(2)}
          icon={Star}
          color="from-yellow-500 to-orange-500"
          subtitle="Out of 5.0"
        />
        <StatCard
          title="Total Ratings"
          value={formatNumber(analytics.total_ratings)}
          icon={TrendingUp}
          color="from-purple-500 to-pink-500"
          subtitle="Community reviews"
        />
      </div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'genres', label: 'Genres', icon: BookOpen },
            { id: 'languages', label: 'Languages', icon: Globe },
            { id: 'ratings', label: 'Ratings', icon: Star }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as 'overview' | 'genres' | 'languages' | 'ratings')}
                className={`p-3 rounded-xl transition-all ${
                  selectedTab === tab.id
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={selectedTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Collection Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Our comprehensive book database spans multiple genres, languages, and decades of literature. 
                Here&apos;s a snapshot of what makes our collection unique.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                <Award className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Quality Collection
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {analytics.rating_distribution.length >= 2 ? ((analytics.rating_distribution[4]?.count ?? 0 + analytics.rating_distribution[3]?.count ?? 0) / (analytics.total_books || 1) * 100).toFixed(1) : '0.0'}% 
                  of books rated 4.0+ stars
                </p>
              </div>

              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <Globe className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Global Reach
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {analytics.top_languages.length} languages represented in our collection
                </p>
              </div>

              <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                <BookOpen className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Diverse Genres
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {analytics.genre_distribution.length} major genres covering all interests
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'genres' && (
          <DistributionChart
            data={analytics.genre_distribution}
            title="Books by Genre"
            colorClass="bg-gradient-to-r from-purple-500 to-pink-500"
          />
        )}

        {selectedTab === 'languages' && (
          <DistributionChart
            data={analytics.top_languages}
            title="Books by Language"
            colorClass="bg-gradient-to-r from-blue-500 to-cyan-500"
          />
        )}

        {selectedTab === 'ratings' && (
          <DistributionChart
            data={analytics.rating_distribution}
            title="Books by Rating Range"
            colorClass="bg-gradient-to-r from-yellow-500 to-orange-500"
          />
        )}
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid md:grid-cols-2 gap-6"
      >
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-4" />
          <h3 className="text-xl font-bold mb-2">Most Popular Genre</h3>
          <p className="text-lg">
            {analytics.genre_distribution[0]?.name ?? 'N/A'} 
            <span className="text-sm opacity-90 ml-2">
              ({analytics.genre_distribution[0]?.percentage ?? 0}% of collection)
            </span>
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <Star className="w-8 h-8 mb-4" />
          <h3 className="text-xl font-bold mb-2">Quality Rating</h3>
          <p className="text-lg">
            {analytics.rating_distribution.length >= 2 ? ((analytics.rating_distribution[4]?.count ?? 0 + analytics.rating_distribution[3]?.count ?? 0) / (analytics.total_books || 1) * 100).toFixed(1) : '0.0'}% 
            <span className="text-sm opacity-90 ml-2">
              books rated 4.0+ stars
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
} 