// Progress page - shows words practiced and stats
'use client';

import { useSyncExternalStore, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';

type ProgressData = {
  gamesPlayed: number;
  gamesWon: number;
  wordsPracticed: string[];
  lastPlayed: string | null;
};

const defaultProgress: ProgressData = {
  gamesPlayed: 0,
  gamesWon: 0,
  wordsPracticed: [],
  lastPlayed: null,
};

function getProgressFromStorage(): ProgressData {
  if (typeof window === 'undefined') return defaultProgress;
  const saved = localStorage.getItem('phonics-progress');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultProgress;
    }
  }
  return defaultProgress;
}

// Version counter to force re-render when localStorage changes in the same window
let storageVersion = 0;
const storageListeners = new Set<() => void>();

function subscribeToStorage(callback: () => void) {
  storageListeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    storageListeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function notifyStorageChange() {
  storageVersion++;
  storageListeners.forEach(listener => listener());
}

function getStorageSnapshot(): ProgressData & { _version: number } {
  return { ...getProgressFromStorage(), _version: storageVersion };
}

export default function ProgressPage() {
  const router = useRouter();
  const [, forceUpdate] = useState(0);
  
  // Use useSyncExternalStore to properly sync with localStorage
  const progressData = useSyncExternalStore(
    subscribeToStorage,
    getStorageSnapshot,
    () => ({ ...defaultProgress, _version: 0 }) // Server snapshot
  );
  
  // Extract progress without the version
  const progress = {
    gamesPlayed: progressData.gamesPlayed,
    gamesWon: progressData.gamesWon,
    wordsPracticed: progressData.wordsPracticed,
    lastPlayed: progressData.lastPlayed,
  };

  const uniqueWords = [...new Set(progress.wordsPracticed)];
  const winRate = progress.gamesPlayed > 0 
    ? Math.round((progress.gamesWon / progress.gamesPlayed) * 100) 
    : 0;

  const handleClearProgress = () => {
    if (confirm('Are you sure you want to clear all progress?')) {
      localStorage.removeItem('phonics-progress');
      notifyStorageChange();
      forceUpdate(n => n + 1);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-purple-400 to-indigo-600 p-4">
      <div className="container mx-auto max-w-md pt-12">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">📊 My Progress</h1>
          <p className="text-white/80">Track your learning journey</p>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="text-3xl font-bold text-indigo-600">
              {progress.gamesPlayed}
            </div>
            <div className="text-gray-600 text-sm">Games Played</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="text-3xl font-bold text-green-600">
              {progress.gamesWon}
            </div>
            <div className="text-gray-600 text-sm">Games Won</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="text-3xl font-bold text-orange-600">
              {uniqueWords.length}
            </div>
            <div className="text-gray-600 text-sm">Words Learned</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
            <div className="text-3xl font-bold text-pink-600">{winRate}%</div>
            <div className="text-gray-600 text-sm">Win Rate</div>
          </div>
        </motion.div>

        {/* Words practiced */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Words Practiced</h2>
          
          {uniqueWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {uniqueWords.map((word, i) => (
                <motion.span
                  key={word}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.03 }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No words practiced yet. Play a game to start learning!
            </p>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={() => router.push('/setup')}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Play a Game 🎮
          </Button>
          
          {progress.gamesPlayed > 0 && (
            <Button
              variant="outline"
              onClick={handleClearProgress}
              className="w-full"
            >
              Clear Progress
            </Button>
          )}
        </motion.div>

        {/* Back to home */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => router.push('/')}
            className="text-white/80 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
