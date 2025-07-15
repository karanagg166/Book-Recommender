import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Heart, Users, Star } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

interface Recommendation {
  title: string;
  author: string;
  rating?: number;
  similarity?: number;
  ratings_count?: number;
}

interface Preferences {
  high_rating: boolean;
  popular: boolean;
  language: string;
  sentiment_positive: boolean;
}

export default function PreferenceWizard() {
  const [prefs, setPrefs] = useState<Preferences>({
    high_rating: true,
    popular: true,
    language: 'eng',
    sentiment_positive: false,
  });
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Recommendation[]>([]);

  // Fetch language list (top 5) from analytics once
  useEffect(() => {
    const fetchLangs = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics`);
        const data = await res.json();
        const langs = (data.top_languages || []).map((l: { language: string }) => l.language);
        if (langs.length) setLanguages(langs);
      } catch {
        // Ignore
      }
    };
    fetchLangs();
  }, []);

  const submit = async () => {
    setLoading(true);
    setResults([]);
    try {
      const body: { [key: string]: boolean | string } = {};
      Object.entries(prefs).forEach(([k, v]) => {
        if (v !== null && v !== undefined) body[k] = v;
      });
      const res = await fetch(`${API_BASE}/recommend/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      setResults(json.recommendations || []);
      if ((json.recommendations || []).length === 0) toast.info('No recommendations found for these preferences.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-4">
          Personalized Recommendations
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          Select your preferences and let our AI suggest books tailored to your taste.
        </p>
      </motion.div>

      {/* Preference Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-3xl mx-auto space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* High Rating Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={prefs.high_rating} onChange={e => setPrefs({ ...prefs, high_rating: e.target.checked })}
              className="form-checkbox h-5 w-5 text-teal-600" />
            <span className="text-gray-700 dark:text-gray-300">Prefer highly rated books (4.0+)</span>
          </label>

          {/* Popular Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={prefs.popular} onChange={e => setPrefs({ ...prefs, popular: e.target.checked })}
              className="form-checkbox h-5 w-5 text-teal-600" />
            <span className="text-gray-700 dark:text-gray-300">Prefer popular books (many ratings)</span>
          </label>

          {/* Sentiment Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={prefs.sentiment_positive} onChange={e => setPrefs({ ...prefs, sentiment_positive: e.target.checked })}
              className="form-checkbox h-5 w-5 text-teal-600" />
            <span className="text-gray-700 dark:text-gray-300">Positive sentiment reviews</span>
          </label>

          {/* Language Select */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">Language</label>
            <select value={prefs.language} onChange={e => setPrefs({ ...prefs, language: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100">
              {(languages.length ? languages : ['eng', 'spa', 'fre']).map(l => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <motion.button onClick={submit} disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Sliders className="w-5 h-5 inline-block mr-2" /> Get Recommendations
        </motion.button>
      </motion.div>

      {/* Results */}
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((book, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold line-clamp-2 text-gray-800 dark:text-gray-200">{book.title}</h3>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">#{i + 1}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">by <span className="font-medium">{book.author}</span></p>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {book.rating && (
                  <span className="flex items-center gap-1"><Star className="w-4 h-4" /> {book.rating.toFixed(1)}</span>
                )}
                {book.ratings_count && (
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {formatNumber(book.ratings_count)}</span>
                )}
                {book.similarity && (
                  <span className="text-teal-600 dark:text-teal-400">{Math.round(book.similarity * 100)}% match</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
} 